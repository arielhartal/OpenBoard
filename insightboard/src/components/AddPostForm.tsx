'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { USERS } from '@/lib/postUtils';
import type { UserProfile } from '@/lib/types';

type AddPostInput = {
  id?: string | number;
  title: string;
  body: string;
  authorId?: string;
};

type AddPostFormProps = {
  onAddPost: (post: AddPostInput) => boolean;
  profile: UserProfile;
};

export default function AddPostForm({ onAddPost, profile }: AddPostFormProps) {
  const router = useRouter();

  const authorOptions = useMemo(() => {
    const options = [];
    if (profile) {
      options.push({
        id: profile.id,
        name: profile.name,
        handle: profile.handle,
        avatarColor: profile.avatarColor,
        avatarInitial: profile.avatarInitial,
        isProfile: true,
      });
    }
    USERS.forEach((user) => {
      if (!profile || user.id !== profile.id) {
        options.push({ ...user, isProfile: false });
      }
    });
    return options;
  }, [profile]);

  const defaultAuthorId = authorOptions[0]?.id ?? '';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [authorId, setAuthorId] = useState(defaultAuthorId);

  useEffect(() => {
    setAuthorId(defaultAuthorId);
  }, [defaultAuthorId]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) return;

    const id = Math.floor(Math.random() * 100000);
    const newPost: AddPostInput = {
      id,
      title: trimmedTitle,
      body: trimmedBody,
      authorId: authorId || profile?.id || defaultAuthorId,
    };
    const wasAdded = onAddPost(newPost);
    if (!wasAdded) return;
    setTitle('');
    setBody('');
    setAuthorId(defaultAuthorId);
    router.push('/');
  };

  const isDisabled =
    title.trim().length === 0 || body.trim().length === 0 || !authorId;

  const selectedAuthor =
    authorOptions.find((user) => user.id === authorId) ?? authorOptions[0] ?? null;

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
              onChange={(event) => setTitle(event.target.value)}
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
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
          <label className="add-post-label" htmlFor="post-author">
            Post as
            <select
              id="post-author"
              className="add-post-select"
              value={authorId}
              onChange={(event) => setAuthorId(event.target.value)}
            >
              {authorOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.isProfile
                    ? `${user.name} (My profile)`
                    : `${user.name} (${user.handle})`}
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
            <button className="add-post-submit" type="submit" disabled={isDisabled}>
              Publish post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
