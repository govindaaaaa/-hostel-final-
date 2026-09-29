import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [guards, setGuards] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, studentsRes, guardsRes, logsRes] =
        await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/students"),
          api.get("/admin/guards"),
          api.get("/admin/logs"),
        ]);

      setStats(statsRes.data.stats);
      setStudents(studentsRes.data.students || []);
      setGuards(guardsRes.data.guards || []);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load admin data. Please log in again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  const displayName =
    JSON.parse(localStorage.getItem("user") || "{}").name ||
    "Administrator";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "students", label: "Students" },
    { id: "guards", label: "Guards" },
    { id: "logs", label: "Entry / Exit Logs" },
  ];

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">HOSTEL MANAGEMENT SYSTEM</p>
          <h1>Admin Dashboard</h1>
          <p className="muted">
            Welcome back, {displayName}
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            className="secondary-btn"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "selected" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="error-box admin-error">
          {error}
          <button onClick={loadDashboard}>Try again</button>
        </div>
      )}

      {loading && !stats ? (
        <div className="admin-loading">Loading dashboard data...</div>
      ) : (
        <>
          {activeTab === "overview" && (
            <section className="admin-content">
              <div className="admin-section-heading">
                <div>
                  <h2>Hostel Overview</h2>
                  <p className="muted">
                    Current hostel occupancy and activity
                  </p>
                </div>
              </div>

              <div className="admin-stat-grid">
                <StatCard
                  title="Total Students"
                  value={stats?.totalStudents ?? 0}
                  icon="🎓"
                />
                <StatCard
                  title="Total Guards"
                  value={stats?.totalGuards ?? 0}
                  icon="🛡️"
                />
                <StatCard
                  title="Currently Inside"
                  value={stats?.studentsIn ?? 0}
                  icon="🏠"
                  tone="green"
                />
                <StatCard
                  title="Currently Outside"
                  value={stats?.studentsOut ?? 0}
                  icon="🚶"
                  tone="orange"
                />
                <StatCard
                  title="Scans Today"
                  value={stats?.scansToday ?? 0}
                  icon="📊"
                  tone="blue"
                />
              </div>

              <div className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Recent Entry / Exit Activity</h2>
                    <p className="muted">
                      Latest gate scans recorded by the system
                    </p>
                  </div>

                  <button
                    className="text-btn"
                    onClick={() => setActiveTab("logs")}
                  >
                    View all logs →
                  </button>
                </div>

                <LogsTable logs={logs.slice(0, 8)} formatDate={formatDate} />
              </div>
            </section>
          )}

          {activeTab === "students" && (
            <section className="admin-content">
              <div className="admin-section-heading">
                <div>
                  <h2>Students</h2>
                  <p className="muted">
                    {students.length} student records
                  </p>
                </div>
              </div>

              <div className="admin-panel">
                <StudentsTable students={students} />
              </div>
            </section>
          )}

          {activeTab === "guards" && (
            <section className="admin-content">
              <div className="admin-section-heading">
                <div>
                  <h2>Security Guards</h2>
                  <p className="muted">
                    {guards.length} guard records
                  </p>
                </div>
              </div>

              <div className="admin-panel">
                <GuardsTable guards={guards} />
              </div>
            </section>
          )}

          {activeTab === "logs" && (
            <section className="admin-content">
              <div className="admin-section-heading">
                <div>
                  <h2>Entry / Exit Logs</h2>
                  <p className="muted">
                    Showing the latest {logs.length} scan records
                  </p>
                </div>
              </div>

              <div className="admin-panel">
                <LogsTable logs={logs} formatDate={formatDate} />
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function StatCard({ title, value, icon, tone = "" }) {
  return (
    <article className={`admin-stat-card ${tone}`}>
      <div className="stat-card-top">
        <span>{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
    </article>
  );
}

function StudentsTable({ students }) {
  if (!students.length) {
    return <EmptyState message="No students registered yet." />;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Email</th>
            <th>Room</th>
            <th>Status</th>
            <th>Account</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.rollNumber}</td>
              <td>{student.email}</td>
              <td>{student.roomNumber}</td>
              <td>
                <StatusBadge status={student.currentStatus} />
              </td>
              <td>
                <StatusBadge
                  status={student.isActive ? "Active" : "Inactive"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GuardsTable({ guards }) {
  if (!guards.length) {
    return <EmptyState message="No guards registered yet." />;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Employee ID</th>
            <th>Email</th>
            <th>Assigned Gate</th>
            <th>Account</th>
          </tr>
        </thead>
        <tbody>
          {guards.map((guard) => (
            <tr key={guard._id}>
              <td>{guard.name}</td>
              <td>{guard.employeeId}</td>
              <td>{guard.email}</td>
              <td>{guard.assignedGate}</td>
              <td>
                <StatusBadge
                  status={guard.isActive ? "Active" : "Inactive"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogsTable({ logs, formatDate }) {
  if (!logs.length) {
    return <EmptyState message="No scan logs available." />;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Roll Number</th>
            <th>Action</th>
            <th>Gate</th>
            <th>Guard</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.student?.name || "Unknown"}</td>
              <td>{log.student?.rollNumber || "—"}</td>
              <td>
                <StatusBadge status={log.action} />
              </td>
              <td>{log.gate || "—"}</td>
              <td>{log.guard?.name || "Unknown"}</td>
              <td>{formatDate(log.scannedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let className = "status-badge";

  if (["in", "entry", "active"].includes(normalized)) {
    className += " status-green";
  } else if (["out", "exit"].includes(normalized)) {
    className += " status-orange";
  } else {
    className += " status-gray";
  }

  return <span className={className}>{status || "—"}</span>;
}

function EmptyState({ message }) {
  return <div className="admin-empty">{message}</div>;
}
