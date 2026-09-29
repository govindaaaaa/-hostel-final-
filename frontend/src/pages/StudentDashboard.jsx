import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [qrImage, setQrImage] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [loadingQR, setLoadingQR] = useState(false);
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const loadDashboard = useCallback(async () => {
    try {
      const [profile, logs] = await Promise.all([
        api.get("/student/profile"),
        api.get("/student/history"),
      ]);
      setStudent(profile.data.student);
      setHistory(logs.data.history);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard.");
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const remaining = Math.max(
        0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setSeconds(remaining);

      if (remaining === 0) {
        setQrImage("");
        setExpiresAt(null);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const generateQR = async () => {
    setLoadingQR(true);
    setError("");

    try {
      const response = await api.post("/qr/generate");
      setQrImage(response.data.qrImage);
      setExpiresAt(response.data.expiresAt);
      setSeconds(60);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate QR.");
    } finally {
      setLoadingQR(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark small">H</div>
          <span>HostelPass</span>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </header>

      <main className="dashboard-content">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">STUDENT DASHBOARD</p>
            <h1>Hello, {student?.name?.split(" ")[0] || "Student"} 👋</h1>
            <p className="muted">Manage your hostel access and view your activity.</p>
          </div>
          <span className={`status-pill ${student?.currentStatus === "IN" ? "status-in" : "status-out"}`}>
            <span className="status-dot" />
            Currently {student?.currentStatus || "..."}
          </span>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="student-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR PROFILE</p>
                <h2>Student details</h2>
              </div>
              <div className="avatar">{student?.name?.charAt(0)?.toUpperCase() || "S"}</div>
            </div>

            <div className="profile-details">
              <div><span>Full name</span><strong>{student?.name || "—"}</strong></div>
              <div><span>Roll number</span><strong>{student?.rollNumber || "—"}</strong></div>
              <div><span>Room number</span><strong>{student?.roomNumber || "—"}</strong></div>
              <div><span>Email</span><strong>{student?.email || "—"}</strong></div>
            </div>
          </section>

          <section className="panel qr-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">HOSTEL ACCESS</p>
                <h2>Your entry QR</h2>
              </div>
              <span className="live-badge">● LIVE</span>
            </div>

            <p className="muted qr-description">
              Generate a temporary QR code and show it to the guard.
              Each code can be scanned only once.
            </p>

            {qrImage && seconds > 0 ? (
              <div className="qr-display">
                <img src={qrImage} alt="Temporary hostel QR code" />
                <div className="countdown">{seconds}s remaining</div>
                <p className="muted">Keep this screen open while the guard scans.</p>
              </div>
            ) : (
              <div className="qr-placeholder">
                <div className="qr-placeholder-icon">▦</div>
                <p>Your secure QR will appear here.</p>
              </div>
            )}

            <button className="primary-btn full-width" onClick={generateQR} disabled={loadingQR}>
              {loadingQR ? "Generating..." : "Generate secure QR"}
            </button>
            <p className="security-note">Expires in 60 seconds · Single use</p>
          </section>
        </div>

        <section className="panel history-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">RECENT ACTIVITY</p>
              <h2>Entry & exit history</h2>
            </div>
            <button className="text-btn" onClick={loadDashboard}>Refresh</button>
          </div>

          {history.length === 0 ? (
            <p className="empty-state">No entry or exit records yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Activity</th><th>Gate</th><th>Guard</th><th>Date & time</th></tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item._id}>
                      <td><span className={`table-status ${item.action === "ENTRY" ? "entry" : "exit"}`}>{item.action}</span></td>
                      <td>{item.gate || "—"}</td>
                      <td>{item.guard?.name || "—"}</td>
                      <td>{new Date(item.scannedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
