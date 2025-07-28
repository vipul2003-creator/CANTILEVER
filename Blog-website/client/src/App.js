import "./App.css";
import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import HomePage from "./pages/HomePage";
import { useState } from "react";
import LoggedInRoutes from "./routes/LoggedInRoutes";
import NotAllowedLoggedInRoutes from "./routes/NotAllowedLoggedInRoutes";
import { useSelector } from "react-redux";
import WritePost from "./pages/write/WritePost";
import Profile from "./pages/Profile";
import ArticlePage from "./pages/ArticlePage";
import ResetPassword from "./pages/ResetPassword";
import ProfileOfOtherUser from "./components/profileOftherUser/ProfileOfOtherUser";
import { inject } from '@vercel/analytics';
 
function App() {
  const { user } = useSelector((state) => ({ ...state }));

  inject();

  return (
    <div className="App">
      <Routes>
        <Route path="/" exact element={<HomePage user={user} />} />
        <Route path="/article" exact element={<ArticlePage />} />
        <Route path="/ProfileRedirect/:userID" element={<ProfileOfOtherUser />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route element={<LoggedInRoutes />}>
          <Route path="/write" element={<WritePost />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<NotAllowedLoggedInRoutes />}>
          <Route path="/auth" exact element={<Auth />} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;
