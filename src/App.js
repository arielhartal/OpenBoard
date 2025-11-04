import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PostList from "./PostList";
import PostDetails from "./PostDetails";
import "./App.css";
import AddPost from "./AddPost";
import {
  decoratePostWithUser,
  enrichWithUsers,
  getRandomUser,
  getUserById,
} from "./postUtils";

const STORAGE_KEY = "openboard.posts";
const PROFILE_STORAGE_KEY = "openboard.profile";
const FILTER_OPTIONS = [
  { id: "latest", label: "Latest" },
  { id: "likes", label: "Most liked" },
  { id: "local", label: "My posts" },
  { id: "bookmarked", label: "Bookmarked" },
];
const SEED_LIMIT = 30;

const DEFAULT_PROFILE = {
  id: "local-user",
  name: "You",
  handle: "@you",
  avatarColor: "#6366f1",
};

function deriveAvatarInitial(name, handle) {
  const trimmedName = (name || "").trim();
  if (trimmedName) {
    return trimmedName[0].toUpperCase();
  }
  const trimmedHandle = (handle || "").replace(/^@/, "").trim();
  if (trimmedHandle) {
    return trimmedHandle[0].toUpperCase();
  }
  return "U";
}

function sanitizeProfile(input) {
  const base = input || {};
  const name = base.name?.trim() || DEFAULT_PROFILE.name;
  let handle = base.handle?.trim() || DEFAULT_PROFILE.handle;
  if (!handle.startsWith("@")) {
    handle = `@${handle}`;
  }
  const colorCandidate = base.avatarColor?.trim() || DEFAULT_PROFILE.avatarColor;
  const isValidColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorCandidate);
  const avatarColor = isValidColor ? colorCandidate : DEFAULT_PROFILE.avatarColor;

  return {
    id: base.id || DEFAULT_PROFILE.id,
    name,
    handle,
    avatarColor,
    avatarInitial: deriveAvatarInitial(name, handle),
  };
}

function profileToAuthor(profile) {
  return {
    id: profile.id,
    name: profile.name,
    handle: profile.handle,
    avatarColor: profile.avatarColor,
    avatarInitial: profile.avatarInitial,
  };
}

function applyPersonalization(posts, profile) {
  return posts.map((post) => {
    const likedByRaw = Array.isArray(post.likedBy) ? post.likedBy : [];
    const bookmarkedByRaw = Array.isArray(post.bookmarkedBy)
      ? post.bookmarkedBy
      : [];

    const likedBy = Array.from(new Set(likedByRaw));
    const bookmarkedBy = Array.from(new Set(bookmarkedByRaw));

    return {
      ...post,
      ownerId: post.ownerId ?? null,
      likedBy,
      bookmarkedBy,
      likedByMe: likedBy.includes(profile.id),
      bookmarkedByMe: bookmarkedBy.includes(profile.id),
    };
  });
}

function loadStoredProfile() {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return sanitizeProfile(DEFAULT_PROFILE);
    const parsed = JSON.parse(raw);
    return sanitizeProfile(parsed);
  } catch {
    return sanitizeProfile(DEFAULT_PROFILE);
  }
}

function mapPostsForStorage(posts) {
  return posts.map(({ likedByMe, bookmarkedByMe, ...rest }) => rest);
}

