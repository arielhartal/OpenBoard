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
const FILTER_OPTIONS = [
  { id: "latest", label: "Latest" },
  { id: "likes", label: "Most liked" },
  { id: "local", label: "My posts" },
];
const SEED_LIMIT = 30;

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    try {
      const storedPostsRaw = window.localStorage.getItem(STORAGE_KEY);
      if (storedPostsRaw) {
        try {
          const parsed = JSON.parse(storedPostsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const hydrated = parsed.map((post, index) => ({
              ...post,
              source: post.source ?? "local",
              id: post.id ?? index + 1,
            }));
            setPosts(enrichWithUsers(hydrated));
            setLoading(false);
            return;
          }
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // localStorage unavailable (e.g., private mode); fall back to fetch
    }

    fetch(
      `https://jsonplaceholder.typicode.com/posts?_limit=${SEED_LIMIT}`
    )
      .then((res) => res.json())
      .then((data) => {
        const seeded = data.map((post, index) => ({
          ...post,
          id: post.id ?? index + 1,
          source: "seed",
        }));
        setPosts(enrichWithUsers(seeded));
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

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
      working = working.filter((post) => post.source === "local");
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
  }, [posts, filter, searchTerm]);

  function handleAddPost(newPost) {
    setPosts((prevPosts) => {
      const enrichedPost = decoratePostWithUser(
        {
          ...newPost,
          author:
            (newPost.authorId && getUserById(newPost.authorId)) ||
            getRandomUser(),
          likes: 0,
          likedByMe: false,
          source: "local",
          createdAt: new Date().toISOString(),
        },
        0
      );
      return [enrichedPost, ...prevPosts];
    });
    setStatusMessage("Post added!");
    return true;
  }
  function handleRemovePost(targetId) {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== targetId));
    setStatusMessage("Post removed.");
  }
  function handleToggleLike(targetId) {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== targetId) return post;
        const liked = !post.likedByMe;
        const nextLikes = Math.max(
          0,
          post.likes + (liked ? 1 : -1)
        );
        return {
          ...post,
          likedByMe: liked,
          likes: nextLikes,
        };
      })
    );
  }

  useEffect(() => {
    if (!statusMessage) return undefined;

    const timeoutId = window.setTimeout(() => {
      setStatusMessage("");
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [statusMessage]);

  useEffect(() => {
    if (loading) return;

    if (posts.length === 0) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // storage unavailable; nothing else to do
      }
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // storage unavailable; proceed without persistence
    }
  }, [posts, loading]);

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
          <Link to="/add" className="add-post-button">Add New Post</Link>
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
                    searchTerm={searchTerm}
                  />
                )
              }
            />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route
              path="/add" element={<AddPost onAddPost={handleAddPost} />}
              />

          </Routes>
        </main>
      </div>
    </Router>
  );
}



export default App;
