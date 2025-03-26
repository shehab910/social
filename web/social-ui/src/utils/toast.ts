import { redirect } from "react-router-dom";
import { toast } from "sonner";

export const authErrorToast = () =>
  toast.error("You must be logged in", {
    duration: 5000,
    action: {
      label: "Login",
      onClick: () => {
        redirect("/login");
      },
    },
    richColors: true,
  });
