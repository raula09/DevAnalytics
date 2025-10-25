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
