import { router } from "@/App";
import { toast } from "sonner";

export function logout() {
  localStorage.removeItem("token");
  router.navigate("/login");
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
    toast.error("You need to be logged in to view this page");
    // TODO: FIX Cyclic
    // router.navigate("/login");
  }
}
