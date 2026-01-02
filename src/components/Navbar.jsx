import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const link = (path) => ({
    textDecoration: "none",
    fontWeight: pathname === path ? "600" : "400",
    color: pathname === path ? "#000" : "#888"
  });

  return (
    <div style={styles.nav}>
      <Link to="/" style={link("/")}>Today</Link>
      <Link to="/timeline" style={link("/timeline")}>Timeline</Link>
      <Link to="/charts" style={link("/charts")}>Charts</Link>
    </div>
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
};
