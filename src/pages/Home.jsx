import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const moods = [
  { id: "sad", emoji: "😔", label: "Sad", color: "#F4A261" },
  { id: "low", emoji: "😕", label: "Low", color: "#E9C46A" },
  { id: "neutral", emoji: "😐", label: "Neutral", color: "#D3D3D3" },
  { id: "good", emoji: "🙂", label: "Good", color: "#A8DADC" },
  { id: "happy", emoji: "😊", label: "Happy", color: "#90DB8A" }
];

function Home() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const todayKey = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    if (!user) return;

    const loadToday = async () => {
      const ref = doc(db, "users", user.uid, "entries", todayKey);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSelectedMood(snap.data().mood);
      }
      setLoading(false);
    };

    loadToday();
  }, [user, todayKey]);

  const saveMood = async (moodId) => {
    setSelectedMood(moodId);

    const ref = doc(db, "users", user.uid, "entries", todayKey);
    await setDoc(ref, {
      mood: moodId,
      createdAt: serverTimestamp()
    });
  };

  if (loading) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>How did today feel?</h1>

      <div style={styles.moodRow}>
        {moods.map((m) => (
          <button
            key={m.id}
            onClick={() => saveMood(m.id)}
            style={{
              ...styles.moodButton,
              background: selectedMood === m.id ? m.color : "#FFFFFF",
              transform: selectedMood === m.id ? "scale(1.15)" : "scale(1)"
            }}
          >
            <span style={styles.emoji}>{m.emoji}</span>
            <span style={styles.label}>{m.label}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <p style={styles.saved}>Saved for today ✨</p>
      )}
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
    fontSize: "36px",
    marginBottom: "32px"
  },
  moodRow: {
    display: "flex",
    gap: "18px"
  },
  moodButton: {
    border: "none",
    borderRadius: "20px",
    padding: "16px 14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "90px"
  },
  emoji: {
    fontSize: "32px",
    marginBottom: "6px"
  },
  label: {
    fontSize: "14px"
  },
  saved: {
    marginTop: "24px",
    fontSize: "14px",
    color: "#888"
  }
};

export default Home;
