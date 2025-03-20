import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Header from "@/components/header";
import HomePage from "@/pages/home";
import ExplorePage from "@/pages/explore";
import FriendsPage from "@/pages/friends";
import MessagesPage from "@/pages/messages";
import BookmarksPage from "@/pages/bookmarks";
import ProfilePage from "@/pages/profile";
import "@/index.css";
import { Toaster } from "@/components/ui/sonner";

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
      <main className="container mx-auto py-6 px-4 md:px-6">
        <Outlet />
      </main>
      <Toaster />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "explore",
        element: <ExplorePage />,
      },
      {
        path: "friends",
        element: <FriendsPage />,
      },
      {
        path: "messages",
        element: <MessagesPage />,
      },
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
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
