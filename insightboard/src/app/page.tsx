'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import PostList from '@/components/PostList';
import { PostSkeletonList } from '@/components/PostSkeletonList';
import { useAppState } from '@/context/AppStateContext';

function deriveAvatarInitial(name?: string, handle?: string) {
  const trimmedName = (name ?? '').trim();
  if (trimmedName) {
    return trimmedName[0]?.toUpperCase() ?? 'U';
  }
  const trimmedHandle = (handle ?? '').replace(/^@/, '').trim();
  if (trimmedHandle) {
    return trimmedHandle[0]?.toUpperCase() ?? 'U';
  }
  return 'U';
}

export default function FeedPage() {
  const {
    loading,
    filteredPosts,
    filter,
    setFilter,
    search,
    setSearch,
    searchTerm,
    statusMessage,
    summaryItems,
    profile,
    updateProfile,
    removePost,
    toggleLike,
    toggleBookmark,
    addComment,
    filterOptions,
  } = useAppState();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);

  useEffect(() => {
    setProfileDraft(profile);
  }, [profile]);

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfile(profileDraft);
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setProfileDraft(profile);
    setIsEditingProfile(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <Link href="/" className="app-title-link">
          <h1 className="app-title">
            <span className="app-title-icon" aria-hidden="true">
              OB
            </span>
            InsightBoard
          </h1>
        </Link>
        <p className="app-subtitle">
          Share quick posts, save favorites, and explore trending ideas.
        </p>
        <section className="profile-card">
          <div className="profile-card__summary">
            <div
              className="profile-card__avatar"
              style={{ backgroundColor: profile.avatarColor }}
              aria-hidden="true"
            >
              {profile.avatarInitial}
            </div>
            <div className="profile-card__details">
              <span className="profile-card__name">{profile.name}</span>
              <span className="profile-card__handle">{profile.handle}</span>
            </div>
            <button
              type="button"
              className="profile-card__button profile-card__button--ghost"
              onClick={() => setIsEditingProfile((prev) => !prev)}
            >
              {isEditingProfile ? 'Close' : 'Edit profile'}
            </button>
          </div>
          {isEditingProfile && (
            <form className="profile-card__form" onSubmit={handleProfileSubmit}>
              <label className="profile-card__label" htmlFor="profile-name">
                Display name
                <input
                  id="profile-name"
                  className="profile-card__input"
                  type="text"
                  value={profileDraft.name}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      name: event.target.value,
                      avatarInitial: deriveAvatarInitial(
                        event.target.value,
                        profileDraft.handle
                      ),
                    }))
                  }
                />
              </label>
              <label className="profile-card__label" htmlFor="profile-handle">
                Handle
                <input
                  id="profile-handle"
                  className="profile-card__input"
                  type="text"
                  value={profileDraft.handle}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      handle: event.target.value,
                      avatarInitial: deriveAvatarInitial(
                        profileDraft.name,
                        event.target.value
                      ),
                    }))
                  }
                  placeholder="@username"
                />
              </label>
              <label className="profile-card__label" htmlFor="profile-color">
                Avatar color
                <input
                  id="profile-color"
                  className="profile-card__input profile-card__input--color"
                  type="color"
                  value={profileDraft.avatarColor}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      avatarColor: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="profile-card__actions">
                <button
                  type="button"
                  className="profile-card__button profile-card__button--ghost"
                  onClick={handleProfileCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-card__button profile-card__button--primary"
                >
                  Save changes
                </button>
              </div>
            </form>
          )}
        </section>
        <section className="stats-bar">
          {summaryItems.map((item) => (
            <div key={item.id} className="stats-bar__item">
              <span className="stats-bar__value">{item.value}</span>
              <span className="stats-bar__label">{item.label}</span>
            </div>
          ))}
        </section>
        <input
          className="search-input"
          type="text"
          placeholder="Search post title or body..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="filter-toolbar" role="toolbar" aria-label="Post filters">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`filter-chip ${filter === option.id ? 'filter-chip--active' : ''}`}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Link href="/add" className="add-post-button">
          Add New Post
        </Link>
        {statusMessage && (
          <p className="flash-message" role="status">
            {statusMessage}
          </p>
        )}
      </header>
      <main className="app-content">
        {loading ? (
          <PostSkeletonList />
        ) : (
          <PostList
            posts={filteredPosts}
            onDeletePost={removePost}
            onToggleLike={toggleLike}
            onToggleBookmark={toggleBookmark}
            onAddComment={addComment}
            searchTerm={searchTerm}
          />
        )}
      </main>
    </div>
  );
}
