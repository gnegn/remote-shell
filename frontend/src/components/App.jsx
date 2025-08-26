import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';
import IndexPage from '../pages/IndexPage.jsx';
import BasePage from '../pages/BasePage.jsx';
import MonitoringPage from '../pages/MonitoringPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function App() {
  const token = localStorage.getItem("token");
  const currentUser = token ? "Владислав" : null;

  return (
    <>
      <Header />
      <Routes>
        {/* Публічна сторінка логіну */}
        <Route path="/login" element={<LoginPage />} />

        {/* Захищені сторінки */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <IndexPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/base"
          element={
            <ProtectedRoute>
              <BasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitoring"
          element={
            <ProtectedRoute>
              <MonitoringPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
