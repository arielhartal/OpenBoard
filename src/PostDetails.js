import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  FALLBACK_AUTHOR,
  decoratePostWithUser,
  formatExactTime,
  formatRelativeTime,
} from "./postUtils";

function PostDetails() {
  const { id } = useParams();
  const derivedIndex = useMemo(() => {
    const numericId = Number(id);
    if (Number.isFinite(numericId) && numericId > 0) {
      return numericId - 1;
    }
    return 0;
  }, [id]);

  const location = useLocation();
  const initialPost = location.state?.post
    ? decoratePostWithUser(location.state.post, derivedIndex)
    : null;
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    if (post) return;

    let isCancelled = false;

    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          setPost(decoratePostWithUser(data, derivedIndex));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [id, post, derivedIndex]);

  if (!post) return <p>Loading...</p>;
  if (!post.title && !post.body)
    return <p className="status-text">Post not found.</p>;

  const author = post.author ?? FALLBACK_AUTHOR;
  const relativeTime = formatRelativeTime(post.createdAt);
  const exactTime = formatExactTime(post.createdAt);

  return (
    <div className="post-details">
      <article className="post-details__card">
        <header className="post-details__header">
          <div
            className="post-details__avatar"
            style={{ backgroundColor: author.avatarColor }}
            aria-hidden="true"
          >
            {author.avatarInitial}
          </div>
          <div className="post-details__meta">
            <span className="post-details__name">{author.name}</span>
            <div className="post-details__subline">
              <span className="post-details__handle">{author.handle}</span>
              <span className="post-details__dot" aria-hidden="true">
                •
              </span>
              <time
                className="post-details__timestamp"
                dateTime={post.createdAt}
                title={exactTime}
              >
                {relativeTime}
              </time>
            </div>
          </div>
        </header>
        <h2 className="post-details__title">{post.title}</h2>
        <p className="post-details__body">{post.body}</p>
      </article>
    </div>
  );
}

export default PostDetails;
