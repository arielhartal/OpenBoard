'use client';

import AddPostForm from '@/components/AddPostForm';
import { useAppState } from '@/context/AppStateContext';

export default function AddPostPage() {
  const { addPost, profile } = useAppState();

  return <AddPostForm onAddPost={addPost} profile={profile} />;
}
