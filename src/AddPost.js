import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddPost({ onAddPost }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) return;

    const id = Math.floor(Math.random() * 100000);
    const newPost = { id, title: trimmedTitle, body: trimmedBody };
    onAddPost(newPost);
    setTitle("");
    setBody("");
    navigate("/");
  }

  const isDisabled = title.trim().length === 0 || body.trim().length === 0;

  return (
    <div className="add-post-container">
      <div className="add-post-card">
        <h1 className="add-post-title">Create a new post</h1>
        <p className="add-post-subtitle">
          Share a headline and a quick summary to add it to the feed.
        </p>
        <form className="add-post-form" onSubmit={handleSubmit}>
          <label className="add-post-label" htmlFor="post-title">
            Title
            <input
              id="post-title"
              className="add-post-input"
              type="text"
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="add-post-label" htmlFor="post-body">
            Body
            <textarea
              id="post-body"
              className="add-post-textarea"
              placeholder="Write your post..."
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <div className="add-post-actions">
            <button
              className="add-post-submit"
              type="submit"
              disabled={isDisabled}
            >
              Publish post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPost;
