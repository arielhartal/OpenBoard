'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { enrichWithUsers, getRandomUser, getUserById } from '@/lib/postUtils';
import type { FilterOptionId, PostRecord, UserProfile } from '@/lib/types';

const STORAGE_KEY = 'insightboard.posts';
const PROFILE_STORAGE_KEY = 'insightboard.profile';
const FILTER_OPTIONS: ReadonlyArray<{ id: FilterOptionId; label: string }> = [
  { id: 'latest', label: 'Latest' },
  { id: 'likes', label: 'Most liked' },
  { id: 'local', label: 'My posts' },
  { id: 'bookmarked', label: 'Bookmarked' },
];
const SEED_LIMIT = 30;

const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  name: 'You',
  handle: '@you',
  avatarColor: '#6366f1',
  avatarInitial: 'Y',
};

type SummaryItem = {
  id: string;
  label: string;
  value: number;
};

type AddPostInput = {
  id?: string | number;
  title: string;
  body: string;
  authorId?: string;
};

type AppStateContextValue = {
  loading: boolean;
  posts: PostRecord[];
  filteredPosts: PostRecord[];
  filter: FilterOptionId;
  setFilter: (value: FilterOptionId) => void;
  search: string;
  setSearch: (value: string) => void;
  searchTerm: string;
  statusMessage: string;
  setStatusMessage: (value: string) => void;
  summaryItems: SummaryItem[];
  profile: UserProfile;
  updateProfile: (draft: Partial<UserProfile>) => void;
  addPost: (post: AddPostInput) => boolean;
  removePost: (postId: string) => void;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  addComment: (postId: string, body: string) => boolean;
  filterOptions: ReadonlyArray<{ id: FilterOptionId; label: string }>;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

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

function sanitizeProfile(input?: Partial<UserProfile> | null): UserProfile {
  const base = input ?? {};
  const name = base.name?.trim() || DEFAULT_PROFILE.name;
  let handle = base.handle?.trim() || DEFAULT_PROFILE.handle;
  if (!handle.startsWith('@')) {
    handle = `@${handle}`;
  }
  const colorCandidate = base.avatarColor?.trim() || DEFAULT_PROFILE.avatarColor;
  const isValidColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorCandidate);
  const avatarColor = isValidColor ? colorCandidate : DEFAULT_PROFILE.avatarColor;

  return {
    id: base.id || DEFAULT_PROFILE.id,
    name,
    handle,
    avatarColor,
    avatarInitial: deriveAvatarInitial(name, handle),
  };
}

function profileToAuthor(profile: UserProfile) {
  return {
    id: profile.id,
    name: profile.name,
    handle: profile.handle,
    avatarColor: profile.avatarColor,
    avatarInitial: profile.avatarInitial,
  };
}

function applyPersonalization(posts: PostRecord[], profile: UserProfile) {
  return posts.map((post) => {
    const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    const bookmarkedBy = Array.isArray(post.bookmarkedBy)
      ? post.bookmarkedBy
      : [];

    const likedByDeduped = Array.from(new Set(likedBy));
    const bookmarkedByDeduped = Array.from(new Set(bookmarkedBy));

    return {
      ...post,
      ownerId: post.ownerId ?? null,
      likedBy: likedByDeduped,
      bookmarkedBy: bookmarkedByDeduped,
      likedByMe: likedByDeduped.includes(profile.id),
      bookmarkedByMe: bookmarkedByDeduped.includes(profile.id),
    };
  });
}

type PersistablePost = Omit<PostRecord, 'likedByMe' | 'bookmarkedByMe'>;

function mapPostsForStorage(posts: PostRecord[]): PersistablePost[] {
  return posts.map(({ likedByMe: _likedByMe, bookmarkedByMe: _bookmarkedByMe, ...rest }) => {
    void _likedByMe;
    void _bookmarkedByMe;
    return rest;
  });
}

function loadStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return sanitizeProfile(parsed);
  } catch {
    return DEFAULT_PROFILE;
  }
}

