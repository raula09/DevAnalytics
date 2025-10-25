import React, { useState } from "react";
import { api, setToken } from "../auth";
import { useNavigate, Link } from "react-router-dom";
export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    try {
      const r = await api<{ token: string }>("/api/auth/login", { method:"POST", body: JSON.stringify({ email, password: pwd }) });
      setToken(r.token); nav("/");
    } catch(e:any){ setErr(e.message || "Login failed"); }
  }
  return (
    <div style={{maxWidth:400,margin:"50px auto"}}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{display:"grid",gap:8}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input placeholder="Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)}/>
        <button type="submit">Login</button>
      </form>
      {err && <p style={{color:"red"}}>{err}</p>}
      <p>New? <Link to="/register">Create account</Link></p>
    </div>);
}