function App() {
  const [profile, setProfile] = useState(() => sanitizeProfile(loadStoredProfile()));
  const [profileDraft, setProfileDraft] = useState(profile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setProfileDraft(profile);
  }, [profile]);

  useEffect(() => {
    try {
      const storedPostsRaw = window.localStorage.getItem(STORAGE_KEY);
      if (storedPostsRaw) {
        try {
          const parsed = JSON.parse(storedPostsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const hydrated = parsed.map((post, index) => {
              const fallbackOwner =
                post.ownerId ??
                (post.author?.id && post.author.id === profile.id
                  ? profile.id
                  : null);
              return {
                ...post,
                source: post.source ?? "local",
                comments: Array.isArray(post.comments) ? post.comments : [],
                likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
                bookmarkedBy: Array.isArray(post.bookmarkedBy)
                  ? post.bookmarkedBy
                  : [],
                ownerId: fallbackOwner,
                id: post.id ?? index + 1,
              };
            });
            setPosts(applyPersonalization(enrichWithUsers(hydrated), profile));
            setLoading(false);
            return;
          }
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      /* ignore localStorage issues */
    }

    fetch(`https://jsonplaceholder.typicode.com/posts?_limit=${SEED_LIMIT}`)
      .then((res) => res.json())
      .then((data) => {
        const seeded = data.map((post, index) => ({
          ...post,
          id: post.id ?? index + 1,
          source: "seed",
          comments: [],
          likedBy: [],
          bookmarkedBy: [],
          ownerId: null,
        }));
        setPosts(applyPersonalization(enrichWithUsers(seeded), profile));
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPosts((prev) => applyPersonalization(prev, profile));
  }, [profile]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore storage errors */
    }
  }, [profile]);

  useEffect(() => {
    if (loading) return;

    if (posts.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(mapPostsForStorage(posts))
      );
    } catch {
      /* ignore storage errors */
    }
  }, [posts, loading]);

  useEffect(() => {
    if (!statusMessage) return undefined;

    const timeoutId = window.setTimeout(() => {
      setStatusMessage("");
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [statusMessage]);

  const searchTerm = search.trim().toLowerCase();

  const filteredPosts = useMemo(() => {
    let working = posts;

    if (searchTerm) {
      working = working.filter((post) => {
        const title = post.title.toLowerCase();
        const body = post.body.toLowerCase();
        return title.includes(searchTerm) || body.includes(searchTerm);
      });
    }

    if (filter === "local") {
      working = working.filter((post) => post.ownerId === profile.id);
    } else if (filter === "bookmarked") {
      working = working.filter((post) => post.bookmarkedByMe);
    }

    const sorted = [...working];
    if (filter === "likes") {
      sorted.sort(
        (a, b) =>
          b.likes - a.likes ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return sorted;
  }, [posts, filter, searchTerm, profile.id]);

  function updateProfile(nextProfile) {
    setProfile((prevProfile) => {
      const mergedProfile = sanitizeProfile({ ...prevProfile, ...nextProfile });
      setPosts((prevPosts) =>
        applyPersonalization(
          prevPosts.map((post) => {
            if (post.author?.id !== prevProfile.id) return post;
            return {
              ...post,
              author: {
                ...post.author,
                ...profileToAuthor(mergedProfile),
              },
            };
          }),
          mergedProfile
        )
      );
      return mergedProfile;
    });
  }

  function handleAddPost(newPost) {
    const chosenAuthorId = newPost.authorId || profile.id;
    const usingActiveProfile = chosenAuthorId === profile.id;
    const baseAuthor = usingActiveProfile
      ? profileToAuthor(profile)
      : profileToAuthor(
          getUserById(chosenAuthorId) ||
            getRandomUser()
        );

    const basePost = {
      ...newPost,
      authorId: chosenAuthorId,
      author: baseAuthor,
      ownerId: usingActiveProfile ? profile.id : null,
      likes: 0,
      likedBy: [],
      source: "local",
      comments: [],
      bookmarkedBy: [],
      createdAt: new Date().toISOString(),
    };

    const decorated = decoratePostWithUser(basePost, 0);
    const personalized = applyPersonalization([decorated], profile)[0];

    setPosts((prevPosts) => [personalized, ...prevPosts]);
    setStatusMessage("Post added!");
    return true;
  }

  function handleRemovePost(targetId) {
    setPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== targetId)
    );
  }

  function handleToggleLike(targetId) {
    setPosts((prevPosts) =>
      applyPersonalization(
        prevPosts.map((post) => {
          if (post.id !== targetId) return post;
          const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
          const alreadyLikedIndex = likedBy.indexOf(profile.id);
          const alreadyLiked = alreadyLikedIndex !== -1;

          if (alreadyLiked) {
            likedBy.splice(alreadyLikedIndex, 1);
          } else {
            likedBy.push(profile.id);
          }

          const nextLikes = Math.max(0, post.likes + (alreadyLiked ? -1 : 1));

          return {
            ...post,
            likedBy,
            likes: nextLikes,
          };
        }),
        profile
      )
    );
  }

  function handleToggleBookmark(targetId) {
    setPosts((prevPosts) =>
      applyPersonalization(
        prevPosts.map((post) => {
          if (post.id !== targetId) return post;
          const bookmarkedBy = Array.isArray(post.bookmarkedBy)
            ? [...post.bookmarkedBy]
            : [];
          const index = bookmarkedBy.indexOf(profile.id);
          const alreadyBookmarked = index !== -1;

          if (alreadyBookmarked) {
            bookmarkedBy.splice(index, 1);
          } else {
            bookmarkedBy.push(profile.id);
          }

          return {
            ...post,
            bookmarkedBy,
          };
        }),
        profile
      )
    );
  }

  function handleAddComment(postId, body) {
    const trimmed = body.trim();
    if (!trimmed) return false;

    const commentId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const newComment = {
      id: commentId,
      author: profile.name,
      authorId: profile.id,
      body: trimmed,
      createdAt: new Date().toISOString(),
    };

    setPosts((prevPosts) =>
      applyPersonalization(
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments ?? []), newComment],
              }
            : post
        ),
        profile
      )
    );

    return true;
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    updateProfile(profileDraft);
    setIsEditingProfile(false);
  }

  function handleProfileCancel() {
    setProfileDraft(profile);
    setIsEditingProfile(false);
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="app-title-link">
            <h1 className="app-title">OpenBoard</h1>
          </Link>
          <p className="app-subtitle">
            Browse sample posts and add your own voice.
          </p>
          <section className="profile-card">
            <div className="profile-card__summary">
              <div
                className="profile-card__avatar"
                style={{ backgroundColor: profile.avatarColor }}
                aria-hidden="true"
              >
                {profile.avatarInitial}
              </div>
              <div className="profile-card__meta">
                <span className="profile-card__name">{profile.name}</span>
                <span className="profile-card__handle">{profile.handle}</span>
              </div>
            </div>
            <button
              type="button"
              className="profile-card__toggle"
              onClick={() => setIsEditingProfile((prev) => !prev)}
            >
              {isEditingProfile ? "Close" : "Edit profile"}
            </button>
            {isEditingProfile && (
              <form className="profile-card__form" onSubmit={handleProfileSubmit}>
                <label className="profile-card__label" htmlFor="profile-name">
                  Display name
                  <input
                    id="profile-name"
                    className="profile-card__input"
                    type="text"
                    value={profileDraft.name}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        name: event.target.value,
                        avatarInitial: deriveAvatarInitial(
                          event.target.value,
                          profileDraft.handle
                        ),
                      }))
                    }
                    placeholder="Your name"
                  />
                </label>
                <label className="profile-card__label" htmlFor="profile-handle">
                  Handle
                  <input
                    id="profile-handle"
                    className="profile-card__input"
                    type="text"
                    value={profileDraft.handle}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        handle: event.target.value,
                        avatarInitial: deriveAvatarInitial(
                          profileDraft.name,
                          event.target.value
                        ),
                      }))
                    }
                    placeholder="@username"
                  />
                </label>
                <label className="profile-card__label" htmlFor="profile-color">
                  Avatar color
                  <input
                    id="profile-color"
                    className="profile-card__input profile-card__input--color"
                    type="color"
                    value={profileDraft.avatarColor}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        avatarColor: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="profile-card__actions">
                  <button
                    type="button"
                    className="profile-card__button profile-card__button--ghost"
                    onClick={handleProfileCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-card__button profile-card__button--primary"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            )}
          </section>
          <input
            className="search-input"
            type="text"
            placeholder="Search post title or body..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div
            className="filter-toolbar"
            role="toolbar"
            aria-label="Post filters"
          >
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`filter-chip ${
                  filter === option.id ? "filter-chip--active" : ""
                }`}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Link to="/add" className="add-post-button">
            Add New Post
          </Link>
          {statusMessage && (
            <p className="flash-message" role="status">
              {statusMessage}
            </p>
          )}
        </header>
        <main className="app-content">
          <Routes>
            <Route
              path="/"
              element={
                loading ? (
                  <p className="status-text">Loading posts...</p>
                ) : (
                  <PostList
                    posts={filteredPosts}
                    onDeletePost={handleRemovePost}
                    onToggleLike={handleToggleLike}
                    onToggleBookmark={handleToggleBookmark}
                    onAddComment={handleAddComment}
                    searchTerm={searchTerm}
                  />
                )
              }
            />
            <Route path="/posts/:id" element={<PostDetails profile={profile} />} />
            <Route
              path="/add"
              element={<AddPost onAddPost={handleAddPost} profile={profile} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
