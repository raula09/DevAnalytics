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
