import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import PasswordInput from "@/components/ui/password-input";
import StrongPasswordInput from "@/components/ui/strong-password-input";

const passwordRules = [
  { regex: /.{10,}/, message: "At least 10 characters" },
  { regex: /[0-9]/, message: "At least 1 number" },
  { regex: /[a-z]/, message: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, message: "At least 1 uppercase letter" },
];

const passwordSchema = z.string();

const passwordWithRules = passwordRules.reduce((schema, rule) => {
  if (rule.regex) {
    schema = schema.regex(rule.regex, rule.message);
  }
  return schema;
}, passwordSchema);

const signupSchema = z
  .object({
    username: z
      .string()
      .regex(
        /^[a-z]([a-z]|[0-9])*$/,
        "Username must start with a letter and be only lowercase characters or numbers"
      )
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 50 characters"),
    email: z.string().email("Invalid email address").max(50),
    password: passwordWithRules,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const signup = useMutation({
    mutationFn: async (credentials: z.infer<typeof signupSchema>) => {
      const { confirmPassword, ...signupData } = credentials;
      const { data } = await apiClient.post("/auth/register", signupData);
      return data;
    },
    onSuccess: ({ data }) => {
      toast.success(`Welcome ${data.username}`, {
        richColors: true,
        description: "Your account has been created successfully",
      });
      navigate("/login");
    },
    onError: (err) => {
      if (err.message === "Request failed with status code 409") {
        toast.error("Email or username already exists", {
          richColors: true,
        });
      } else if (err.message === "Request failed with status code 400") {
        toast.error("Invalid data, please check your inputs");
      } else {
        toast.error("Something went wrong, please try again later");
      }
    },
  });

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof signupSchema>) {
    signup.mutate(values);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create a new account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription></FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormDescription></FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <StrongPasswordInput
                            requirements={passwordRules}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription></FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <PasswordInput {...field} />
                        </FormControl>
                        <FormDescription></FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={signup.isPending}
                >
                  Create Account
                </Button>
                {/* TODO: implement OAuth */}
                {/* <Button variant="outline" className="w-full">
                  Sign up with Google
                </Button> */}
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
