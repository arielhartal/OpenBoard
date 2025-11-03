function PostItem({ post, onDelete }) {
  function handleDeleteClick(event) {
    if (!onDelete) return;
    event.preventDefault();
    event.stopPropagation();
    onDelete();
  }

  return (
    <article className="post-card">
      <div className="post-card__header">
        <h3 className="post-card__title">{post.title}</h3>
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
      <p className="post-card__body">{post.body}</p>
    </article>
  );
}

export default PostItem;
