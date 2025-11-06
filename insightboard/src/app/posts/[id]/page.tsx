'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { PostRecord } from '@/lib/types';
import { useAppState } from '@/context/AppStateContext';
import { PostDetailsCard } from '@/components/PostDetailsCard';
import { decoratePostWithUser } from '@/lib/postUtils';

type PostDetailPageProps = {
  params: { id: string };
};

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { posts, profile } = useAppState();
  const [remotePost, setRemotePost] = useState<PostRecord | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);

  const targetId = params.id;

  const derivedIndex = useMemo(() => {
    const numeric = Number(targetId);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric - 1;
    }
    return 0;
  }, [targetId]);

  const localMatch = useMemo(
    () => posts.find((item) => item.id === targetId),
    [posts, targetId]
  );

  useEffect(() => {
    if (localMatch) {
      return;
    }

    let isActive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemoteLoading(true);

    fetch(`https://jsonplaceholder.typicode.com/posts/${targetId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isActive) return;
        if (!data || !data.id) {
          setRemotePost(null);
          return;
        }
        const hydrated = decoratePostWithUser(
          { ...data, id: data.id ?? targetId },
          derivedIndex
        );
        setRemotePost(hydrated);
      })
      .catch(() => {
        if (isActive) {
          setRemotePost(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setRemoteLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [derivedIndex, localMatch, targetId]);

  const displayPost = localMatch ?? remotePost;
  const isLoading = localMatch ? false : remoteLoading;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">
        &lt;- Back to feed
      </Link>
      {isLoading ? (
        <p className="status-text">Loading post...</p>
      ) : !displayPost ? (
        <p className="status-text">Post not found.</p>
      ) : (
        <PostDetailsCard post={displayPost} activeProfile={profile} />
      )}
    </main>
  );
}