function hydrateStoredPosts(stored: PersistablePost[], profile: UserProfile): PostRecord[] {
  const hydrated = stored.map((post, index) => {
    const fallbackOwner =
      post.ownerId ??
      (post.author?.id && post.author.id === profile.id ? profile.id : null);
    return {
      ...post,
      source: post.source ?? 'local',
      comments: Array.isArray(post.comments) ? post.comments : [],
      likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
      bookmarkedBy: Array.isArray(post.bookmarkedBy) ? post.bookmarkedBy : [],
      ownerId: fallbackOwner,
      id: post.id ?? String(index + 1),
    } as PostRecord;
  });

  return applyPersonalization(enrichWithUsers(hydrated), profile);
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

type AppStateProviderProps = {
  children: ReactNode;
};

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [profile, setProfile] = useState<UserProfile>(() =>
    sanitizeProfile(loadStoredProfile())
  );
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterOptionId>('latest');
  const [statusMessage, setStatusMessage] = useState('');
  const hasHydratedPosts = useRef(false);

  useEffect(() => {
    if (hasHydratedPosts.current) return;
    hasHydratedPosts.current = true;

    try {
      const storedPostsRaw = window.localStorage.getItem(STORAGE_KEY);
      if (storedPostsRaw) {
        try {
          const parsed = JSON.parse(storedPostsRaw) as PersistablePost[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPosts(hydrateStoredPosts(parsed, profile));
            setLoading(false);
            return;
          }
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      /* ignore localStorage issues */
    }

    fetch(`https://jsonplaceholder.typicode.com/posts?_limit=${SEED_LIMIT}`)
      .then((res) => res.json())
      .then((data: Array<{ id: number; title: string; body: string }>) => {
        const seeded = data.map((post, index) => ({
          ...post,
          id: post.id ?? index + 1,
          source: 'seed',
          comments: [],
          likedBy: [],
          bookmarkedBy: [],
          ownerId: null,
        }));
        setPosts(applyPersonalization(enrichWithUsers(seeded), profile));
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [profile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
      );
    } catch {
      /* ignore storage errors */
    }
  }, [profile]);

  useEffect(() => {
    if (loading || typeof window === 'undefined') return;

    if (posts.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(mapPostsForStorage(posts))
      );
    } catch {
      /* ignore storage errors */
    }
  }, [posts, loading]);

  useEffect(() => {
    if (!statusMessage) return;
    const timeoutId = window.setTimeout(() => {
      setStatusMessage('');
    }, 3500);
    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  const searchTerm = search.trim().toLowerCase();

  const filteredPosts = useMemo(() => {
    let working = posts;

    if (searchTerm) {
      working = working.filter((post) => {
        const title = post.title.toLowerCase();
        const body = post.body.toLowerCase();
        return title.includes(searchTerm) || body.includes(searchTerm);
      });
    }

    if (filter === 'local') {
      working = working.filter((post) => post.ownerId === profile.id);
    } else if (filter === 'bookmarked') {
      working = working.filter((post) => post.bookmarkedByMe);
    }

    const sorted = [...working];
    if (filter === 'likes') {
      sorted.sort(
        (a, b) =>
          b.likes - a.likes ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    return sorted;
  }, [posts, filter, searchTerm, profile.id]);

  const summaryItems = useMemo<SummaryItem[]>(() => {
    if (posts.length === 0) {
      return [
        { id: 'total', label: 'Total posts', value: 0 },
        { id: 'mine', label: 'My posts', value: 0 },
        { id: 'bookmarks', label: 'Bookmarked', value: 0 },
        { id: 'likes', label: 'Likes', value: 0 },
        { id: 'comments', label: 'Comments', value: 0 },
      ];
    }

    const totalPosts = posts.length;
    const myPosts = posts.filter((post) => post.ownerId === profile.id).length;
    const bookmarked = posts.filter((post) => post.bookmarkedByMe).length;
    const likes = posts.reduce((acc, post) => acc + (post.likes ?? 0), 0);
    const comments = posts.reduce(
      (acc, post) =>
        acc + (Array.isArray(post.comments) ? post.comments.length : 0),
      0
    );

    return [
      { id: 'total', label: 'Total posts', value: totalPosts },
      { id: 'mine', label: 'My posts', value: myPosts },
      { id: 'bookmarks', label: 'Bookmarked', value: bookmarked },
      { id: 'likes', label: 'Likes', value: likes },
      { id: 'comments', label: 'Comments', value: comments },
    ];
  }, [posts, profile.id]);

  const updateProfile = (draft: Partial<UserProfile>) => {
    setProfile((prev) => sanitizeProfile({ ...prev, ...draft }));
  };

  const addPost = (newPost: AddPostInput) => {
    const chosenAuthorId = newPost.authorId || profile.id;
    const usingActiveProfile = chosenAuthorId === profile.id;

    const baseAuthor = usingActiveProfile
      ? profileToAuthor(profile)
      : profileToAuthor(getUserById(chosenAuthorId) ?? getRandomUser());

    const postId =
      newPost.id ??
      (typeof window !== 'undefined' &&
      typeof window.crypto?.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : Math.floor(Math.random() * 1_000_000));

    const basePost: PostRecord = {
      id: String(postId),
      title: newPost.title,
      body: newPost.body,
      authorId: baseAuthor.id,
      author: baseAuthor,
      ownerId: usingActiveProfile ? profile.id : null,
      likes: 0,
      likedBy: [],
      likedByMe: false,
      source: 'local',
      comments: [],
      bookmarkedBy: [],
      bookmarkedByMe: false,
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
      tags: [],
    };

    setPosts((prevPosts) =>
      applyPersonalization([basePost, ...prevPosts], profile)
    );
    setStatusMessage('Post added!');

    return true;
  };

  const removePost = (targetId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== targetId));
  };

  const toggleLike = (targetId: string) => {
    setPosts((prevPosts) =>
      applyPersonalization(
        prevPosts.map((post) => {
          if (post.id !== targetId) return post;

          const likedBy = Array.isArray(post.likedBy)
            ? [...post.likedBy]
            : [];
          const alreadyLikedIndex = likedBy.indexOf(profile.id);
          const alreadyLiked = alreadyLikedIndex !== -1;

          if (alreadyLiked) {
            likedBy.splice(alreadyLikedIndex, 1);
          } else {
            likedBy.push(profile.id);
          }

          const nextLikes = Math.max(
            0,
            post.likes + (alreadyLiked ? -1 : 1)
          );

          return {
            ...post,
            likedBy,
            likes: nextLikes,
          };
        }),
        profile
      )
    );
  };

  const toggleBookmark = (targetId: string) => {
    setPosts((prevPosts) =>
      applyPersonalization(
        prevPosts.map((post) => {
          if (post.id !== targetId) return post;
          const bookmarkedBy = Array.isArray(post.bookmarkedBy)
            ? [...post.bookmarkedBy]
            : [];
          const index = bookmarkedBy.indexOf(profile.id);
          const alreadyBookmarked = index !== -1;

          if (alreadyBookmarked) {
            bookmarkedBy.splice(index, 1);
          } else {
            bookmarkedBy.push(profile.id);
          }

          return {
            ...post,
            bookmarkedBy,
          };
        }),
        profile
      )
    );
  };

  const addComment = (postId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return false;

    const commentId =
      typeof window !== 'undefined' &&
      typeof window.crypto?.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setPosts((prevPosts) =>
      applyPersonalization(
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...(Array.isArray(post.comments) ? post.comments : []),
                  {
                    id: commentId,
                    author: profile.name,
                    authorId: profile.id,
                    body: trimmed,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : post
        ),
        profile
      )
    );

    return true;
  };

  const value: AppStateContextValue = {
    loading,
    posts,
    filteredPosts,
    filter,
    setFilter,
    search,
    setSearch,
    searchTerm,
    statusMessage,
    setStatusMessage,
    summaryItems,
    profile,
    updateProfile,
    addPost,
    removePost,
    toggleLike,
    toggleBookmark,
    addComment,
    filterOptions: FILTER_OPTIONS,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
