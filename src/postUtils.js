const USERS = [
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

const FALLBACK_AUTHOR = {
  id: "openboard",
  name: "OpenBoard User",
  handle: "@openboard",
  avatarInitial: "?",
  avatarColor: "#94a3b8",
};

function getUserForIndex(index) {
  return USERS[index % USERS.length];
}

function getRandomUser() {
  const randomIndex = Math.floor(Math.random() * USERS.length);
  return USERS[randomIndex];
}

function createTimestampFromIndex(index) {
  const minutesAgo = (index + 1) * 12;
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

function decoratePostWithUser(post, index = 0) {
  const hasAuthor = post.author && post.author.id;
  const baseUser = hasAuthor ? post.author : getUserForIndex(index);

  return {
    ...post,
    author: hasAuthor ? { ...post.author } : { ...baseUser },
    createdAt: post.createdAt ?? createTimestampFromIndex(index),
  };
}

function enrichWithUsers(posts) {
  if (!Array.isArray(posts)) return [];
  return posts.map((post, index) => decoratePostWithUser(post, index));
}

function formatRelativeTime(createdAt) {
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

function formatExactTime(createdAt) {
  if (!createdAt) return "";
  const timestamp = Date.parse(createdAt);
  if (Number.isNaN(timestamp)) return "";

  return new Date(timestamp).toLocaleString();
}

export {
  USERS,
  FALLBACK_AUTHOR,
  getRandomUser,
  decoratePostWithUser,
  enrichWithUsers,
  formatRelativeTime,
  formatExactTime,
};
