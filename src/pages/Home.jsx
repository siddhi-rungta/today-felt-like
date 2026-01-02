import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const moods = [
  { id: "sad", emoji: "😿", label: "Sad", color: "#FADADD" },
  { id: "low", emoji: "😕", label: "Low", color: "#FBE7C6" },
  { id: "okay", emoji: "😐", label: "Okay", color: "#E5E7EB" },
  { id: "good", emoji: "🙂", label: "Good", color: "#D1FAE5" },
  { id: "happy", emoji: "😊", label: "Happy", color: "#BBF7D0" },

  // physical
  { id: "tired", emoji: "😴", label: "Tired", color: "#E0E7FF" },
  { id: "sick", emoji: "🤒", label: "Sick", color: "#FEE2E2" },

  // emotional
  { id: "anxious", emoji: "😰", label: "Anxious", color: "#FFE4E6" },
  { id: "calm", emoji: "🌿", label: "Calm", color: "#ECFDF5" },

  // period-friendly (soft wording)
  { id: "crampy", emoji: "🌸", label: "Crampy", color: "#FCE7F3" },
  { id: "low_energy", emoji: "🌙", label: "Low energy", color: "#EDE9FE" }
];

export default function Home() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const firstName = user?.displayName?.split(" ")[0] || "there";
  const todayKey = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = doc(db, "users", user.uid, "entries", todayKey);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSelectedMood(snap.data().mood || null);
        setNote(snap.data().note || "");
      }
      setLoading(false);
    };

    load();
  }, [user, todayKey]);

  const saveMood = async (moodId) => {
    setSelectedMood(moodId);
    await setDoc(
      doc(db, "users", user.uid, "entries", todayKey),
      { mood: moodId, note, createdAt: serverTimestamp() },
      { merge: true }
    );
  };

  if (loading) return null;

  return (
    <div style={styles.container}>
      <p style={styles.hello}>✨ Hey {firstName}!</p>
      <h1 style={styles.title}>How are you feeling today?</h1>

      <div style={styles.moodRow}>
        {moods.map((m) => (
          <div
            key={m.id}
            onClick={() => saveMood(m.id)}
            style={{
              ...styles.moodCard,
              background: m.color,
              transform: selectedMood === m.id ? "scale(1.08)" : "scale(1)",
              boxShadow:
                selectedMood === m.id
                  ? "0 8px 20px rgba(0,0,0,0.12)"
                  : "none"
            }}
          >
            <div style={styles.emoji}>{m.emoji}</div>
            <div style={styles.label}>{m.label}</div>
          </div>
        ))}
      </div>

      <textarea
        placeholder="Write a little note about today…"
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
    background: "linear-gradient(180deg, #FFF3EC, #FFE8D9)",
    padding: "28px 20px",
    textAlign: "center",
    fontFamily: "Inter, system-ui"
  },
  hello: {
    fontSize: "16px",
    marginBottom: "6px",
    color: "#666"
  },
  title: {
    fontSize: "26px",
    marginBottom: "24px"
  },
  moodRow: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap"
  },
  moodCard: {
    width: "78px",
    height: "78px",
    borderRadius: "22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    cursor: "pointer",
    transition: "0.2s"
  },
  emoji: {
    fontSize: "28px"
  },
  label: {
    fontSize: "12px",
    marginTop: "4px"
  },
  textarea: {
    marginTop: "22px",
    width: "100%",
    maxWidth: "340px",
    borderRadius: "16px",
    padding: "12px",
    border: "none",
    fontSize: "14px"
  },
  saved: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#888"
  }
};
