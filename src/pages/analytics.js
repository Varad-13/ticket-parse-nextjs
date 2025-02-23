import { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

function Dashboard() {
  const [data, setData] = useState({ tickets: [], challans: [] });

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Data:", data);
        setData(data);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // ✅ Utility function to aggregate any key
  const aggregateData = (data, key) => {
    if (!data || !Array.isArray(data)) return [];
    const counts = data.reduce((acc, item) => {
      const value = item[key] || "Unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // ✅ Fix Ticket Sales Over Time
  const ticketSalesData = useMemo(() => {
    if (!data.tickets) return [];

    const salesByDate = data.tickets.reduce((acc, ticket) => {
      const date = ticket.created_at ? new Date(ticket.created_at).toISOString().split('T')[0] : "Unknown";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(salesByDate).map(([date, sales]) => ({ date, sales }));
  }, [data.tickets]);

  // ✅ Fix Fine Issuance Over Time
  const fineIssuanceData = useMemo(() => {
    if (!data.challans) return [];

    const finesByDate = data.challans.reduce((acc, fine) => {
      const date = fine.created_at ? new Date(fine.created_at).toISOString().split('T')[0] : "Unknown";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(finesByDate).map(([date, fines]) => ({ date, fines }));
  }, [data.challans]);

  // ✅ Fix Most Common Stations
  const commonStationsData = useMemo(() => aggregateData(data.tickets, 'from_station'), [data.tickets]);

  // ✅ Fix Fine Revenue by Offense (Convert string to number)
  const fineRevenueByOffenseData = useMemo(() => {
    if (!data.challans) return [];

    const revenueByOffense = data.challans.reduce((acc, challan) => {
      const offense = challan.reason || "Unknown";
      const fineAmount = parseFloat(challan.fine_amount) || 0;
      acc[offense] = (acc[offense] || 0) + fineAmount;
      return acc;
    }, {});

    return Object.entries(revenueByOffense).map(([offense, revenue]) => ({ name: offense, value: revenue }));
  }, [data.challans]);

  // ✅ Chart Component (Handles All Charts)
  const ChartCard = ({ title, data, dataKey, chartType, colors }) => {
    console.log(`Rendering chart: ${title}`, data);

    return (
      <div key={`${title}-${dataKey}`} className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">{title}</h2>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            {chartType === "bar" && (
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={colors[0]}>
                  {data.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
            {chartType === "line" && (
              <LineChart data={data}>
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke={colors[0]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            )}
            {chartType === "pie" && (
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-300">No data available</p>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-100 dark:bg-gray-900">
      {[
        { title: 'Ticket Sales Over Time', data: ticketSalesData, dataKey: 'sales', chartType: 'line', colors: ['#8884d8'] },
        { title: 'Fine Issuance Over Time', data: fineIssuanceData, dataKey: 'fines', chartType: 'line', colors: ['#d62728'] },
        { title: 'Most Common Stations', data: commonStationsData, dataKey: 'value', chartType: 'bar', colors: ['#82ca9d'] },
        { title: 'Fine Revenue by Offense', data: fineRevenueByOffenseData, dataKey: 'value', chartType: 'bar', colors: ['#d62728'] },
        { title: 'Ticket Type Distribution', data: aggregateData(data.tickets, 'validity'), dataKey: 'value', chartType: 'pie', colors: ['#8884d8', '#ff7300', '#82ca9d'] },
        { title: 'Payment Status Overview', data: aggregateData(data.tickets, 'payment_status'), dataKey: 'value', chartType: 'pie', colors: ['#ffc658', '#8884d8', '#ff7300'] },
        { title: 'Common Offenses', data: aggregateData(data.challans, 'reason'), dataKey: 'value', chartType: 'bar', colors: ['#82ca9d'] },
        { title: 'Fine Collection Status', data: aggregateData(data.challans, 'payment_status'), dataKey: 'value', chartType: 'pie', colors: ['#ff7300', '#8884d8', '#ffc658'] },
      ].map((props, index) => (
        <ChartCard key={index} {...props} />
      ))}
    </div>
  );
}

export default Dashboard;
