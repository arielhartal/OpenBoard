import { AuthorProfile, PostRecord } from "./types";

const USERS: AuthorProfile[] = [
  {
    id: "lena",
    name: "Lena Ortiz",
    handle: "@lena.codes",
    avatarColor: "#6366f1",
    avatarInitial: "L",
  },
  {
    id: "devon",
    name: "Devon Carter",
    handle: "@devon_ui",
    avatarColor: "#fb7185",
    avatarInitial: "D",
  },
  {
    id: "amir",
    name: "Amir Patel",
    handle: "@amir.builds",
    avatarColor: "#34d399",
    avatarInitial: "A",
  },
  {
    id: "zoe",
    name: "Zoe Kim",
    handle: "@zoe.design",
    avatarColor: "#f59e0b",
    avatarInitial: "Z",
  },
];

const FALLBACK_AUTHOR: AuthorProfile = {
  id: "openboard",
  name: "OpenBoard User",
  handle: "@openboard",
  avatarInitial: "?",
  avatarColor: "#94a3b8",
};

function getUserForIndex(index: number): AuthorProfile {
  return USERS[index % USERS.length];
}

function getRandomUser(): AuthorProfile {
  const randomIndex = Math.floor(Math.random() * USERS.length);
  return USERS[randomIndex];
}

function getUserById(id?: string | null): AuthorProfile | undefined {
  if (!id) return undefined;
  return USERS.find((user) => user.id === id);
}

type RawPost = Partial<PostRecord> & { id: string | number };

function createTimestampFromIndex(index: number): string {
  const minutesAgo = (index + 1) * 12;
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

function createLikesFromIndex(index: number): number {
  if (Number.isNaN(index)) return 0;
  const base = (index * 7) % 18;
  return base < 0 ? 0 : base;
}

function decoratePostWithUser(post: RawPost, index = 0): PostRecord {
  const hasAuthor = Boolean(post.author && post.author.id);
  const baseUser = hasAuthor
    ? (post.author as AuthorProfile)
    : getUserForIndex(index);

  const likedBy = Array.isArray(post.likedBy) ? [...new Set(post.likedBy)] : [];
  const bookmarkedBy = Array.isArray(post.bookmarkedBy)
    ? [...new Set(post.bookmarkedBy)]
    : [];
  const comments = Array.isArray(post.comments)
    ? post.comments.map((comment) => ({
        ...comment,
        id: String(comment.id ?? crypto.randomUUID?.() ?? Math.random().toString(16).slice(2)),
        createdAt:
          comment.createdAt ?? new Date(Date.now() - index * 60000).toISOString(),
      }))
    : [];

  return {
    id: String(post.id),
    title: post.title ?? "Untitled",
    body: post.body ?? "",
    author: { ...baseUser },
    authorId: post.authorId ?? baseUser.id,
    ownerId: post.ownerId ?? null,
    likes:
      typeof post.likes === "number" ? post.likes : createLikesFromIndex(index),
    likedBy,
    likedByMe: Boolean(post.likedByMe),
    bookmarkedBy,
    bookmarkedByMe: Boolean(post.bookmarkedByMe),
    comments,
    createdAt: post.createdAt ?? createTimestampFromIndex(index),
    updatedAt: post.updatedAt,
    tags: Array.isArray(post.tags) ? post.tags : [],
    source: post.source,
  };
}

function enrichWithUsers(posts: RawPost[]): PostRecord[] {
  if (!Array.isArray(posts)) return [];
  return posts.map((post, index) => decoratePostWithUser(post, index));
}

function formatRelativeTime(createdAt?: string): string {
  if (!createdAt) return "Now";
  const timestamp = Date.parse(createdAt);
  if (Number.isNaN(timestamp)) return "Now";

  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Now";
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  if (diff < day * 7) return `${Math.floor(diff / day)}d`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatExactTime(createdAt?: string): string {
  if (!createdAt) return "";
  const timestamp = Date.parse(createdAt);
  if (Number.isNaN(timestamp)) return "";

  return new Date(timestamp).toLocaleString();
}

export {
  USERS,
  FALLBACK_AUTHOR,
  getRandomUser,
  getUserById,
  decoratePostWithUser,
  enrichWithUsers,
  formatRelativeTime,
  formatExactTime,
};
