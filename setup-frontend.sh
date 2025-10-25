#!/bin/bash
set -e

mkdir -p webapp/src/{pages,components}
echo "Creating React + Vite frontend files..."

# package.json (minimal starter)
cat > webapp/package.json <<'JSON'
{
  "name": "webapp",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.3.3",
    "vite": "^5.1.0"
  }
}
JSON

# vite.config.ts
cat > webapp/vite.config.ts <<'TS'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
TS

# tsconfig.json
cat > webapp/tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsx": "react-jsx",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
JSON

# index.html
cat > webapp/index.html <<'HTML'
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>DevAnalytics</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
HTML

# src/auth.ts
cat > webapp/src/auth.ts <<'TS'
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
export function getToken(): string | null { return localStorage.getItem("token"); }
export function setToken(t: string) { localStorage.setItem("token", t); }
export function clearToken() { localStorage.removeItem("token"); }
export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
TS

# src/Protected.tsx
cat > webapp/src/Protected.tsx <<'TSX'
import React from "react";
import { getToken } from "./auth";
import { Navigate } from "react-router-dom";
export default function Protected({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
TSX

# src/pages/Login.tsx
cat > webapp/src/pages/Login.tsx <<'TSX'
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
TSX

# src/pages/Register.tsx
cat > webapp/src/pages/Register.tsx <<'TSX'
import React,{useState} from "react";
import {api,setToken} from "../auth";
import {useNavigate,Link} from "react-router-dom";
export default function Register(){
  const nav=useNavigate();
  const [email,setEmail]=useState(""); const [pwd,setPwd]=useState("");
  const [err,setErr]=useState<string|null>(null);
  async function onSubmit(e:React.FormEvent){e.preventDefault();setErr(null);
    try{const r=await api<{token:string}>("/api/auth/register",{method:"POST",body:JSON.stringify({email,password:pwd})});
      setToken(r.token);nav("/");}catch(e:any){setErr(e.message||"Register failed");}}
  return(<div style={{maxWidth:400,margin:"50px auto"}}>
    <h2>Register</h2>
    <form onSubmit={onSubmit} style={{display:"grid",gap:8}}>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input placeholder="Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)}/>
      <button type="submit">Sign up</button>
    </form>
    {err&&<p style={{color:"red"}}>{err}</p>}
    <p>Already have account? <Link to="/login">Login</Link></p>
  </div>);
}
TSX

# src/pages/Dashboard.tsx
cat > webapp/src/pages/Dashboard.tsx <<'TSX'
import React,{useEffect,useState} from "react";
import {api,clearToken} from "../auth";
export default function Dashboard(){
  const [data,setData]=useState<any[]>([]);
  useEffect(()=>{api("/api/analytics/summary/me").then(setData).catch(console.error);},[]);
  return(<div style={{padding:20}}>
    <h2>DevAnalytics Dashboard</h2>
    <button onClick={()=>{clearToken();location.reload();}}>Logout</button>
    <pre>{JSON.stringify(data,null,2)}</pre>
  </div>);
}
TSX

# src/main.tsx
cat > webapp/src/main.tsx <<'TSX'
import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Protected from "./Protected";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
ReactDOM.createRoot(document.getElementById("root")!).render(
<React.StrictMode>
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/" element={<Protected><Dashboard/></Protected>}/>
    </Routes>
  </BrowserRouter>
</React.StrictMode>);
TSX

echo "✅ Frontend files created."
