'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin-stats')
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 font-sans text-gray-500">Loading System Data...</div>;
  if (!report?.success) return <div className="p-10 text-red-500 font-bold">Error loading dashboard. Check API.</div>;

  const { stats, data } = report;

  const Card = ({ title, count, type, color }) => (
    <button 
      onClick={() => setActiveTab(activeTab === type ? null : type)}
      className={`p-6 rounded-xl border-2 transition-all text-left shadow-sm hover:shadow-md ${activeTab === type ? 'border-blue-500 bg-blue-50' : 'bg-white border-transparent'}`}
    >
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      <p className={`text-3xl font-black mt-1 ${color || 'text-gray-900'}`}>
        {typeof count === 'number' ? count.toLocaleString() : count}
      </p>
      <p className="text-xs text-blue-500 mt-2 font-medium">{activeTab === type ? 'Click to hide ▲' : 'Click for details ▼'}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans" dir="ltr">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">STARTZIG ADMIN</h1>
        <p className="text-gray-500">System Overview & Database Management</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <Card title="Ventures" count={stats.venturesCount} type="ventures" />
        <Card title="Users" count={stats.usersCount} type="users" />
        <Card title="Investors" count={stats.investorsCount} type="investors" />
        <Card title="VC Firms" count={stats.vcCount} type="vc" />
        <Card title="Total Funded" count={`$${stats.totalInvestment}`} type="funding" color="text-green-600" />
      </div>

      {/* Conditional Tables */}
      <div className="space-y-6">
        {activeTab === 'ventures' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-900 text-white font-bold">Ventures List</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b uppercase text-xs text-gray-400">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Founder</th>
                    <th className="p-4">Phase</th>
                    <th className="p-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.ventures.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">{v.name}</td>
                      <td className="p-4">{v.created_by}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold uppercase">{v.phase}</span></td>
                      <td className="p-4 text-gray-500">{new Date(v.created_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-w-2xl">
            <div className="p-4 bg-gray-900 text-white font-bold">User Profiles</div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr><th className="p-4">Username</th><th className="p-4">Joined</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{u.username || 'N/A'}</td>
                    <td className="p-4 text-gray-500">{u.accepted_tos_date ? new Date(u.accepted_tos_date).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'investors' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-900 text-white font-bold">Individual Investors</div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr><th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Sector Focus</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.investors.map(i => (
                  <tr key={i.id}>
                    <td className="p-4 font-bold">{i.name}</td>
                    <td className="p-4 uppercase text-xs">{i.investor_type}</td>
                    <td className="p-4 text-gray-500">{i.focus_sectors?.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'vc' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-900 text-white font-bold">VC Firms</div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr><th className="p-4">Firm Name</th><th className="p-4">Founded</th><th className="p-4">Stages</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.vcFirms.map(vc => (
                  <tr key={vc.id}>
                    <td className="p-4 font-bold">{vc.name}</td>
                    <td className="p-4">{vc.founded}</td>
                    <td className="p-4">{vc.investment_stages?.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'funding' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-900 text-white font-bold">Funding Events (Transactions)</div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b font-bold">
                <tr><th className="p-4">Venture</th><th className="p-4">Investor</th><th className="p-4">Amount</th><th className="p-4">Date</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.funding.map(f => (
                  <tr key={f.id}>
                    <td className="p-4 font-bold">{f.venture_name}</td>
                    <td className="p-4">{f.investor_name}</td>
                    <td className="p-4 text-green-600 font-black">${f.amount?.toLocaleString()}</td>
                    <td className="p-4">{new Date(f.created_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}