import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Components/Inside/Header/Header.js';
import Footer from './Components/Inside/Footer/Footer.js';

const InsideLayout = () => {
  return (
    <>
      <Header />
        <Outlet />
      <Footer />
    </>
  );
};

export default InsideLayout;