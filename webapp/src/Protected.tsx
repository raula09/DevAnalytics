import React from "react";
import { getToken } from "./auth";
import { Navigate } from "react-router-dom";
export default function Protected({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
