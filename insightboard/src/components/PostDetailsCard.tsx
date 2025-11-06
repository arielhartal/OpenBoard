'use client';

import { FALLBACK_AUTHOR, formatExactTime, formatRelativeTime } from '@/lib/postUtils';
import type { PostRecord, UserProfile } from '@/lib/types';

type PostDetailsCardProps = {
  post: PostRecord;
  activeProfile: UserProfile;
};

export function PostDetailsCard({ post, activeProfile }: PostDetailsCardProps) {
  const author = post.author ?? FALLBACK_AUTHOR;
  const relativeTime = formatRelativeTime(post.createdAt);
  const exactTime = formatExactTime(post.createdAt);
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
  const bookmarkedBy = Array.isArray(post.bookmarkedBy) ? post.bookmarkedBy : [];
  const likedByMe = likedBy.includes(activeProfile.id) || Boolean(post.likedByMe);
  const bookmarkedByMe =
    bookmarkedBy.includes(activeProfile.id) || Boolean(post.bookmarkedByMe);

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
                &bull;
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

        <section className="post-details__section post-details__section--meta">
          <div className="post-details__stats" role="list">
            <span className="post-details__stat" role="listitem">
              <span aria-hidden="true">&#9829;</span>
              <span className="post-details__stat-value">{post.likes}</span>
              <span className="sr-only">Likes</span>
            </span>
            <span className="post-details__stat" role="listitem">
              <span aria-hidden="true">&#9733;</span>
              <span className="post-details__stat-value">{bookmarkedBy.length}</span>
              <span className="sr-only">Bookmarks</span>
            </span>
            <span className="post-details__stat" role="listitem">
              <span aria-hidden="true">&#128172;</span>
              <span className="post-details__stat-value">{comments.length}</span>
              <span className="sr-only">Comments</span>
            </span>
          </div>
          <div className="post-details__badges">
            {post.ownerId === activeProfile.id && (
              <span className="post-details__badge">Your post</span>
            )}
            {likedByMe && <span className="post-details__badge">You liked this</span>}
            {bookmarkedByMe && <span className="post-details__badge">Bookmarked</span>}
          </div>
        </section>

        <section className="post-details__section">
          <header className="post-details__section-header">
            <h3 className="post-details__section-title">Comments</h3>
            <span className="post-details__section-count">{comments.length}</span>
          </header>
          {comments.length === 0 ? (
            <p className="post-details__empty">No comments yet.</p>
          ) : (
            <ul className="comment-list post-details__comments">
              {comments.map((comment) => (
                <li key={comment.id} className="comment-item">
                  <div className="comment-meta">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-time">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="comment-body">{comment.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </div>
  );
}
