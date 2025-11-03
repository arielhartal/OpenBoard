import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PostList from "./PostList";
import PostDetails from "./PostDetails";
import "./App.css";
import AddPost from "./AddPost";

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
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
  }


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
        </header>
        <main className="app-content">
          <Routes>
            <Route
              path="/"
              element={
                loading ? (
                  <p className="status-text">Loading posts...</p>
                ) : (
                  <PostList posts={filteredPosts} />
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
