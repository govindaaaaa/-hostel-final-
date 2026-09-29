import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", rollNumber: "", roomNumber: "", phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/student/register", form);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", "student");
      navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-card register-card">
        <div className="brand-mark">H</div>
        <p className="eyebrow">HOSTEL MANAGEMENT</p>
        <h1>Create student account</h1>
        <p className="muted">Register to generate your secure entry QR.</p>

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input name="name" value={form.name} onChange={update} required />

          <label>Email address</label>
          <input name="email" type="email" value={form.email} onChange={update} required />

          <label>Password</label>
          <input name="password" type="password" minLength="6"
            value={form.password} onChange={update} required />

          <label>Roll number</label>
          <input name="rollNumber" value={form.rollNumber} onChange={update} required />

          <label>Room number</label>
          <input name="roomNumber" value={form.roomNumber} onChange={update} required />

          <label>Phone number</label>
          <input name="phone" type="tel" value={form.phone} onChange={update} />

          {error && <div className="error-box">{error}</div>}
          <button className="primary-btn full-width" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">Already registered? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
