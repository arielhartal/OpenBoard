import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { USERS } from "./postUtils";

const DEFAULT_AUTHOR_ID = USERS[0]?.id ?? "";

function AddPost({ onAddPost }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorId, setAuthorId] = useState(DEFAULT_AUTHOR_ID);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) return;

    const id = Math.floor(Math.random() * 100000);
    const newPost = {
      id,
      title: trimmedTitle,
      body: trimmedBody,
      authorId: authorId || DEFAULT_AUTHOR_ID,
    };
    const wasAdded = onAddPost(newPost);
    if (!wasAdded) return;
    setTitle("");
    setBody("");
    setAuthorId(DEFAULT_AUTHOR_ID);
    navigate("/");
  }

  const isDisabled =
    title.trim().length === 0 || body.trim().length === 0 || !authorId;

  const selectedAuthor =
    USERS.find((user) => user.id === authorId) ?? USERS[0] ?? null;

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
          <label className="add-post-label" htmlFor="post-author">
            Post as
            <select
              id="post-author"
              className="add-post-select"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
            >
              {USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {`${user.name} (${user.handle})`}
                </option>
              ))}
            </select>
          </label>
          {selectedAuthor && (
            <div className="add-post-author-preview">
              <div
                className="add-post-author-avatar"
                style={{ backgroundColor: selectedAuthor.avatarColor }}
                aria-hidden="true"
              >
                {selectedAuthor.avatarInitial}
              </div>
              <div className="add-post-author-meta">
                <span className="add-post-author-name">
                  {selectedAuthor.name}
                </span>
                <span className="add-post-author-handle">
                  {selectedAuthor.handle}
                </span>
              </div>
            </div>
          )}
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
