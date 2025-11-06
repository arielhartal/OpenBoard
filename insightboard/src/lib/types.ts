export type AuthorProfile = {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  avatarInitial: string;
};

export type PostComment = {
  id: string;
  author: string;
  authorId?: string;
  body: string;
  createdAt: string;
};

export type PostRecord = {
  id: string;
  title: string;
  body: string;
  author: AuthorProfile;
  authorId?: string;
  ownerId?: string | null;
  likes: number;
  likedBy: string[];
  likedByMe: boolean;
  bookmarkedBy: string[];
  bookmarkedByMe: boolean;
  comments: PostComment[];
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  source?: string;
};

export type UserProfile = AuthorProfile & {
  avatarInitial: string;
};

export type FilterOptionId = "latest" | "likes" | "local" | "bookmarked";
