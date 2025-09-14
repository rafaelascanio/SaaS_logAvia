import React, { useEffect, useState } from "react";
import PilotLogbookDashboard from "./components/PilotLogbookDashboard.jsx";
import { loadLogbook } from "@/lib/loadExcel.js";
import { toMinutes, toHHMM } from "@/utils/time.js";

// Read a cell value using a list of possible header variants.
function getCell(row, variants) {
  if (!row) return undefined;
  for (const v of variants) {
    if (v in row && row[v] != null && String(row[v]).trim() !== '') return row[v];
  }
  // try case-insensitive contains
  const keys = Object.keys(row || {});
  for (const v of variants) {
    const up = v.toUpperCase();
    const found = keys.find(k => k && k.toUpperCase().includes(up));
    if (found && row[found] != null && String(row[found]).trim() !== '') return row[found];
  }
  return undefined;
}

function computeSummary(rows) {
  let flights = 0, total = 0, pic = 0, sic = 0, ifr = 0, day = 0, night = 0;
  for (const r of rows) {
    flights++;
    total += toMinutes(getCell(r, ["Total Flight Time (HH:MM)", "Total Time (HH:MM)", "Total Flight Time", "Total"]));
    pic   += toMinutes(getCell(r, ["PIC Time (HH:MM)", "PIC Time", "PIC"]));
    sic   += toMinutes(getCell(r, ["SIC Time (HH:MM)", "SIC Time", "SIC"]));
    ifr   += toMinutes(getCell(r, ["IFR Time (HH:MM)", "IFR Time", "IFR"]));
    day   += toMinutes(getCell(r, ["Day Time (HH:MM)", "Day Time", "Day"]));
    night += toMinutes(getCell(r, ["Night Time (HH:MM)", "Night Time", "Night"]));
  }
  return { flights, total: toHHMM(total), pic: toHHMM(pic), sic: toHHMM(sic), ifr: toHHMM(ifr), day: toHHMM(day), night: toHHMM(night) };
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 12, color: "#555" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [rows, setRows] = useState([]);
  const [pilotNames, setPilotNames] = useState([]);
  const [selectedPilot, setSelectedPilot] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await loadLogbook("/data/logbook.xlsx"); // your Excel in public/data
        setRows(all);
  const names = [...new Set(all.map(r => getCell(r, ["Pilot Full Name", "Pilot Name", "Name", "Full Name"]) ).filter(Boolean))].sort();
        setPilotNames(names);
        // Default to your name if present, else first pilot
        const preferred = names.includes("Rafael Ascanio") ? "Rafael Ascanio" : (names[0] || "");
        setSelectedPilot(preferred);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 1) compute the filtered rows FIRST
  const filteredRows = React.useMemo(
    () => rows.filter(r => !selectedPilot || r["Pilot Full Name"] === selectedPilot),
    [rows, selectedPilot]
  );

  // 2) then the summary
  const summary = React.useMemo(() => computeSummary(filteredRows), [filteredRows]);

  // 3) then pilotInfo
  const pilotInfo = React.useMemo(() => {
    const r = filteredRows[0];
    if (!r) return null;
    return {
      name: r["Pilot Full Name"],
      licenseNumber: r["License Number"],
      nationality: r["Nationality"],
      dateOfBirth: r["Date of Birth"],
      licenseType: r["License Type"],
      licenseIssueDate: r["License Issue Date"],
      licenseExpiryDate: r["License Expiry Date"],
    };
  }, [filteredRows]);

  // 4) then lastFlight
  const lastFlight = React.useMemo(() => {
    const withDates = filteredRows.filter(r => r["Flight Date"]);
    if (!withDates.length) return null;
    return [...withDates].sort(
      (a, b) => new Date(b["Flight Date"]) - new Date(a["Flight Date"])
    )[0];
  }, [filteredRows]);

  // Debug: log rows, filteredRows, and lastFlight after all are computed
  console.log("rows", rows);
  console.log("filteredRows", filteredRows);
  console.log("lastFlight", lastFlight);

  // Debug: log filteredRows and lastFlight after initialization
  console.log("filteredRows", filteredRows);
  console.log("lastFlight (App)", lastFlight);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Pilot Logbook</h1>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="7" stroke="#3b82f6" strokeWidth="2" fill="none" strokeOpacity="0.2" />
            <path d="M16 9a7 7 0 0 1-7 7" stroke="#3b82f6" strokeWidth="2" fill="none">
              <animateTransform attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="1s" repeatCount="indefinite" />
            </path>
          </svg>
          <div>Loading Excel…</div>
        </div>
      )}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {/* Pilot selector */}
      {pilotNames.length > 0 && (
        <div style={{ margin: "12px 0" }}>
          <label style={{ fontSize: 14, marginRight: 8 }}>Pilot:</label>
          <select
            value={selectedPilot}
            onChange={(e) => setSelectedPilot(e.target.value)}
            style={{ padding: 6, borderRadius: 8 }}
          >
            {pilotNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )}

  {/* Your existing visual component receives summary, pilotInfo, and lastFlight */}
  <PilotLogbookDashboard pilotInfo={pilotInfo} summary={summary} lastFlight={lastFlight} />
    </div>
  );
}
