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

export default function Home() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const user = auth.currentUser;

  // ✅ LOCAL date (fixes date mismatch bug)
  const todayKey = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    if (!user) return;

    // ✅ set name safely
    setName(user.displayName || "");

    const loadToday = async () => {
      const ref = doc(db, "users", user.uid, "entries", todayKey);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSelectedMood(snap.data().mood || null);
        setNote(snap.data().note || "");
      }

      setLoading(false);
    };

    loadToday();
  }, [user, todayKey]);

  const saveMood = async (moodId) => {
    if (!user) return;

    setSelectedMood(moodId);

    const ref = doc(db, "users", user.uid, "entries", todayKey);
    await setDoc(
      ref,
      {
        mood: moodId,
        note,
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
  };

  if (loading) return null;
  const firstName = name ? name.split(" ")[0] : "";

  return (
    <div style={styles.container}>
        <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 6 }}>
          Hey {firstName || "there"}✨
        </p>

        <h1 style={styles.title}>
            How did today feel?
        </h1>
      <div style={styles.moodRow}>
        {moods.map((m) => (
          <button
            key={m.id}
            onClick={() => saveMood(m.id)}
            style={{
              ...styles.moodButton,
              background: selectedMood === m.id ? m.color : "#FFFFFF",
              transform: selectedMood === m.id ? "scale(1.08)" : "scale(1)",
              boxShadow:
              selectedMood === m.id
                ? "0 14px 30px rgba(0,0,0,0.14)"
                : "0 10px 24px rgba(0,0,0,0.08)"
            }}
          >
            <span style={styles.emoji}>{m.emoji}</span>
            <span style={styles.label}>{m.label}</span>
          </button>
        ))}
      </div>

      <textarea
        placeholder="Write a little memory for today…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => selectedMood && saveMood(selectedMood)}
        style={styles.textarea}
      />

      {selectedMood && <p style={styles.saved}>Saved for today 🌱</p>}
    </div>
  );
}

const styles = {
    container: {
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FFF7F3 0%, #F6EFEA 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily: "Inter, system-ui"
    },
  title: {
    fontSize: "34px",
    fontWeight: 700,
    textAlign: "center",
    lineHeight: 1.2,
    marginBottom: "36px",
    color: "#1F1F1F"
  },
  moodRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  moodButton: {
    border: "none",
    borderRadius: "26px",
    padding: "16px 14px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "82px",
    background: "#FFFFFF",
    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
    transition: "all 0.25s ease"
  },
  emoji: {
    fontSize: "34px",
    marginBottom: "6px"
  },
  label: {
    fontSize: "12px",
    opacity: 0.65
  },
   textarea: {
    width: "100%",
    maxWidth: "360px",
    minHeight: "90px",
    borderRadius: "22px",
    padding: "14px 16px",
    border: "none",
    resize: "none",
    fontSize: "14px",
    background: "#FFFFFF",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    outline: "none",
    marginTop: "12px"
  },
  saved: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#777",
    opacity: 0.8
  }
};
