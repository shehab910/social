import { redirect } from "react-router-dom";

export function logout() {
  localStorage.removeItem("token");
  return redirect("/login");
}

export function tokenLoader() {
  return localStorage.getItem("token") || null;
}

export function parseJWT(token: string): {
  email: string;
  username: string;
  userId: string;
  role: string;
  exp: number;
} {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export function checkAuthLoader() {
  if (!tokenLoader()) {
    return redirect("/login");
  }
}
