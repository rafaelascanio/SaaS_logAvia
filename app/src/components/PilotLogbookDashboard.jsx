import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapPin, Clock, Plane } from 'lucide-react';
import { loadLogbook } from '@/lib/loadExcel.js';

const STATIC_DATA = [
  { name: 'PIC', value: 120 },
  { name: 'SIC', value: 40 },
  { name: 'IFR', value: 60 },
  { name: 'VFR', value: 80 },
];

const COLORS = ['#2563eb', '#16a34a', '#facc15', '#ef4444'];

function Card({ children, className }) {
  return <div className={`rounded-2xl shadow p-4 bg-white ${className || ''}`}>{children}</div>;
}

function StatCard({ label, value }) {
  return (
    <div style={{ minWidth: 120, padding: 12, borderRadius: 12, background: '#fff', boxShadow: '0 8px 20px rgba(17,24,39,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function toMinutes(hhmm) {
  if (hhmm == null) return 0;
  const s = String(hhmm).trim();
  if (s === '') return 0;
  if (s.includes(':')) {
    const [h, m] = s.split(':');
    return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
  }
  const n = Number(s.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// Format date-like values to a simple local date (strip time and timezone like "20:00:00 GMT-0400 (Chile Standard Time)")
function formatDate(value) {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toLocaleDateString();
  const s = String(value).trim();
  // Try to parse with Date first
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
  // Fallback: remove time and timezone fragments like "20:00:00 GMT-0400 (...)" or "T20:00:00"
  const stripped = s.replace(/\s*\d{1,2}:\d{2}:\d{2}.*$/, '').replace(/T.*$/, '').trim();
  return stripped || s;
}

export default function PilotLogbookDashboard({ pilotInfo = null, summary = undefined, lastFlight = undefined }) {
  const [data, setData] = useState(STATIC_DATA);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await loadLogbook('/data/logbook.xlsx');
        if (!rows || rows.length === 0) return;

        const keys = Object.keys(rows[0] || {});
        const findKey = (substr) => keys.find(k => k && k.toUpperCase().includes(substr.toUpperCase()));

        const picKey = findKey('PIC');
        const sicKey = findKey('SIC');
        const ifrKey = findKey('IFR');
        // VFR might be stored as 'VFR' or as 'VFR Time' etc.
        const vfrKey = findKey('VFR') || findKey('VFR TIME') || findKey('VFR/OTHER');

        let totals = { PIC: 0, SIC: 0, IFR: 0, VFR: 0 };

        for (const r of rows) {
          if (picKey) totals.PIC += toMinutes(r[picKey]);
          if (sicKey) totals.SIC += toMinutes(r[sicKey]);
          if (ifrKey) totals.IFR += toMinutes(r[ifrKey]);
          if (vfrKey) totals.VFR += toMinutes(r[vfrKey]);
        }

        const totalSum = Object.values(totals).reduce((a, b) => a + b, 0);
        if (mounted && totalSum > 0) {
          setData([
            { name: 'PIC', value: totals.PIC },
            { name: 'SIC', value: totals.SIC },
            { name: 'IFR', value: totals.IFR },
            { name: 'VFR', value: totals.VFR },
          ]);
        }
      } catch {
        // keep static data on error
      }
    })();
    return () => { mounted = false; };
  }, []);

  console.log("Grid wrapper applied");
  console.log("lastFlight", lastFlight);
  console.log('PilotLogbookDashboard lastFlight prop:', lastFlight);
  // add this just above the return to verify render
  return (
    <div
      style={{
        display: "grid",
  gridTemplateColumns: "420px minmax(0, 1fr) 420px",
  columnGap: "80px",
  rowGap: "24px",
  padding: "32px",
  maxWidth: "1600px",
        margin: "0 auto",
        alignItems: "start",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Left column: Profile (top) and Certifications (below) */}
      <div style={{ flex: '1 1 220px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Card>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Pilot Profile</h2>
            <p><strong>Name:</strong> {pilotInfo?.name || '—'}</p>
            {pilotInfo?.licenseNumber && <p><strong>License Number:</strong> {pilotInfo.licenseNumber}</p>}
            {pilotInfo?.nationality && <p><strong>Nationality:</strong> {pilotInfo.nationality}</p>}
            {pilotInfo?.dateOfBirth && <p><strong>Date of Birth:</strong> {formatDate(pilotInfo.dateOfBirth)}</p>}
            {pilotInfo?.licenseType && <p><strong>License Type:</strong> {pilotInfo.licenseType}</p>}
            {pilotInfo?.licenseIssueDate && <p><strong>License Issue Date:</strong> {formatDate(pilotInfo.licenseIssueDate)}</p>}
            {pilotInfo?.licenseExpiryDate && <p><strong>License Expiry Date:</strong> {formatDate(pilotInfo.licenseExpiryDate)}</p>}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-blue-600" style={{ width: '65%' }} />
            </div>
            <p className="text-sm text-gray-500">65% towards ATPL requirements</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Certifications & Endorsements</h2>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 text-sm">
            <div className="p-3 bg-green-100 rounded-lg">✅ Solo Flight Endorsement</div>
            <div className="p-3 bg-yellow-100 rounded-lg">⏳ IFR Currency: 2 months left</div>
            <div className="p-3 bg-blue-100 rounded-lg">📄 Medical Certificate: Valid</div>
            <div className="p-3 bg-red-100 rounded-lg">⚠️ Flight Review Due Soon</div>
          </div>
        </Card>
      </div>

  {/* Center column: Pie chart and summary cards (wide column) */}
  <div style={{ flex: '3 1 520px', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Card className="w-full">
          <h2 className="text-xl font-bold mb-4 text-center">Flight Hours Breakdown</h2>
          {/* summary cards (if provided) */}
          {typeof summary !== 'undefined' && summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: 16, justifyItems: 'center', marginBottom: 16 }}>
              <StatCard label="Flights" value={summary.flights} />
              <StatCard label="Total" value={summary.total} />
              <StatCard label="PIC" value={summary.pic} />
              <StatCard label="SIC" value={summary.sic} />
              <StatCard label="IFR" value={summary.ifr} />
              <StatCard label="Day" value={summary.day} />
              <div style={{ gridColumn: '1 / -1', justifySelf: 'center' }}>
                <StatCard label="Night" value={summary.night} />
              </div>
            </div>
          )}
  <div style={{ width: '100%' }}>
    <ResponsiveContainer width="100%" height={420}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius="80%" fill="#8884d8" dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={entry.name || index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
        <Legend verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Right column: Last Flight (dynamic) */}
      <div style={{ flex: '1 1 220px', minWidth: 220 }}>
        <Card>
          <h2 className="text-xl font-bold mb-3">Last Flight {lastFlight?.["Flight Date"] ? `— ${formatDate(lastFlight["Flight Date"])}` : ""}</h2>

          {lastFlight ? (
            <>
              <div className="flex items-center space-x-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <p>
                  {lastFlight["Aircraft Make/Model"] || "—"} — {lastFlight["Aircraft Registration"] || "—"}
                </p>
              </div>

              <div className="flex items-center space-x-2 mt-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <p>
                  {lastFlight["Route From (ICAO)"] || "—"} → {lastFlight["Route To (ICAO)"] || "—"}
                </p>
              </div>

              <div className="flex items-center space-x-2 mt-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <p>
                  {lastFlight["Total Flight Time (HH:MM)"] || "00:00"}
                  {" | "}
                  {/* Type & role */}
                  { (toMinutes(lastFlight["IFR Time (HH:MM)"]) > 0) ? "IFR" : "VFR" }
                  { (toMinutes(lastFlight["Night Time (HH:MM)"]) > 0) ? " • Night" : " • Day" }
                  {" • "}
                  { (toMinutes(lastFlight["Solo Time (HH:MM)"]) > 0) ? "Solo (PIC)" :
                    (toMinutes(lastFlight["PIC Time (HH:MM)"]) >= toMinutes(lastFlight["SIC Time (HH:MM)"])) ? "PIC" : "SIC" }
                </p>
              </div>

              {/* Optional IFR approaches line */}
              {toMinutes(lastFlight["IFR Time (HH:MM)"]) > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  Approaches: {lastFlight["Approach Count"] || 0} {lastFlight["Approach Type"] ? `(${lastFlight["Approach Type"]})` : ""}
                </p>
              )}
            </>
          ) : (
            <p>No flights found for this pilot.</p>
          )}
        </Card>
      </div>
    </div>
  );
}