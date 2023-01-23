import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
