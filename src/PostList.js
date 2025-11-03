import { Link } from "react-router-dom";
import PostItem from "./PostItem";

function PostList({ posts }) {
  if (posts.length === 0) {
    return <p className="status-text">No posts found.</p>;
  }

  return (
    <div className="post-list">
      {posts.slice(0, 10).map((post) => (
        <Link
          key={post.id}
          to={`/posts/${post.id}`}
          state={{ post }}
          className="post-link"
        >
          <PostItem post={post} />
        </Link>
      ))}
    </div>
  );
}

export default PostList;
