import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PostList from "./PostList";
import PostDetails from "./PostDetails";
import "./App.css";
import AddPost from "./AddPost";

const STORAGE_KEY = "openboard.posts";

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    try {
      const storedPostsRaw = window.localStorage.getItem(STORAGE_KEY);
      if (storedPostsRaw) {
        try {
          const parsed = JSON.parse(storedPostsRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
            setLoading(false);
            return;
          }
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // localStorage unavailable (e.g., private mode); fall back to fetch
    }

    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  function handleAddPost(newPost) {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setStatusMessage("Post added!");
    return true;
  }
  function handleRemovePost(targetId) {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== targetId));
    setStatusMessage("Post removed.");
  }

  useEffect(() => {
    if (!statusMessage) return undefined;

    const timeoutId = window.setTimeout(() => {
      setStatusMessage("");
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [statusMessage]);

  useEffect(() => {
    if (loading) return;

    if (posts.length === 0) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // storage unavailable; nothing else to do
      }
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // storage unavailable; proceed without persistence
    }
  }, [posts, loading]);


  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="app-title-link">
            <h1 className="app-title">OpenBoard</h1>
          </Link>
          <p className="app-subtitle">
            Browse sample posts from JSONPlaceholder and filter by title.
          </p>
          <input
            className="search-input"
            type="text"
            placeholder="Search post title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link to="/add" className="add-post-button">Add New Post</Link>
          {statusMessage && (
            <p className="flash-message" role="status">
              {statusMessage}
            </p>
          )}
        </header>
        <main className="app-content">
          <Routes>
            <Route
              path="/"
              element={
                loading ? (
                  <p className="status-text">Loading posts...</p>
                ) : (
                  <PostList posts={filteredPosts} onDeletePost={handleRemovePost} />
                )
              }
            />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route
              path="/add" element={<AddPost onAddPost={handleAddPost} />}
              />

          </Routes>
        </main>
      </div>
    </Router>
  );
}



export default App;
