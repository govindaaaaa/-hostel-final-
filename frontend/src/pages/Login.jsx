import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoints = {
        student: "/auth/student/login",
        guard: "/auth/guard/login",
        admin: "/auth/admin/login",
      };

      const response = await api.post(endpoints[role], {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", role);

      if (response.data.admin) {
        localStorage.setItem("user", JSON.stringify(response.data.admin));
      } else if (response.data.student) {
        localStorage.setItem("user", JSON.stringify(response.data.student));
      } else if (response.data.guard) {
        localStorage.setItem("user", JSON.stringify(response.data.guard));
      }

      const destinations = {
        student: "/student",
        guard: "/guard",
        admin: "/admin",
      };

      navigate(destinations[role]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Check your credentials and backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <div className="brand-mark">H</div>

        <p className="eyebrow">HOSTEL MANAGEMENT</p>
        <h1>Welcome back</h1>
        <p className="muted">
          Sign in to manage hostel entry and exit.
        </p>

        <div className="role-switch">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => {
              setRole("student");
              setError("");
            }}
          >
            Student
          </button>

          <button
            type="button"
            className={role === "guard" ? "active" : ""}
            onClick={() => {
              setRole("guard");
              setError("");
            }}
          >
            Guard
          </button>

          <button
            type="button"
            className={role === "admin" ? "active" : ""}
            onClick={() => {
              setRole("admin");
              setError("");
            }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-box">{error}</div>}

          <button
            className="primary-btn full-width"
            disabled={loading}
          >
            {loading ? "Signing in..." : `Sign in as ${role}`}
          </button>
        </form>

        {role === "student" && (
          <p className="auth-footer">
            New student? <Link to="/register">Create an account</Link>
          </p>
        )}

        {role === "admin" && (
          <p className="auth-footer">
            Administrator access is restricted to authorized accounts.
          </p>
        )}

        <p className="security-note">
          Secure hostel access · One-time QR verification
        </p>
      </section>
    </main>
  );
}
