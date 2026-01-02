import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from "chart.js";

import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

/* 🌸 YOUR EMOTIONS (with score for charts) */
const moodsMap = {
  sad: { emoji: "😿", label: "Sad", color: "#FADADD", score: 1 },
  low: { emoji: "😕", label: "Low", color: "#FBE7C6", score: 2 },
  okay: { emoji: "😐", label: "Okay", color: "#E5E7EB", score: 3 },
  good: { emoji: "🙂", label: "Good", color: "#D1FAE5", score: 4 },
  happy: { emoji: "😊", label: "Happy", color: "#BBF7D0", score: 5 },

  tired: { emoji: "😴", label: "Tired", color: "#E0E7FF", score: 2 },
  sick: { emoji: "🤒", label: "Sick", color: "#FEE2E2", score: 1 },

  anxious: { emoji: "😰", label: "Anxious", color: "#FFE4E6", score: 2 },
  calm: { emoji: "🌿", label: "Calm", color: "#ECFDF5", score: 4 },

  crampy: { emoji: "🌸", label: "Crampy", color: "#FCE7F3", score: 2 },
  low_energy: { emoji: "🌙", label: "Low energy", color: "#EDE9FE", score: 2 }
};

export default function Charts() {
  const [entries, setEntries] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const snap = await getDocs(
        collection(db, "users", user.uid, "entries")
      );

      const arr = [];
      snap.forEach((doc) => {
        arr.push({ date: doc.id, ...doc.data() });
      });

      setEntries(arr);
    };

    load();
  }, [user]);

  if (!entries.length) {
    return (
      <div style={styles.container}>
        <p>No data yet 🌱</p>
      </div>
    );
  }

  /* -----------------------------
     1️⃣ DOUGHNUT – OVERALL MOODS
  ----------------------------- */
  const moodCounts = {};
  Object.keys(moodsMap).forEach((m) => (moodCounts[m] = 0));

  entries.forEach((e) => {
    if (moodCounts[e.mood] !== undefined) {
      moodCounts[e.mood]++;
    }
  });

  const doughnutData = {
    labels: Object.keys(moodsMap).map((m) => moodsMap[m].label),
    datasets: [
      {
        data: Object.keys(moodsMap).map((m) => moodCounts[m]),
        backgroundColor: Object.keys(moodsMap).map(
          (m) => moodsMap[m].color
        ),
        borderWidth: 0
      }
    ]
  };

  /* -----------------------------
     2️⃣ LINE – MOOD OVER TIME
  ----------------------------- */
  const sorted = [...entries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const lineData = {
    labels: sorted.map((e) => e.date.slice(5)), // MM-DD
    datasets: [
      {
        label: "Mood trend",
        data: sorted.map(
          (e) => moodsMap[e.mood]?.score || 0
        ),
        borderColor: "#FF9F9F",
        backgroundColor: "rgba(255,159,159,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 4
      }
    ]
  };

  /* -----------------------------
     3️⃣ MONTHLY COMPARISON
  ----------------------------- */
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  )
    .toISOString()
    .slice(0, 7);

  const monthAverage = (month) => {
    const filtered = entries.filter((e) =>
      e.date.startsWith(month)
    );
    if (!filtered.length) return "—";

    const sum = filtered.reduce(
      (acc, e) => acc + (moodsMap[e.mood]?.score || 0),
      0
    );
    return (sum / filtered.length).toFixed(1);
  };

  /* -----------------------------
     4️⃣ YEARLY OVERVIEW
  ----------------------------- */
  const year = now.getFullYear();
  const yearlyCount = entries.filter((e) =>
    e.date.startsWith(year.toString())
  ).length;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Your Mood Insights</h1>
      <p style={styles.subtitle}>Patterns, not pressure</p>

      {/* Doughnut */}
      <div style={styles.card}>
        <Doughnut data={doughnutData} />
      </div>

      {/* Line */}
      <div style={styles.card}>
        <h3>Mood over time</h3>
        <p> 1 being worst, 5 being best</p>
        <Line data={lineData} />
      </div>

      {/* Monthly */}
      <div style={styles.card}>
        <h3>Monthly comparison</h3>
        <p>This month: <b>{monthAverage(thisMonth)}</b></p>
        <p>Last month: <b>{monthAverage(lastMonth)}</b></p>
      </div>

      {/* Yearly */}
      <div style={styles.card}>
        <h3>{year} overview</h3>
        <p>Total entries: <b>{yearlyCount}</b></p>
      </div>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  container: {
    minHeight: "100vh",
    padding: "24px",
    paddingBottom: "90px",
    background: "linear-gradient(180deg,#F7FBFF,#EAF2F8)",
    fontFamily: "Inter, system-ui",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "22px"
  },
  title: {
    fontSize: "30px",
    marginBottom: "4px"
  },
  subtitle: {
    fontSize: "14px",
    color: "#666"
  },
  card: {
    width: "320px",
    background: "#FFF",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
  }
};
