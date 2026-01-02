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
    background: "#FFFFFF",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderTop: "1px solid #EEE",
    fontFamily: "Inter, sans-serif"
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontSize: "16px"
  }
};

export default Navbar;
