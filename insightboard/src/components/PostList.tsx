'use client';

import { useRouter } from 'next/navigation';
import PostItem from '@/components/PostItem';
import type { PostRecord } from '@/lib/types';

type PostListProps = {
  posts: PostRecord[];
  onDeletePost?: (postId: string) => void;
  onToggleLike?: (postId: string) => void;
  onToggleBookmark?: (postId: string) => void;
  onAddComment?: (postId: string, body: string) => boolean;
  searchTerm: string;
};

export default function PostList({
  posts,
  onDeletePost,
  onToggleLike,
  onToggleBookmark,
  onAddComment,
  searchTerm,
}: PostListProps) {
  const router = useRouter();

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
            onDelete={onDeletePost ? () => onDeletePost(post.id) : undefined}
            onToggleLike={
              onToggleLike ? () => onToggleLike(post.id) : undefined
            }
            onToggleBookmark={
              onToggleBookmark ? () => onToggleBookmark(post.id) : undefined
            }
            onAddComment={onAddComment}
            onNavigate={() => router.push(`/posts/${post.id}`)}
          />
        </div>
      ))}
    </div>
  );
}
