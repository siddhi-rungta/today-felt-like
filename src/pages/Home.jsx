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
      <h1 style={styles.title}>
        {name ? `Hey ${firstName}  ✨, how did today feel?` : "How did today feel?"}
      </h1>

      <div style={styles.moodRow}>
        {moods.map((m) => (
          <button
            key={m.id}
            onClick={() => saveMood(m.id)}
            style={{
              ...styles.moodButton,
              background: selectedMood === m.id ? m.color : "#FFFFFF",
              transform: selectedMood === m.id ? "scale(1.1)" : "scale(1)"
            }}
          >
            <span style={styles.emoji}>{m.emoji}</span>
            <span style={styles.label}>{m.label}</span>
          </button>
        ))}
      </div>

      <textarea
        placeholder="Add a small note for today (optional)…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => selectedMood && saveMood(selectedMood)}
        style={styles.textarea}
      />

      {selectedMood && <p style={styles.saved}>Saved for today ✨</p>}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #FAF7F5 0%, #F3EFEA 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 20px",
    fontFamily: "Inter, system-ui, -apple-system"
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
    borderRadius: "24px",
    padding: "16px 14px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "82px",
    background: "#FFFFFF",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "all 0.25s ease"
  },
  emoji: {
    fontSize: "30px"
  },
  label: {
    fontSize: "13px",
    marginTop: "4px"
  },
  textarea: {
    width: "100%",
    maxWidth: "360px",
    minHeight: "90px",
    borderRadius: "20px",
    padding: "14px 16px",
    border: "none",
    resize: "none",
    fontSize: "14px",
    background: "#FFFFFF",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    outline: "none",
    marginTop: "10px"
  },
  saved: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#777"
  }
};
