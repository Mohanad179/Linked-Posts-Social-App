/* eslint-disable no-unused-vars */
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Signup from "./components/signup/Signup";
import Login from "./components/login/Login";
import Home from "./components/home/Home";
import Nav from "./components/navbar/Nav";
import Profile from "./components/profile/Profile";
import AuthProvider from "./components/authContext/AuthContext";
import ProtectedRoutes from "./components/protectedRoutes/ProtectedRoutes";
import ErrorPage from "./components/errorPage/ErrorPage";
import AuthRoute from "./components/authRoute/AuthRoute";
import { HeroUIProvider } from "@heroui/react";
import PostData from "./components/postData/PostData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoutes>
              {" "}
              <Home />{" "}
            </ProtectedRoutes>
          ),
        },
        {
          path: "signup",
          element: (
            <AuthRoute>
              {" "}
              <Signup />{" "}
            </AuthRoute>
          ),
        },
        {
          path: "login",
          element: (
            <AuthRoute>
              {" "}
              <Login />{" "}
            </AuthRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoutes>
              {" "}
              <Profile />{" "}
            </ProtectedRoutes>
          ),
        },
        {
          path: "postData/:postId",
          element: (
            <ProtectedRoutes>
              {" "}
              <PostData />{" "}
            </ProtectedRoutes>
          ),
        },
      ],
    },
  ]);

  return (
    <>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <HeroUIProvider>
            <AuthProvider>
              <RouterProvider router={router} />
              <Toaster />
            </AuthProvider>
          </HeroUIProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </>
  );
}
