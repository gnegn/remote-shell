import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from './Nav.jsx';
import IndexPage from '../pages/IndexPage.jsx';
import BasePage from '../pages/BasePage.jsx';
import MonitoringPage from '../pages/MonitoringPage.jsx';


function App() {
  const currentUser = "Владислав";

  return (
    <>
      <Nav username={currentUser} />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/base" element={<BasePage />} />
        <Route path="/monitoring" element={<MonitoringPage />} />
      </Routes>
    </>
  );
}

export default App;