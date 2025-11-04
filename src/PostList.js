import { useNavigate } from "react-router-dom";
import PostItem from "./PostItem";

function PostList({
  posts,
  onDeletePost,
  onToggleLike,
  onAddComment,
  searchTerm,
}) {
  const navigate = useNavigate();

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
        <div key={post.id} className="post-link">
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
            onAddComment={onAddComment}
            onNavigate={() =>
              navigate(`/posts/${post.id}`, { state: { post } })
            }
          />
        </div>
      ))}
    </div>
  );
}

export default PostList;
