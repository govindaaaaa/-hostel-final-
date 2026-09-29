import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../services/api";

export default function GuardDashboard() {
  const [scans, setScans] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const loadScans = useCallback(async () => {
    try {
      const response = await api.get("/guard/recent-scans");
      setScans(response.data.scans);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load scan records.");
    }
  }, []);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const handleDecodedQR = async (decodedText) => {
    if (processingRef.current) return;

    processingRef.current = true;
    setBusy(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/scan", { token: decodedText });
      const result = response.data;

      setMessage(
        `${result.student.name} successfully ${result.action === "ENTRY" ? "entered" : "exited"}.`
      );
      await loadScans();
    } catch (err) {
      setError(err.response?.data?.message || "QR scan failed or code has expired.");
    } finally {
      setBusy(false);
      setTimeout(() => {
        processingRef.current = false;
      }, 2500);
    }
  };

  const startScanner = async () => {
    setMessage("");
    setError("");

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      setScanning(true);

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleDecodedQR,
        () => {}
      );
    } catch (err) {
      setScanning(false);
      setError("Camera could not start. Allow camera permission and use localhost or HTTPS.");
      console.error(err);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (err) {
      console.error("Scanner stop error:", err);
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark small">H</div>
          <span>HostelPass <span className="guard-label">SECURITY</span></span>
        </div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </header>

      <main className="dashboard-content">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">SECURITY DASHBOARD</p>
            <h1>Guard control room</h1>
            <p className="muted">Scan student QR codes and monitor hostel movements.</p>
          </div>
          <span className="live-badge">● LIVE SYSTEM</span>
        </div>

        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        <div className="guard-grid">
          <section className="panel scanner-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">QR VERIFICATION</p>
                <h2>Scan student QR</h2>
              </div>
              <span className="live-badge">● SECURE</span>
            </div>

            <p className="muted qr-description">
              Scan the student's temporary QR. The system validates it,
              records the movement, and updates their status.
            </p>

            <div id="qr-reader" className="qr-reader" />

            {!scanning ? (
              <button className="primary-btn full-width" onClick={startScanner}>
                Start camera scanner
              </button>
            ) : (
              <button className="secondary-btn full-width" onClick={stopScanner}>
                Stop scanner
              </button>
            )}

            {busy && <p className="muted scan-wait">Verifying QR code...</p>}

            <div className="scanner-note">
              <span>✓</span> One-time QR validation
              <span>✓</span> Automatic IN/OUT update
            </div>
          </section>

          <section className="panel scan-summary">
            <p className="eyebrow">GATE ACTIVITY</p>
            <h2>Scan records</h2>
            <div className="stat-number">{scans.length}</div>
            <p className="muted">Recent records available</p>
            <button className="secondary-btn full-width" onClick={loadScans}>
              Refresh records
            </button>
          </section>
        </div>

        <section className="panel history-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">GATE MONITORING</p>
              <h2>Recent student movements</h2>
            </div>
            <button className="text-btn" onClick={loadScans}>Refresh</button>
          </div>

          {scans.length === 0 ? (
            <p className="empty-state">No scans have been recorded yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student</th><th>Roll number</th><th>Room</th>
                    <th>Movement</th><th>Gate</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan) => (
                    <tr key={scan._id}>
                      <td>{scan.student?.name || "Unknown"}</td>
                      <td>{scan.student?.rollNumber || "—"}</td>
                      <td>{scan.student?.roomNumber || "—"}</td>
                      <td><span className={`table-status ${scan.action === "ENTRY" ? "entry" : "exit"}`}>{scan.action}</span></td>
                      <td>{scan.gate || "—"}</td>
                      <td>{new Date(scan.scannedAt).toLocaleString()}</td>
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
