'use client';

const SKELETON_COUNT = 4;

export function PostSkeletonList() {
  return (
    <div className="post-list">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <article key={index} className="post-card skeleton-card" aria-hidden="true">
          <div className="post-card__top">
            <div className="skeleton-avatar shimmer-block" />
            <div className="post-card__content">
              <div className="post-card__header">
                <div className="skeleton-lines">
                  <span className="skeleton-line skeleton-line--medium shimmer-block" />
                  <span className="skeleton-line skeleton-line--short shimmer-block" />
                </div>
                <span className="skeleton-pill shimmer-block" />
              </div>
              <span className="skeleton-line skeleton-line--large shimmer-block" />
              <span className="skeleton-line shimmer-block" />
              <span className="skeleton-line shimmer-block" />
              <div className="post-card__actions">
                <span className="skeleton-pill shimmer-block" />
                <span className="skeleton-pill shimmer-block" />
                <span className="skeleton-pill shimmer-block" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
