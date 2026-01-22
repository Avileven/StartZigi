'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch('/api/admin-stats')
      .then(res => res.json())
      .then(data => setReport(data));
  }, []);

  if (!report) return <div style={{padding: '30px'}}>טוען נתונים מהמערכת...</div>;

  return (
    <div style={{ padding: '30px', direction: 'rtl', fontFamily: 'system-ui' }}>
      <h1 style={{ borderBottom: '2px solid #000', paddingBottom: '10px' }}>דשבורד ניהול StartZig</h1>
      
      <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
        <div style={{ background: '#e0f7fa', padding: '20px', borderRadius: '10px', flex: 1 }}>
          <h2>{report.stats.venturesCount}</h2>
          <p>סה"כ מיזמים</p>
        </div>
        <div style={{ background: '#f1f8e9', padding: '20px', borderRadius: '10px', flex: 1 }}>
          <h2>{report.stats.usersCount}</h2>
          <p>משתמשים רשומים</p>
        </div>
      </div>

      <h3>רשימת המיזמים המלאה:</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
        <thead>
          <tr style={{ background: '#333', color: '#fff' }}>
            <th style={{ padding: '12px' }}>שם המיזם</th>
            <th style={{ padding: '12px' }}>מייסד (Email)</th>
            <th style={{ padding: '12px' }}>שלב (Phase)</th>
            <th style={{ padding: '12px' }}>ציון כולל</th>
          </tr>
        </thead>
        <tbody>
          {report.allVentures.map((v) => (
            <tr key={v.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}>{v.name}</td>
              <td style={{ padding: '12px' }}>{v.created_by}</td>
              <td style={{ padding: '12px' }}>{v.phase}</td>
              <td style={{ padding: '12px' }}>{v.total_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}