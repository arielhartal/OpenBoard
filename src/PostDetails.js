import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function PostDetails() {
  const { id } = useParams();
  const location = useLocation();
  const initialPost = location.state?.post ?? null;
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    if (post) return;

    let isCancelled = false;

    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          setPost(data);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [id, post]);

  if (!post) return <p>Loading...</p>;
  if (!post.title && !post.body)
    return <p className="status-text">Post not found.</p>;

  return (
    <div style={{ textAlign: "center" }}>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </div>
  );
}

export default PostDetails;
