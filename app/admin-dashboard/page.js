'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Manual Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInvestor, setNewInvestor] = useState({
    name: '', investor_type: 'Angel', focus_sectors: [],
    typical_check_min: 0, typical_check_max: 0, background: ''
  });

  const sectorOptions = ['Fintech', 'SaaS', 'AI', 'HealthTech', 'Cyber', 'Consumer', 'DeepTech', 'CleanTech'];
  const typeOptions = ['Angel', 'VC Partner', 'Family Office', 'Corporate', 'Hedge Fund'];

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin-stats')
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddInvestor = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvestor)
    });
    if (res.ok) {
      setShowAddForm(false);
      fetchData(); // Refresh list
    } else {
      alert('Error adding investor');
    }
  };

  const toggleSector = (sector) => {
    setNewInvestor(prev => ({
      ...prev,
      focus_sectors: prev.focus_sectors.includes(sector)
        ? prev.focus_sectors.filter(s => s !== sector)
        : [...prev.focus_sectors, sector]
    }));
  };

  if (loading) return <div className="p-10 font-sans text-gray-500">Loading System Data...</div>;
  if (!report?.success) return <div className="p-10 text-red-500 font-bold">Error loading dashboard.</div>;

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
      <p className="text-xs text-blue-500 mt-2 font-medium">{activeTab === type ? 'Hide ▲' : 'Details ▼'}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans" dir="ltr">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">STARTZIG ADMIN</h1>
        <p className="text-gray-500">System Overview & Manual Entry</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <Card title="Ventures" count={stats.venturesCount} type="ventures" />
        <Card title="Users" count={stats.usersCount} type="users" />
        <Card title="Investors" count={stats.investorsCount} type="investors" />
        <Card title="VC Firms" count={stats.vcCount} type="vc" />
        <Card title="Total Funded" count={`$${stats.totalInvestment}`} type="funding" color="text-green-600" />
      </div>

      <div className="space-y-6">
        {activeTab === 'investors' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              {!showAddForm ? (
                <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition">+ Add Manual Investor</button>
              ) : (
                <form onSubmit={handleAddInvestor} className="space-y-4 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-lg font-bold border-b pb-2">New Investor Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Name" className="p-2 border rounded" onChange={e => setNewInvestor({...newInvestor, name: e.target.value})} />
                    <select className="p-2 border rounded" onChange={e => setNewInvestor({...newInvestor, investor_type: e.target.value})}>
                      {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2">SECTOR FOCUS</p>
                    <div className="flex flex-wrap gap-2">
                      {sectorOptions.map(s => (
                        <button key={s} type="button" onClick={() => toggleSector(s)} className={`px-3 py-1 rounded-full text-xs font-bold border ${newInvestor.focus_sectors.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" placeholder="Min Check ($)" className="p-2 border rounded" onChange={e => setNewInvestor({...newInvestor, typical_check_min: e.target.value})} />
                    <input type="number" placeholder="Max Check ($)" className="p-2 border rounded" onChange={e => setNewInvestor({...newInvestor, typical_check_max: e.target.value})} />
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-400 font-bold">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold">Save Investor</button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b font-bold">
                  <tr><th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Sector Focus</th><th className="p-4">Typical Check</th></tr>
                </thead>
                <tbody className="divide-y">
                  {data.investors.map(i => (
                    <tr key={i.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold">{i.name}</td>
                      <td className="p-4 text-xs font-semibold uppercase">{i.investor_type}</td>
                      <td className="p-4 text-gray-500">{i.focus_sectors?.join(', ')}</td>
                      <td className="p-4 font-mono">${i.typical_check_min?.toLocaleString()} - ${i.typical_check_max?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ventures' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr><th className="p-4">Name</th><th className="p-4">Balance</th><th className="p-4">Founder</th><th className="p-4">Phase</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.ventures.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800">{v.name}</td>
                    <td className="p-4 font-mono text-blue-600 font-bold">${v.virtual_capital?.toLocaleString() || '0'}</td>
                    <td className="p-4">{v.created_by}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold uppercase">{v.phase}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users, VC, and Funding tables follow same pattern as previous version */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-w-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr><th className="p-4">Username</th><th className="p-4">Email</th><th className="p-4">Joined</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{u.username || 'N/A'}</td>
                    <td className="p-4 text-blue-500">{u.email || 'N/A'}</td>
                    <td className="p-4 text-gray-500">{new Date(u.accepted_tos_date).toLocaleDateString()}</td>
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