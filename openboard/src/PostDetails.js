import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  FALLBACK_AUTHOR,
  decoratePostWithUser,
  formatExactTime,
  formatRelativeTime,
} from "./postUtils";

const STORAGE_KEY = "openboard.posts";

function getPostFromStorage(postId) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return (
      parsed.find((storedPost) => String(storedPost.id) === String(postId)) ??
      null
    );
  } catch {
    return null;
  }
}

function PostDetails({ profile }) {
  const { id } = useParams();
  const derivedIndex = useMemo(() => {
    const numericId = Number(id);
    if (Number.isFinite(numericId) && numericId > 0) {
      return numericId - 1;
    }
    return 0;
  }, [id]);

  const location = useLocation();
  const locationPost = location.state?.post ?? null;

  const [post, setPost] = useState(() => {
    if (locationPost) {
      return decoratePostWithUser(locationPost, derivedIndex);
    }
    const stored = getPostFromStorage(id);
    return stored ? decoratePostWithUser(stored, derivedIndex) : null;
  });

  useEffect(() => {
    if (locationPost) {
      setPost(decoratePostWithUser(locationPost, derivedIndex));
      return;
    }

    const stored = getPostFromStorage(id);
    if (stored) {
      setPost(decoratePostWithUser(stored, derivedIndex));
      return;
    }

    let isCancelled = false;
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          setPost(decoratePostWithUser(data, derivedIndex));
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setPost(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [id, locationPost, derivedIndex]);

  if (!post) return <p className="status-text">Loading post...</p>;
  if (!post.title && !post.body)
    return <p className="status-text">Post not found.</p>;

  const author = post.author ?? FALLBACK_AUTHOR;
  const relativeTime = formatRelativeTime(post.createdAt);
  const exactTime = formatExactTime(post.createdAt);
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
  const bookmarkedBy = Array.isArray(post.bookmarkedBy)
    ? post.bookmarkedBy
    : [];
  const likedByMe = profile ? likedBy.includes(profile.id) : Boolean(post.likedByMe);
  const bookmarkedByMe = profile
    ? bookmarkedBy.includes(profile.id)
    : Boolean(post.bookmarkedByMe);

  return (
    <div className="post-details">
      <article className="post-details__card">
        <header className="post-details__header">
          <div
            className="post-details__avatar"
            style={{ backgroundColor: author.avatarColor }}
            aria-hidden="true"
          >
            {author.avatarInitial}
          </div>
          <div className="post-details__meta">
            <span className="post-details__name">{author.name}</span>
            <div className="post-details__subline">
              <span className="post-details__handle">{author.handle}</span>
              <span className="post-details__dot" aria-hidden="true">
                {"\u2022"}
              </span>
              <time
                className="post-details__timestamp"
                dateTime={post.createdAt}
                title={exactTime}
              >
                {relativeTime}
              </time>
            </div>
          </div>
        </header>
        <h2 className="post-details__title">{post.title}</h2>
        <p className="post-details__body">{post.body}</p>

        <section className="post-details__section post-details__section--meta">
          <div className="post-details__stats" role="list">
            <span className="post-details__stat" role="listitem">
              <span aria-hidden="true">{"\u2665"}</span>
              <span className="post-details__stat-value">{post.likes}</span>
              <span className="sr-only">Likes</span>
            </span>
            <span className="post-details__stat" role="listitem">
              <span aria-hidden="true">{"\u2605"}</span>
              <span className="post-details__stat-value">
                {bookmarkedBy.length}
              </span>
              <span className="sr-only">Bookmarks</span>
            </span>
            <span className="post-details__stat" role="listitem">
              <span aria-hidden="true">{"\u{1F4AC}"}</span>
              <span className="post-details__stat-value">
                {comments.length}
              </span>
              <span className="sr-only">Comments</span>
            </span>
          </div>
          <div className="post-details__badges">
            {post.ownerId === profile?.id && (
              <span className="post-details__badge">Your post</span>
            )}
            {likedByMe && (
              <span className="post-details__badge">You liked this</span>
            )}
            {bookmarkedByMe && (
              <span className="post-details__badge">Bookmarked</span>
            )}
          </div>
        </section>

        <section className="post-details__section">
          <header className="post-details__section-header">
            <h3 className="post-details__section-title">Comments</h3>
            <span className="post-details__section-count">
              {comments.length}
            </span>
          </header>
          {comments.length === 0 ? (
            <p className="post-details__empty">No comments yet.</p>
          ) : (
            <ul className="comment-list post-details__comments">
              {comments.map((comment) => (
                <li key={comment.id} className="comment-item">
                  <div className="comment-meta">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-time">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="comment-body">{comment.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </div>
  );
}

export default PostDetails;
