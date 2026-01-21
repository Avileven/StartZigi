"use client";
import React from 'react';

export default function AdminDashboard() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      background: 'white',
      color: 'black',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem' }}>🚀 ADMIN TEST</h1>
      <p style={{ fontSize: '1.5rem' }}>If you see this, the file path is correct.</p>
      <p>Now we can start adding back the imports one by one.</p>
    </div>
  );
}