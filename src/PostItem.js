import {
  FALLBACK_AUTHOR,
  formatExactTime,
  formatRelativeTime,
} from "./postUtils";

function PostItem({ post, onDelete }) {
  function handleDeleteClick(event) {
    if (!onDelete) return;
    event.preventDefault();
    event.stopPropagation();
    onDelete();
  }

  const author = post.author ?? FALLBACK_AUTHOR;

  const timestampLabel = formatRelativeTime(post.createdAt);

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
          <h3 className="post-card__title">{post.title}</h3>
          <p className="post-card__body">{post.body}</p>
        </div>
      </div>
    </article>
  );
}

export default PostItem;
