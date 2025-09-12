import React from 'react';

export default function StatCard({ label, value }) {
  return (
    <div style={{ minWidth: 120, padding: 12, borderRadius: 12, background: '#fff', boxShadow: '0 8px 20px rgba(17,24,39,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
