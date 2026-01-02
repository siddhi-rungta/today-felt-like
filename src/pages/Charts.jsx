import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const moodConfig = {
  sad: { label: "Sad", color: "#F4A261" },
  low: { label: "Low", color: "#E9C46A" },
  neutral: { label: "Neutral", color: "#D3D3D3" },
  good: { label: "Good", color: "#A8DADC" },
  happy: { label: "Happy", color: "#90DB8A" }
};

export default function Charts() {
  const [counts, setCounts] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const snap = await getDocs(
        collection(db, "users", user.uid, "entries")
      );

      const moodCounts = {
        sad: 0,
        low: 0,
        neutral: 0,
        good: 0,
        happy: 0
      };

      snap.forEach((doc) => {
        const mood = doc.data().mood;
        if (moodCounts[mood] !== undefined) {
          moodCounts[mood]++;
        }
      });

      setCounts(moodCounts);
    };

    load();
  }, [user]);

  if (!counts) return null;

  const data = {
    labels: Object.keys(moodConfig).map(
      (m) => moodConfig[m].label
    ),
    datasets: [
      {
        data: Object.keys(moodConfig).map((m) => counts[m]),
        backgroundColor: Object.keys(moodConfig).map(
          (m) => moodConfig[m].color
        ),
        borderWidth: 0
      }
    ]
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Your Mood Chart</h1>
      <p style={styles.subtitle}>Track your emotional journey</p>

      <div style={styles.card}>
        <Doughnut data={data} />
      </div>

      <div style={styles.legend}>
        {Object.keys(moodConfig).map((m) => (
          <div key={m} style={styles.legendRow}>
            <span
              style={{
                ...styles.dot,
                background: moodConfig[m].color
              }}
            />
            <span>{moodConfig[m].label}</span>
            <span style={styles.count}>{counts[m]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "24px",
    paddingBottom: "80px",
    background: "linear-gradient(180deg,#F7FBFF,#EAF2F8)",
    fontFamily: "Inter, system-ui",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  title: {
    fontSize: "30px",
    marginBottom: "6px"
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px"
  },
  card: {
    width: "260px",
    background: "#FFF",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,.08)"
  },
  legend: {
    marginTop: "20px",
    width: "260px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "14px"
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    marginRight: "8px"
  },
  count: {
    fontWeight: "600"
  }
};
