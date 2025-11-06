'use client';

import { Fragment, useState } from 'react';
import type { MouseEvent, KeyboardEvent, ReactNode, FormEvent } from 'react';
import { FALLBACK_AUTHOR, formatExactTime, formatRelativeTime } from '@/lib/postUtils';
import type { PostRecord } from '@/lib/types';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTarget(target: EventTarget | null) {
  if (!target || typeof Node === 'undefined') return null;
  if ((target as Node).nodeType === Node.TEXT_NODE) {
    return (target as Node).parentElement;
  }
  return target instanceof HTMLElement ? target : null;
}

function isInteractiveElement(target: EventTarget | null) {
  const element = normalizeTarget(target);
  if (!element || typeof element.closest !== 'function') return false;

  return Boolean(
    element.closest('button') ||
      element.closest('a') ||
      element.closest('textarea') ||
      element.closest('input') ||
      element.closest('.comment-panel') ||
      element.closest('.comment-form') ||
      element.closest('.post-card__actions')
  );
}

function highlightMatch(text: string, term: string): ReactNode {
  if (!term) return text;
  const safeTerm = escapeRegExp(term);
  const regex = new RegExp(`(${safeTerm})`, 'ig');
  const parts = text.split(regex);
  const lowerTerm = term.toLowerCase();

  return parts.map((part, index) =>
    part.toLowerCase() === lowerTerm ? (
      <mark key={index}>{part}</mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );
}

type PostItemProps = {
  post: PostRecord;
  onDelete?: () => void;
  onToggleLike?: () => void;
  onToggleBookmark?: () => void;
  onAddComment?: (postId: string, body: string) => boolean;
  onNavigate?: () => void;
  searchTerm: string;
};

export default function PostItem({
  post,
  onDelete,
  onToggleLike,
  onToggleBookmark,
  onAddComment,
  onNavigate,
  searchTerm,
}: PostItemProps) {
  const author = post.author ?? FALLBACK_AUTHOR;
  const timestampLabel = formatRelativeTime(post.createdAt);
  const titleContent = highlightMatch(post.title, searchTerm);
  const bodyContent = highlightMatch(post.body, searchTerm);
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const bookmarkCount = Array.isArray(post.bookmarkedBy)
    ? post.bookmarkedBy.length
    : 0;

  const [showComments, setShowComments] = useState(false);
  const [draftComment, setDraftComment] = useState('');

  const trimmedDraft = draftComment.trim();
  const isCommentDisabled = trimmedDraft.length === 0;
  const commentPanelId = `comments-${post.id}`;
  const commentButtonLabel = `${showComments ? 'Hide' : 'Show'} comments (${comments.length})`;

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!onDelete) return;
    event.preventDefault();
    event.stopPropagation();
    onDelete();
  };

  const handleLikeClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!onToggleLike) return;
    event.preventDefault();
    event.stopPropagation();
    onToggleLike();
  };

  const handleBookmarkClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!onToggleBookmark) return;
    event.preventDefault();
    event.stopPropagation();
    onToggleBookmark();
  };

  const handleAddCommentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onAddComment || isCommentDisabled) return;

    const result = onAddComment(post.id, trimmedDraft);
    if (result !== false) {
      setDraftComment('');
      setShowComments(true);
    }
  };

  const toggleComments = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowComments((prev) => !prev);
  };

  const handleNavigate = (event: MouseEvent<HTMLDivElement>) => {
    if (!onNavigate) return;
    if (isInteractiveElement(event.target)) return;
    event.preventDefault();
    onNavigate();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onNavigate) return;
    const isEnter = event.key === 'Enter';
    const isSpace = event.key === ' ';
    if (!isEnter && !isSpace) return;
    if (isInteractiveElement(event.target)) return;
    event.preventDefault();
    onNavigate();
  };

  return (
    <article className="post-card">
      <div
        role={onNavigate ? 'button' : undefined}
        tabIndex={onNavigate ? 0 : undefined}
        className="post-card__inner"
        onClick={handleNavigate}
        onKeyDown={handleKeyDown}
      >
        <div className="post-card__top">
          <div
            className="post-card__avatar"
            style={{ backgroundColor: author.avatarColor }}
            aria-hidden="true"
          >
            {author.avatarInitial}
          </div>
          <div className="post-card__content">
            <div className="post-card__header">
              <div className="post-card__meta">
                <span className="post-card__name">{author.name}</span>
                <span className="post-card__handle">{author.handle}</span>
                <span className="post-card__dot" aria-hidden="true">
                  &bull;
                </span>
                <time
                  className="post-card__timestamp"
                  dateTime={post.createdAt}
                  title={formatExactTime(post.createdAt)}
                >
                  {timestampLabel}
                </time>
              </div>
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
            <h3 className="post-card__title">{titleContent}</h3>
            <p className="post-card__body">{bodyContent}</p>
            <div className="post-card__actions">
              <button
                type="button"
                className={`post-card__like ${post.likedByMe ? 'post-card__like--active' : ''}`}
                onClick={handleLikeClick}
                aria-pressed={post.likedByMe}
              >
                <span aria-hidden="true" className="post-card__like-icon">
                  &hearts;
                </span>
                <span className="post-card__like-count">{post.likes}</span>
              </button>
              <button
                type="button"
                className={`post-card__bookmark ${post.bookmarkedByMe ? 'post-card__bookmark--active' : ''}`}
                onClick={handleBookmarkClick}
                aria-pressed={post.bookmarkedByMe}
                title={post.bookmarkedByMe ? 'Remove bookmark' : 'Save for later'}
                aria-label={post.bookmarkedByMe ? 'Remove bookmark' : 'Save for later'}
              >
                <span aria-hidden="true" className="post-card__bookmark-icon">
                  &#9733;
                </span>
                <span className="post-card__bookmark-count">{bookmarkCount}</span>
              </button>
              <button
                type="button"
                className={`post-card__chip ${showComments ? 'post-card__chip--active' : ''}`}
                onClick={toggleComments}
                aria-expanded={showComments}
                aria-controls={commentPanelId}
                aria-label={commentButtonLabel}
                title={commentButtonLabel}
              >
                <span aria-hidden="true" className="post-card__chip-icon">
                  &#128172;
                </span>
                <span className="post-card__chip-count">{comments.length}</span>
              </button>
            </div>
            {showComments && (
              <div
                className="comment-panel"
                id={commentPanelId}
                aria-live="polite"
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <ul className="comment-list">
                  {comments.length === 0 ? (
                    <li className="comment-empty">Be the first to comment.</li>
                  ) : (
                    comments.map((comment) => (
                      <li key={comment.id} className="comment-item">
                        <div className="comment-meta">
                          <span className="comment-author">{comment.author}</span>
                          <span className="comment-time">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="comment-body">{comment.body}</p>
                      </li>
                    ))
                  )}
                </ul>
                <form className="comment-form" onSubmit={handleAddCommentSubmit}>
                  <textarea
                    className="comment-input"
                    placeholder="Add a comment..."
                    rows={2}
                    value={draftComment}
                    onChange={(event) => setDraftComment(event.target.value)}
                  />
                  <button
                    type="submit"
                    className="comment-submit"
                    disabled={isCommentDisabled}
                  >
                    Add comment
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
