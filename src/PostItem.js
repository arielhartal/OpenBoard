import { Fragment } from "react";
import {
  FALLBACK_AUTHOR,
  formatExactTime,
  formatRelativeTime,
} from "./postUtils";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${escapeRegExp(term)})`, "ig");
  const parts = text.split(regex);
  const lowerTerm = term.toLowerCase();

  return parts.map((part, index) =>
    part.toLowerCase() === lowerTerm ? (
      <mark key={index}>{part}</mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );
}

function PostItem({ post, onDelete, onToggleLike, searchTerm }) {
  const author = post.author ?? FALLBACK_AUTHOR;
  const timestampLabel = formatRelativeTime(post.createdAt);
  const titleContent = highlightMatch(post.title, searchTerm);
  const bodyContent = highlightMatch(post.body, searchTerm);

  const handleDeleteClick = (event) => {
    if (!onDelete) return;
    event.preventDefault();
    event.stopPropagation();
    onDelete();
  };

  const handleLikeClick = (event) => {
    if (!onToggleLike) return;
    event.preventDefault();
    event.stopPropagation();
    onToggleLike();
  };

  return (
    <article className="post-card">
      <div className="post-card__top">
        <div
          className="post-card__avatar"
          style={{ backgroundColor: author.avatarColor }}
          aria-hidden="true"
        >
          {author.avatarInitial}
        </div>
        <div className="post-card__content">
          <div className="post-card__header">
            <div className="post-card__identity">
              <span className="post-card__author-name">{author.name}</span>
              <span className="post-card__author-handle">{author.handle}</span>
              <span className="post-card__dot" aria-hidden="true">
                •
              </span>
              <time
                className="post-card__timestamp"
                dateTime={post.createdAt}
                title={formatExactTime(post.createdAt)}
              >
                {timestampLabel}
              </time>
            </div>
            {onDelete && (
              <button
                type="button"
                className="post-card__delete"
                onClick={handleDeleteClick}
                aria-label={`Delete post titled ${post.title}`}
                title="Delete post"
              >
                Delete
              </button>
            )}
          </div>
          <h3 className="post-card__title">{titleContent}</h3>
          <p className="post-card__body">{bodyContent}</p>
          <div className="post-card__actions">
            <button
              type="button"
              className={`post-card__like ${
                post.likedByMe ? "post-card__like--active" : ""
              }`}
              onClick={handleLikeClick}
              aria-pressed={post.likedByMe}
            >
              <span aria-hidden="true" className="post-card__like-icon">
                ♥
              </span>
              <span className="post-card__like-count">{post.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default PostItem;
