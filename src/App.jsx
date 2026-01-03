import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Timeline from "./pages/Timeline";
import Navbar from "./components/Navbar";
import Charts from "./pages/Charts";
import Profile from "./pages/Profile";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route
          path="/timeline"
          element={user ? <Timeline /> : <Navigate to="/login" />}
        />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route
          path="/charts"
          element={user ? <Charts /> : <Navigate to="/login" />}
        />
      </Routes>

  {user && <Navbar user={user} />}
    </BrowserRouter>
  );
}

export default App;
