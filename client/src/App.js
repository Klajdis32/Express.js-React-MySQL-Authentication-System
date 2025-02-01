import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Outside/Home/Home.js'; 
import HomeIn from './Components/Inside/Home/Home.js';
import Login from './Components/Auth/Login/Login.js';
import Register from './Components/Auth/Register/Register.js';
import OutsideLayout from './OutsideLayout.js';
import InsideLayout from './InsideLayout.js';
import Verify from './Components/Auth/Verify/Verify.js';
import ResetPassword from './Components/Auth/ResetPassword/ResetPassword.js';

function App() {
  return (
      <Routes>
     
        <Route element={<OutsideLayout />}>
          <Route path="/" element={<HomeWithHeader />} />
        </Route>

        <Route path="/login" element={<LoginWithHeader />} />
        <Route path="/register" element={<RegisterWithHeader />} />
        <Route path="/verify" element={<VerifyWithHeader />} />
        <Route path="/resetPassword" element={<ResetPasswordWithHeader />} />

        <Route element={<InsideLayout />}>
          <Route path="/home" element={<HomeInWithHeader />} />
        </Route>

      </Routes>
  );
}

function HomeWithHeader() {
  useDocumentTitle("Home");
  useScrollToTop();
  return <Home />;
}

function ResetPasswordWithHeader() {
  useDocumentTitle("Reset Password");
  useScrollToTop();
  return <ResetPassword />;
}

function HomeInWithHeader() {
  useDocumentTitle("Home");
  useScrollToTop();
  return <HomeIn />;
}

function LoginWithHeader() {
  useDocumentTitle("Login");
  useScrollToTop();
  return <Login />;
}

function VerifyWithHeader() {
  useDocumentTitle("Verify");
  useScrollToTop();
  return <Verify />;
}

function RegisterWithHeader() {
  useDocumentTitle("Register");
  useScrollToTop();
  return <Register />;
}

function useDocumentTitle(title) {
  const location = useLocation();
  useEffect(() => {
    document.title = title;
  }, [location, title]);
}

function useScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

export default App;
