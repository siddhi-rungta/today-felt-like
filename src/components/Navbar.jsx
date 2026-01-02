import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const item = (path) => ({
    textDecoration: "none",
    fontSize: "14px",
    color: pathname === path ? "#000" : "#888",
    fontWeight: pathname === path ? "600" : "400"
  });

  return (
    <div style={styles.bar}>
      <Link to="/" style={item("/")}>Today</Link>
      <Link to="/timeline" style={item("/timeline")}>Timeline</Link>
    </div>
  );
}

const styles = {
  bar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "#FFF",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderTop: "1px solid #EEE"
  }
};
