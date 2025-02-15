import React from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate import
import { useAuth } from '../AuthContext';

const Home = () => {
  const { client, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome, {client?.firstName}</h1>

      <h2 onClick={() => navigate('/book')}>Book an Appointment/View Existing Appointment</h2>
      <h2 onClick={() => navigate('/chat')}>Messages</h2>
      <h2 onClick={logout}>Log Out</h2>
    </div>
  );
};

export default Home;
