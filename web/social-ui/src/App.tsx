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
import { checkAuthLoader, tokenLoader } from "@/utils/auth";
import ExplorePage from "@/pages/explore";
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
        <div className="max-w-3xl mx-auto">
          <Outlet />
        </div>
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
    id: "root",
    path: "/",
    loader: tokenLoader,
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: checkAuthLoader,
      },
      {
        path: "explore",
        element: <ExplorePage />,
      },
      {
        path: "friends",
        element: <FriendsPage />,
        loader: checkAuthLoader,
      },
      // {
      //   path: "messages",
      //   element: <MessagesPage />,
      // loader: checkAuthLoader,
      // },
      {
        path: "bookmarks",
        element: <BookmarksPage />,
        loader: checkAuthLoader,
      },
      {
        path: "profile/:username",
        element: <ProfilePage />,
        loader: checkAuthLoader,
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
