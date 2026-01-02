import { signInWithPopup, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("google"); // google | email | phone | anonymous
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [phone, setPhone] = useState("");

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Google login failed");
    }
  };

  const handleAnonymous = async () => {
    try {
      await signInAnonymously(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Anonymous sign-in failed");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNew) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message || 'Email auth failed');
    }
  };

  const handlePhone = (e) => {
    e.preventDefault();
    // Phone requires setting up reCAPTCHA and verification; provide guidance.
    alert("Phone auth requires reCAPTCHA setup on the web. Please configure Firebase phone auth and reCAPTCHA in your firebase.js. For now this UI is a placeholder.");
  };

  return (
    <div className="app-container" style={styles.container}>
      <h1 style={styles.title}>Today Felt Like</h1>
      <p style={styles.subtitle}>One word. One day.</p>

      <div style={styles.methodsRow}>
        <button onClick={() => setMethod('google')} style={{...styles.smallBtn, ...(method==='google'?styles.activeBtn:{} )}}>Google</button>
        <button onClick={() => setMethod('email')} style={{...styles.smallBtn, ...(method==='email'?styles.activeBtn:{} )}}>Email</button>
        <button onClick={() => setMethod('phone')} style={{...styles.smallBtn, ...(method==='phone'?styles.activeBtn:{} )}}>Phone</button>
        <button onClick={() => setMethod('anonymous')} style={{...styles.smallBtn, ...(method==='anonymous'?styles.activeBtn:{} )}}>Anonymous</button>
      </div>

      <div style={{marginTop:18, width: '100%', maxWidth: 420}}>
        {method === 'google' && (
          <button style={styles.button} onClick={handleGoogleLogin}>
            Continue with Google
          </button>
        )}

        {method === 'anonymous' && (
          <>
            <p style={{color:'#555'}}>Sign in without creating an account.</p>
            <button style={styles.button} onClick={handleAnonymous}>Continue anonymously</button>
          </>
        )}

        {method === 'email' && (
          <form onSubmit={handleEmailSubmit} style={styles.form}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

            <label style={styles.label}>Password</label>
            <input style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

            <div style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
              <button type="submit" style={styles.button}>{isNew ? 'Create account' : 'Sign in'}</button>
              <button type="button" onClick={() => setIsNew(!isNew)} style={styles.linkBtn}>{isNew ? 'Have an account?' : 'Create account'}</button>
            </div>
          </form>
        )}

        {method === 'phone' && (
          <form onSubmit={handlePhone} style={styles.form}>
            <label style={styles.label}>Phone</label>
            <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" />
            <p style={{fontSize:13, color:'#666'}}>Phone auth requires a reCAPTCHA verifier in the app. See Firebase docs. This is a placeholder UI.</p>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button type="submit" style={styles.button}>Continue</button>
            </div>
          </form>
        )}
      </div>
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
    marginBottom: "12px"
  },
  methodsRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  smallBtn: {
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid #E6E6E6',
    background: '#FFF',
    cursor: 'pointer'
  },
  activeBtn: { boxShadow: '0 4px 10px rgba(0,0,0,0.06)' },
  button: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    background: "#E8CFC4",
    width: '100%'
  },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, color:'#444' },
  input: { padding: 10, borderRadius: 10, border: '1px solid #E6E6E6' },
  linkBtn: { background: 'transparent', border: 'none', color: '#333', cursor: 'pointer' }
};

export default Login;
