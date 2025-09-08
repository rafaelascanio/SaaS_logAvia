import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { MapPin, Clock, Plane } from 'lucide-react';

const data = [
  { name: 'PIC', value: 120 },
  { name: 'SIC', value: 40 },
  { name: 'IFR', value: 60 },
  { name: 'VFR', value: 80 },
];

const COLORS = ['#2563eb', '#16a34a', '#facc15', '#ef4444'];

function Card({ children, className }) {
  return <div className={`rounded-2xl shadow p-4 bg-white ${className || ''}`}>{children}</div>;
}

export default function PilotLogbookDashboard() {
  return (
    <div className=\"p-6 grid grid-cols-1 lg:grid-cols-3 gap-6\">
      <Card className=\"col-span-1\">
        <div className=\"space-y-2\">
          <h2 className=\"text-xl font-bold\">Pilot Profile</h2>
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>License:</strong> PPL(A), Instrument Rated</p>
          <div className=\"w-full h-2 bg-gray-200 rounded-full overflow-hidden\">
            <div className=\"h-2 bg-blue-600\" style={{ width: '65%' }} />
          </div>
          <p className=\"text-sm text-gray-500\">65% towards ATPL requirements</p>
        </div>
      </Card>

      <Card className=\"col-span-1\">
        <h2 className=\"text-xl font-bold mb-4\">Flight Hours Breakdown</h2>
        <PieChart width={300} height={250}>
          <Pie data={data} cx=\"50%\" cy=\"50%\" labelLine={false} outerRadius={90} fill=\"#8884d8\" dataKey=\"value\">
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Card>

      <Card className=\"col-span-1\">
        <h2 className=\"text-xl font-bold mb-3\">Last Flight</h2>
        <div className=\"flex items-center space-x-2\">
          <Plane className=\"w-5 h-5 text-blue-600\" />
          <p>Cessna 172N - CC-ABC</p>
        </div>
        <div className=\"flex items-center space-x-2\">
          <MapPin className=\"w-5 h-5 text-green-600\" />
          <p>SCL → LSC</p>
        </div>
        <div className=\"flex items-center space-x-2\">
          <Clock className=\"w-5 h-5 text-gray-600\" />
          <p>02h 15m | Day VFR</p>
        </div>
      </Card>

      <Card className=\"col-span-3\">
        <h2 className=\"text-xl font-bold mb-4\">Certifications & Endorsements</h2>
        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-sm\">
          <div className=\"p-3 bg-green-100 rounded-lg text-center\">✅ Solo Flight Endorsement</div>
          <div className=\"p-3 bg-yellow-100 rounded-lg text-center\">⏳ IFR Currency: 2 months left</div>
          <div className=\"p-3 bg-blue-100 rounded-lg text-center\">📄 Medical Certificate: Valid</div>
          <div className=\"p-3 bg-red-100 rounded-lg text-center\">⚠️ Flight Review Due Soon</div>
        </div>
      </Card>
    </div>
  );
}
