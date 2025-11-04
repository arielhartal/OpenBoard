<div align="center">
  <img src="public/favicon.ico" alt="OpenBoard logo" width="72" />
  <h1>OpenBoard</h1>
  <p>A polished social board to share ideas, react to posts, and curate your favorites.</p>
</div>

---

## ✨ Overview

OpenBoard is a React app designed to showcase real-world UI patterns and state management without needing a backend. It seeds realistic posts, then lets you:

- Add new posts and instantly persist them to `localStorage`.
- Highlight text matches, filter by likes/bookmarks/personal posts, and search titles or bodies.
- React with likes, toggle bookmarks, and drop quick comments per post.
- Personalize the active profile (name/handle/color) and post as that profile.
- Jump between list and detail views with a responsive, interview-ready UI.

## 🚀 Live Demo

**Live site:** https://openboard-arielhartal.netlify.app/

### Deploy to Netlify (no config needed)

1. `npm run build`
2. Either drag the `build/` folder onto [Netlify Drop](https://app.netlify.com/drop), **or** run `netlify deploy --dir=build` (preview) followed by `netlify deploy --prod --dir=build`.
3. Update the link above and the project description so people can try it instantly.

## 🧱 Features

- **Smart feed:** Search, filter, and highlight matches for fast scanning.
- **Profile switching:** Update your display name, handle, and avatar color—posts added with that profile are marked as “My posts.”
- **Bookmarks & likes:** Toggle and persist per user; filter down to just saved content.
- **Comments:** Inline comment drawer per card plus a dedicated section in the detail route.
- **Offline-ready state:** Everything is stored in `localStorage`; seeding uses JSONPlaceholder only on first load.
- **Interview polish:** Skeleton loaders, activity summary bar, animated toast feedback, keyboard-friendly focus rings.

## 🛠️ Stack

- React + React Router
- CSS (hand-crafted with modern layout/focus states)
- localStorage for persistence
- JSONPlaceholder for initial seed data

## 🧑‍💻 Getting Started

```bash
git clone https://github.com/<your-username>/openboard.git
cd openboard
npm install
npm start
```

The app seeds posts on first launch, then stores everything locally under `openboard.posts`.

## 📦 Production Build

```bash
npm run build
```

Outputs a minified build to `/build`. Deploy the folder on Netlify, Vercel, GitHub Pages, or any static host.

## 🗺️ Roadmap

- Dark mode toggle with persisted preference.
- Shareable permalink for individual posts (pre-populated comments).
- Basic E2E tests (Playwright/Cypress) and lint/test workflow.

## 🤝 Contributing

Issues and PRs are welcome—fork the repo, branch off `main`, and open a pull request.

---

Made with ☕ by <your name> for the OpenBoard interview project.
