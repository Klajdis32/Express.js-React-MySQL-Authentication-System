import './App.css';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home.js'; 
import Login from './Components/Login/Login.js'; 
import InsideLayout from './InsideLayout.js';
import Clients from './Components/Clients/Clients.js';
import ResetPassword from './Components/ResetPassword/ResetPassword.js';
import { ClientsProvider } from "./Context/ClientsContext.js";

function App() {
  return (
    <ClientsProvider> {/* ✅ Μεταφέρουμε το ClientsProvider εδώ */}
      <Routes>
          
        <Route path="/" element={<LoginWithHeader />} /> 
        <Route path="/resetPassword" element={<ResetPasswordWithHeader />} /> 

        <Route element={<InsideLayout />}>
          <Route path="/home" element={<HomeWithHeader />} /> 
          <Route path="/clients" element={<ClientsWithHeader />} /> {/* ✅ Τώρα μπορεί να χρησιμοποιήσει το ClientsContext */}
        </Route>

      </Routes>
    </ClientsProvider>
  );
}

function ResetPasswordWithHeader() {
  useDocumentTitle("Password Reset");
  useScrollToTop();
  return <ResetPassword />;
}

function ClientsWithHeader() {
  useDocumentTitle("Clients");
  useScrollToTop();
  return <Clients />;
}

function LoginWithHeader() {
  useDocumentTitle("Login");
  useScrollToTop();
  return <Login />;
}

function HomeWithHeader() {
  useDocumentTitle("Home");
  useScrollToTop();
  return <Home />;
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