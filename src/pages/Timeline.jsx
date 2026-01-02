import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const moodsMap = {
  sad: { emoji: "😔", color: "#F4A261" },
  low: { emoji: "😕", color: "#E9C46A" },
  neutral: { emoji: "😐", color: "#D3D3D3" },
  good: { emoji: "🙂", color: "#A8DADC" },
  happy: { emoji: "😊", color: "#90DB8A" }
};

function Timeline() {
  const [entries, setEntries] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  const user = auth.currentUser;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // ✅ LOCAL date (no timezone bug)
  const todayKey = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    if (!user) return;

    const loadEntries = async () => {
      const ref = collection(db, "users", user.uid, "entries");
      const snap = await getDocs(ref);

      const data = {};
      snap.forEach((doc) => {
        data[doc.id] = doc.data();
      });

      setEntries(data);
    };

    loadEntries();
  }, [user]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {today.toLocaleString("default", { month: "long" })} {year}
      </h1>

      <div style={styles.grid}>
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;

          const mood = entries[key]?.mood;
          const isToday = key === todayKey;

          return (
            <div
              key={day}
              onClick={() => mood && setSelectedDay(key)}
              style={{
                ...styles.cell,
                background: mood ? moodsMap[mood].color : "#EEE",
                border: isToday ? "2px solid #333" : "none",
                cursor: mood ? "pointer" : "default"
              }}
            >
              {mood ? moodsMap[mood].emoji : ""}
            </div>
          );
        })}
      </div>

      {/* ✅ VIEW-ONLY MODAL */}
      {selectedDay && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: "10px" }}>{selectedDay}</h3>

            <div style={styles.noteBox}>
              {entries[selectedDay]?.note || "No note added for this day."}
            </div>

            <button
              style={styles.closeBtn}
              onClick={() => setSelectedDay(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#FAF7F5",
    padding: "24px",
    fontFamily: "Inter, sans-serif"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "12px",
    maxWidth: "420px",
    margin: "0 auto"
  },
  cell: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modal: {
    background: "#FFF",
    borderRadius: "18px",
    padding: "20px",
    width: "90%",
    maxWidth: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  noteBox: {
    background: "#F6F6F6",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "14px",
    whiteSpace: "pre-wrap"
  },
  closeBtn: {
    border: "none",
    background: "#333",
    color: "#FFF",
    padding: "10px",
    borderRadius: "12px",
    cursor: "pointer"
  }
};

export default Timeline;
