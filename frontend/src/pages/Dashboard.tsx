import React, { useContext } from 'react';
import { AuthContext } from '../contexts/auth/AuthContext';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div>
      This is the Dashboard <button onClick={logout}>logout</button>
    </div>
  );
};

export default Dashboard;
