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
