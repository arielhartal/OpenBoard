function PostItem({ post }) {
  return (
    <article className="post-card">
      <h3 className="post-card__title">{post.title}</h3>
      <p className="post-card__body">{post.body}</p>
    </article>
  );
}

export default PostItem;
