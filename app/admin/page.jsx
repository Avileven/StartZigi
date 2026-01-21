"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ייבוא מרוכז ומסודר - וודא שהנתיב ל-api/entities תקין!
import { User, Venture } from '@/api/entities';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAccess() {
      try {
        console.log("Checking admin access...");
        const me = await User.me();
        if (me && me.role === 'admin') {
          setIsAdmin(true);
        } else {
          console.log("Not an admin, redirecting");
          router.replace('/');
        }
      } catch (err) {
        console.error("Auth error:", err);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    }
    checkAccess();
  }, [router]);

  if (loading) return <div style={{padding: '20px'}}>Loading Auth...</div>;
  if (!isAdmin) return null;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Dashboard - Connection Test</h1>
      <p>If you see this, the routing is working.</p>
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <button onClick={() => window.location.reload()} style={{ padding: '10px', cursor: 'pointer' }}>
          Reload Page
        </button>
      </div>
    </div>
  );
}