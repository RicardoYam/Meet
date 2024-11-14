import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Layout from "./components/Layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./components/Home";
import Profile from "./pages/ProfilePage";
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";
import Categories from "./components/Categories";
import Topics from "./components/Topics";
import Collection from "./pages/Collection";
import OauthSignup from "./pages/OauthSignup";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/posts/:postId" element={<PostPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/category/:title" element={<Collection />} />
          <Route path="/tag/:title" element={<Collection />} />
          <Route path="/oauth-signup" element={<OauthSignup />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>
);
