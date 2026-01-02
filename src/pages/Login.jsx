import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Google login failed");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Today Felt Like</h1>
      <p style={styles.subtitle}>One word. One day.</p>

      <button style={styles.button} onClick={handleGoogleLogin}>
        Continue with Google
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#FAF7F5",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, sans-serif"
  },
  title: {
    fontSize: "40px",
    marginBottom: "8px"
  },
  subtitle: {
    fontSize: "16px",
    color: "#777",
    marginBottom: "30px"
  },
  button: {
    padding: "14px 22px",
    borderRadius: "14px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    background: "#E8CFC4"
  }
};

export default Login;
