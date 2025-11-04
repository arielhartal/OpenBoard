import { Link } from "react-router-dom";
import PostItem from "./PostItem";

function PostList({ posts, onDeletePost, onToggleLike, searchTerm }) {
  if (posts.length === 0) {
    return (
      <div className="post-list-empty">
        <p className="status-text">No posts match your filters.</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/posts/${post.id}`}
          state={{ post }}
          className="post-link"
        >
          <PostItem
            post={post}
            searchTerm={searchTerm}
            onDelete={
              typeof onDeletePost === "function"
                ? () => onDeletePost(post.id)
                : undefined
            }
            onToggleLike={
              typeof onToggleLike === "function"
                ? () => onToggleLike(post.id)
                : undefined
            }
          />
        </Link>
      ))}
    </div>
  );
}

export default PostList;
