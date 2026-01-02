import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <Link
        to="/"
        style={{
          ...styles.link,
          fontWeight: location.pathname === "/" ? "600" : "400"
        }}
      >
        Today
      </Link>

      <Link
        to="/timeline"
        style={{
          ...styles.link,
          fontWeight: location.pathname === "/timeline" ? "600" : "400"
        }}
      >
        Timeline
      </Link>
    </nav>
  );
}

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "64px",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    fontFamily: "Inter, sans-serif"
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontSize: "16px"
  }
};

export default Navbar;
