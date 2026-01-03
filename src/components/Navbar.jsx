import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar({ user }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const link = (path) => ({
    textDecoration: "none",
    fontWeight: pathname === path ? "600" : "400",
    color: pathname === path ? "#000" : "#888"
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('logout failed', err);
    }
  };

  const initials = (user?.displayName || user?.email || 'U').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();

  return (
    <>
      <div className="bottom-nav" style={styles.nav}>
        <Link to="/" style={link("/")}>Today</Link>
        <Link to="/timeline" style={link("/timeline")}>Timeline</Link>
        <Link to="/charts" style={link("/charts")}>Charts</Link>
      </div>

      {/* floating profile button */}
      <div style={styles.profileWrap} ref={menuRef}>
        <button style={styles.profileBtn} onClick={() => setOpen(s => !s)} aria-label="Profile">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" style={styles.avatar} />
          ) : (
            <span style={styles.initials}>{initials}</span>
          )}
        </button>

        {open && (
          <div style={styles.menu}>
            <div style={styles.menuItem} onClick={() => { setOpen(false); navigate('/'); }}>Profile</div>
            <div style={{...styles.menuItem, color: '#c0392b'}} onClick={handleLogout}>Logout</div>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "56px",
    background: "#FFF",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    fontFamily: "Inter, system-ui",
    zIndex: 10
  }
  ,
  profileWrap: {
    position: 'fixed',
    top: 18,
    right: 18,
    zIndex: 40
  },

  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    border: 'none',
    background: '#fff',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  avatar: { width: 40, height: 40, borderRadius: 20, objectFit: 'cover' },
  initials: { fontSize: 14, color: '#111', fontWeight: 600 },

  menu: {
    marginTop: 10,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    minWidth: 140
  },

  menuItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(0,0,0,0.03)'
  }
};
