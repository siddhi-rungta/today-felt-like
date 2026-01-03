import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";

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
  const [editMood, setEditMood] = useState(null);
  const [editNote, setEditNote] = useState("");

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
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="app-container" style={styles.container}>
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

      {/* 🟢 Calendar headers (weekday names) */}
      <div className="calendar-headers">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="day-name">{d}</div>
        ))}
      </div>

      {/* 🟢 Grid */}
      <div className="timeline-grid" style={styles.grid}>
        {/* leading empty slots to align first day */}
        {[...Array(firstDayOfWeek)].map((_, idx) => (
          <div key={`empty-${idx}`} className="timeline-cell" style={{...styles.cell, background: 'transparent', boxShadow: 'none'}} />
        ))}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;

          const mood = entries[key]?.mood;
          const isToday = key === todayKey;
          const isFuture = key > todayKey; // simple YYYY-MM-DD string compare works

          return (
            <div
              key={day}
              className="timeline-cell"
              onClick={() => {
                if (isFuture) return;
                setSelectedDay(key);
              }}
              style={{
                ...styles.cell,
                background: mood ? moodsMap[mood].color : "#EEE",
                border: isToday ? "3px solid rgba(0,0,0,0.15)" : "none",
                boxShadow:
                  selectedDay === key
                    ? "0 8px 20px rgba(0,0,0,0.12)"
                    : isToday
                    ? "0 0 0 6px rgba(0,0,0,0.05)"
                    : "none",
                cursor: isFuture ? "not-allowed" : "pointer",
                transform: selectedDay === key ? "scale(1.03)" : "none",
                position: 'relative'
              }}
            >
              <div style={{position: 'absolute', top: 8, left: 10, fontSize: 13, color: '#333'}}>{day}</div>
              <div style={{fontSize: 36, lineHeight: 1}}>{mood ? moodsMap[mood].emoji : ''}</div>
            </div>
          );
        })}
      </div>

      {/* 💬 View-only modal */}
      {selectedDay && (
        <div style={styles.overlay}>
          <div style={{...styles.modal, transform: 'scale(1)', transition: 'transform 160ms ease'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0}}>{selectedDay}</h3>
              <button style={styles.closeX} onClick={() => setSelectedDay(null)}>✕</button>
            </div>

            <p style={{margin: 0, color: '#666', fontSize: 13}}>Pick a mood or update the note for this day.</p>

            {/* mood picker */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12}}>
              {Object.entries(moodsMap).map(([key, {emoji}]) => {
                const active = (editMood || entries[selectedDay]?.mood) === key;
                return (
                  <button
                    key={key}
                    onClick={() => setEditMood(key)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 12,
                      border: active ? '2px solid #333' : '1px solid rgba(0,0,0,0.08)',
                      background: active ? '#FFF' : '#FAFAFA',
                      cursor: 'pointer',
                      fontSize: 18,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <span style={{fontSize: 20}}>{emoji}</span>
                    <span style={{fontSize: 12, textTransform: 'capitalize'}}>{key.replace('_',' ')}</span>
                  </button>
                )
              })}
            </div>

            <textarea
              placeholder="Add a note..."
              value={editNote.length ? editNote : (entries[selectedDay]?.note || '')}
              onChange={(e) => setEditNote(e.target.value)}
              style={styles.textarea}
            />

            <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
              <button style={styles.ghostBtn} onClick={() => { setEditMood(null); setEditNote(''); setSelectedDay(null); }}>Cancel</button>
              <button
                style={styles.saveBtn}
                onClick={async () => {
                  if (!user) return;
                  const chosenMood = editMood || entries[selectedDay]?.mood || null;
                  const chosenNote = editNote.length ? editNote : (entries[selectedDay]?.note || '');

                  try {
                    await setDoc(doc(db, 'users', user.uid, 'entries', selectedDay), {
                      mood: chosenMood,
                      note: chosenNote,
                      updatedAt: serverTimestamp()
                    });

                    setEntries(prev => ({
                      ...prev,
                      [selectedDay]: { mood: chosenMood, note: chosenNote }
                    }));

                    // reset editors
                    setEditMood(null);
                    setEditNote('');
                    setSelectedDay(null);
                  } catch (err) {
                    console.error('save failed', err);
                  }
                }}
              >
                Save
              </button>
            </div>
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
    gap: "18px",
    maxWidth: "920px",
    gridTemplateColumns: "repeat(7, 1fr)",
    margin: "0 auto",
    padding: "18px"
  },
  cell: {
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.15s, box-shadow 0.15s",
    // make cells square and responsive
    aspectRatio: '1 / 1',
    minHeight: 84,
    boxSizing: 'border-box',
    padding: 8
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

  closeX: {
    border: 'none',
    background: 'transparent',
    fontSize: 16,
    cursor: 'pointer'
  },

  textarea: {
    width: '100%',
    minHeight: 84,
    borderRadius: 12,
    padding: 10,
    border: '1px solid rgba(0,0,0,0.08)',
    marginTop: 8,
    resize: 'vertical',
    fontSize: 14,
    fontFamily: 'inherit'
  },

  ghostBtn: {
    border: '1px solid rgba(0,0,0,0.08)',
    background: '#FFF',
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer'
  },

  saveBtn: {
    border: 'none',
    background: '#111827',
    color: '#FFF',
    padding: '8px 14px',
    borderRadius: 10,
    cursor: 'pointer'
  }
};

export default Timeline;
