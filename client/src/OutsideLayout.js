import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Components/Outside/Header/Header.js';
import Footer from './Components/Outside/Footer/Footer.js';

const OutsideLayout = () => {
  return (
    <>
      <Header />
        <Outlet />
      <Footer />
    </>
  );
};

export default OutsideLayout;