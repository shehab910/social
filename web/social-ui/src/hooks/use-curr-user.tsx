import { TokenData } from "@/types";
import { parseJWT } from "@/utils/auth";
import { useMemo } from "react";
import { useRouteLoaderData } from "react-router-dom";

export function useCurrUser(): TokenData | null {
  const token = useRouteLoaderData<string | null>("root");
  if (!token) {
    return null;
  }

  const user = useMemo(() => {
    try {
      return parseJWT(token);
    } catch (_) {
      return null;
    }
  }, [token]);
  return user;
}
