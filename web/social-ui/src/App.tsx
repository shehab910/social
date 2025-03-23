import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Header from "@/components/header";
import HomePage from "@/pages/home";
import FriendsPage from "@/pages/friends";
import BookmarksPage from "@/pages/bookmarks";
import ProfilePage from "@/pages/profile";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import LoginPage from "@/pages/login";
import AuthLayout from "@/components/auth-layout";
import SignupPage from "@/pages/signup";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayout() {
  return (
    <>
      <Header />
      <main className="container max-w-5xl mx-auto py-6 px-4 md:px-10">
        <Outlet />
      </main>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: "/signup",
    element: (
      <AuthLayout>
        <SignupPage />
      </AuthLayout>
    ),
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // {
      //   path: "explore",
      //   element: <ExplorePage />,
      // },
      {
        path: "friends",
        element: <FriendsPage />,
      },
      // {
      //   path: "messages",
      //   element: <MessagesPage />,
      // },
      {
        path: "bookmarks",
        element: <BookmarksPage />,
      },
      {
        path: "profile/:username",
        element: <ProfilePage />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
