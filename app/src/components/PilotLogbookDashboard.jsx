import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapPin, Clock, Plane } from 'lucide-react';
import { loadLogbook } from '@/lib/loadExcel.js';
import StatCard from './StatCard.jsx';
import Card from './Card.jsx';
import { toMinutes } from '@/utils/time.js';
import { debugLog } from '@/utils/debug.js';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Format date-like values to a simple local date (strip time and timezone like "20:00:00 GMT-0400 (Chile Standard Time)")
function formatDate(value) {
  if (value == null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toLocaleDateString();
  const s = String(value).trim();
  // Try to parse with Date first
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
  // Fallback: remove time and timezone fragments like "20:00:00 GMT-0400 (... )" or "T20:00:00"
  const stripped = s.replace(/\s*\d{1,2}:\d{2}:\d{2}.*$/, '').replace(/T.*$/, '').trim();
  return stripped || s;
}

export default function PilotLogbookDashboard({ pilotInfo = null, summary = undefined, lastFlight = undefined }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dataPath = pilotInfo?.id ? `/data/logbook_${pilotInfo.id}.xlsx` : '/data/logbook.xlsx';
        let rows = await loadLogbook(dataPath);
        if (!rows || rows.length === 0) {
          // Ensure chart can render with zeroed data
          if (mounted) {
            setData([
              { name: 'PIC', value: 0 },
              { name: 'SIC', value: 0 },
              { name: 'IFR', value: 0 },
              { name: 'VFR', value: 0 },
            ]);
          }
          return;
        }

        let keys = Object.keys(rows[0] || {});
        // Attempt to narrow down to active pilot when a per-pilot file isn't used
        const pilotHeader = keys.find(k => k && k.toUpperCase().includes('PILOT'));
        if (pilotHeader && pilotInfo?.name && !pilotInfo?.id) {
          const nameLower = String(pilotInfo.name).toLowerCase();
          rows = rows.filter(r => (String(r[pilotHeader] ?? '').toLowerCase().includes(nameLower)));
          // refresh keys after filtering
          keys = Object.keys(rows[0] || {});
          // If after filtering there is no data, render zeros
          if (!rows || rows.length === 0) {
            if (mounted) {
              setData([
                { name: 'PIC', value: 0 },
                { name: 'SIC', value: 0 },
                { name: 'IFR', value: 0 },
                { name: 'VFR', value: 0 },
              ]);
            }
            return;
          }
        }
        // Helper to map column headers to keys we look for
        const findKey = (substr) => keys.find(k => k && k.toUpperCase().includes(substr.toUpperCase()));

        const picKey = findKey('PIC');
        const sicKey = findKey('SIC');
        const IFRKey = findKey('IFR');
        const vfrKey = findKey('VFR') || findKey('VFR TIME') || findKey('VFR/OTHER');

        let totals = { PIC: 0, SIC: 0, IFR: 0, VFR: 0 };

        for (const r of rows) {
          if (picKey) totals.PIC += toMinutes(r[picKey]);
          if (sicKey) totals.SIC += toMinutes(r[sicKey]);
          if (IFRKey) totals.IFR += toMinutes(r[IFRKey]);
          if (vfrKey) totals.VFR += toMinutes(r[vfrKey]);
        }

        if (mounted) {
          setData([
            { name: 'PIC', value: totals.PIC },
            { name: 'SIC', value: totals.SIC },
            { name: 'IFR', value: totals.IFR },
            { name: 'VFR', value: totals.VFR },
          ]);
        }
      } catch {
        if (mounted) {
          setData([
            { name: 'PIC', value: 0 },
            { name: 'SIC', value: 0 },
            { name: 'IFR', value: 0 },
            { name: 'VFR', value: 0 },
          ]);
        }
      }
    })();
    return () => { mounted = false; };
  }, [pilotInfo]);

  // Optional debug output mirrors App: set VITE_LOGBOOK_DEBUG=true or toggle localStorage.
  debugLog('Grid wrapper applied');
  debugLog('lastFlight', lastFlight);
  debugLog('PilotLogbookDashboard lastFlight prop:', lastFlight);

  // Custom tooltip to show per-slice minutes instead of relying on default payload rendering
  function CustomTooltip({ active, payload }) {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload[0];
    const name = p?.payload?.name ?? '';
    const value = p?.payload?.value ?? 0;
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #ccc',
          padding: '6px 8px',
          borderRadius: 4,
        }}
      >
        <strong>{name}</strong>: {value} min
      </div>
    );
  }

  // UI layout with per-pilot data-driven pie
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '420px minmax(0, 1fr) 420px',
        columnGap: '80px',
        rowGap: '24px',
        padding: '32px',
        maxWidth: '1600px',
        margin: '0 auto',
        alignItems: 'start',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
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

      <div style={{ flex: '3 1 520px', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Card className="w-full">
          <h2 className="text-xl font-bold mb-4 text-center">Flight Hours Breakdown</h2>
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
              <PieChart key={JSON.stringify(data)}>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius="80%" fill="#8884d8" dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={entry.name || index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ flex: '1 1 220px', minWidth: 220 }}>
        <Card>
          <h2 className="text-xl font-bold mb-3">Last Flight {/* optional */}</h2>
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
                  {lastFlight["Total Flight Time (HH:MM)"] || '00:00'}
                  {' | '}
                  { (toMinutes(lastFlight["IFR Time (HH:MM)"]) > 0) ? 'IFR' : 'VFR' }
                  { (toMinutes(lastFlight["Night Time (HH:MM)"]) > 0) ? ' • Night' : ' • Day' }
                  {' • '}
                  { (toMinutes(lastFlight["Solo Time (HH:MM)"]) > 0) ? 'Solo (PIC)' : (toMinutes(lastFlight["PIC Time (HH:MM)"]) >= toMinutes(lastFlight["SIC Time (HH:MM)"])) ? 'PIC' : 'SIC' }
                </p>
              </div>
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
