import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const moodsMap = {
  sad: { emoji: "😿", color: "#FADADD" },
  low: { emoji: "😕", color: "#FBE7C6" },
  okay: { emoji: "😐", color: "#E5E7EB" },
  good: { emoji: "🙂", color: "#D1FAE5" },
  happy: { emoji: "😊", color: "#BBF7D0" },

  tired: { emoji: "😴", color: "#E0E7FF" },
  sick: { emoji: "🤒", color: "#FEE2E2" },

  anxious: { emoji: "😰", color: "#FFE4E6" },
  calm: { emoji: "🌿", color: "#ECFDF5" },

  crampy: { emoji: "🌸", color: "#FCE7F3" },
  low_energy: { emoji: "🌙", color: "#EDE9FE" }
};

function Timeline() {
  const user = auth.currentUser;

  const [entries, setEntries] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  // 📅 month navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ✅ local-safe today key
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

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div style={styles.container}>
      {/* 🌸 Header */}
      <div style={styles.header}>
        <button onClick={goPrevMonth} style={styles.navBtn}>‹</button>

        <div>
          <p style={styles.subTitle}>Your little moments ✨</p>
          <h1 style={styles.title}>
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </h1>
        </div>

        <button onClick={goNextMonth} style={styles.navBtn}>›</button>
      </div>

      {/* 🟢 Grid */}
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
                border: isToday ? "3px solid rgba(0,0,0,0.15)" : "none",
                boxShadow: isToday
                  ? "0 0 0 6px rgba(0,0,0,0.05)"
                  : "none",
                cursor: mood ? "pointer" : "default"
              }}
            >
              {mood ? moodsMap[mood].emoji : ""}
            </div>
          );
        })}
      </div>

      {/* 💬 View-only modal */}
      {selectedDay && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{selectedDay}</h3>

            <div style={styles.noteBox}>
              {entries[selectedDay]?.note || "No note added for this day."}
            </div>

            <button style={styles.closeBtn} onClick={() => setSelectedDay(null)}>
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
    background: "linear-gradient(180deg, #FFF7F3 0%, #EFE6DF 100%)",
    padding: "28px 20px",
    fontFamily: "Inter, system-ui"
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "420px",
    margin: "0 auto 24px",
    textAlign: "center"
  },

  title: {
    margin: 0
  },

  subTitle: {
    fontSize: "13px",
    opacity: 0.6,
    marginBottom: "4px"
  },

  navBtn: {
    border: "none",
    background: "#FFF",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    fontSize: "22px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "12px",
    maxWidth: "500px",
    margin: "0 auto"
  },
    cell: {
        width: "60px",
        height: "60px",
        borderRadius: "20%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
        transition: "transform 0.15s"
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
