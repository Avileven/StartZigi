'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newInvestor, setNewInvestor] = useState({
    name: '', investor_type: 'Angel', focus_sectors: [],
    typical_check_min: '', typical_check_max: '',
    preferred_valuation_min: '', preferred_valuation_max: '',
    background: '', avatar_url: ''
  });

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin-stats').then(res => res.json()).then(d => { setReport(d); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvestor)
    });
    if (res.ok) { setShowAddForm(false); fetchData(); } 
    else { const err = await res.json(); alert(`Error: ${err.error}`); }
  };

  if (loading) return <div className="p-10 text-gray-400 font-mono">LOADING SYSTEM DATA...</div>;
  const { stats, data } = report;

  const Card = ({ title, count, type, color }) => (
    <button 
      onClick={() => setActiveTab(activeTab === type ? null : type)}
      className={`p-6 rounded-xl border-2 transition-all text-left shadow-sm ${activeTab === type ? 'border-blue-500 bg-blue-50' : 'bg-white border-transparent hover:border-gray-200'}`}
    >
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <p className={`text-2xl font-black mt-1 ${color || 'text-gray-900'}`}>{count}</p>
      <p className="text-[10px] text-blue-500 mt-2 font-bold uppercase">{activeTab === type ? 'Hide ▲' : 'Details ▼'}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900" dir="ltr">
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tight">STARTZIG ADMIN</h1>
        <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">Database Control Center</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        <Card title="Ventures" count={stats.venturesCount} type="ventures" />
        <Card title="Users" count={stats.usersCount} type="users" />
        <Card title="Investors" count={stats.investorsCount} type="investors" />
        <Card title="VC Firms" count={stats.vcCount} type="vc" />
        <Card title="Total Funded" count={`$${stats.totalInvestment.toLocaleString()}`} type="funding" color="text-green-600" />
      </div>

      <div className="space-y-6">
        {/* INVESTORS TAB */}
        {activeTab === 'investors' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Investor Database</h2>
              <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
                {showAddForm ? 'Cancel' : '+ Add Manual Entry'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Investor Name" className="p-3 border rounded-lg" onChange={e => setNewInvestor({...newInvestor, name: e.target.value})} />
                <select className="p-3 border rounded-lg" onChange={e => setNewInvestor({...newInvestor, investor_type: e.target.value})}>
                  <option>Angel</option><option>VC Partner</option><option>Family Office</option>
                </select>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min Check $" className="w-1/2 p-3 border rounded-lg" onChange={e => setNewInvestor({...newInvestor, typical_check_min: e.target.value})} />
                  <input type="number" placeholder="Max Check $" className="w-1/2 p-3 border rounded-lg" onChange={e => setNewInvestor({...newInvestor, typical_check_max: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min Val Pref" className="w-1/2 p-3 border rounded-lg" onChange={e => setNewInvestor({...newInvestor, preferred_valuation_min: e.target.value})} />
                  <input type="number" placeholder="Max Val Pref" className="w-1/2 p-3 border rounded-lg" onChange={e => setNewInvestor({...newInvestor, preferred_valuation_max: e.target.value})} />
                </div>
                <input placeholder="Avatar URL" className="md:col-span-2 p-3 border rounded-lg text-sm" onChange={e => setNewInvestor({...newInvestor, avatar_url: e.target.value})} />
                <textarea placeholder="Background / Bio Description" className="md:col-span-2 p-3 border rounded-lg h-24" onChange={e => setNewInvestor({...newInvestor, background: e.target.value})} />
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold">SAVE TO DATABASE</button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-gray-400 text-xs uppercase"><th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Checks</th><th className="p-4">Background</th></tr>
                </thead>
                <tbody className="divide-y">
                  {data.investors.map(i => (
                    <tr key={i.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold">{i.name}</td>
                      <td className="p-4 font-medium uppercase text-xs">{i.investor_type}</td>
                      <td className="p-4">${i.typical_check_min?.toLocaleString()} - ${i.typical_check_max?.toLocaleString()}</td>
                      <td className="p-4 text-gray-500 max-w-xs truncate">{i.background}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VENTURES TAB */}
        {activeTab === 'ventures' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-xs text-gray-400 uppercase">
                <tr><th className="p-4">Name</th><th className="p-4">Balance</th><th className="p-4">Phase</th><th className="p-4">Founder</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.ventures.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{v.name}</td>
                    <td className="p-4 font-mono text-blue-600 font-bold">${v.virtual_capital?.toLocaleString()}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{v.phase}</span></td>
                    <td className="p-4">{v.created_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-w-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-xs text-gray-400 uppercase">
                <tr><th className="p-4">Username</th><th className="p-4">Joined</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.users.map(u => (
                  <tr key={u.id}>
                    <td className="p-4 font-bold">{u.username}</td>
                    <td className="p-4 text-gray-500">{new Date(u.accepted_tos_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VC TAB */}
        {activeTab === 'vc' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-xs text-gray-400 uppercase">
                <tr><th className="p-4">Firm Name</th><th className="p-4">Founded</th><th className="p-4">Focus</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.vcFirms.map(vc => (
                  <tr key={vc.id}>
                    <td className="p-4 font-bold">{vc.name}</td>
                    <td className="p-4">{vc.founded}</td>
                    <td className="p-4">{vc.focus_areas?.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FUNDING TAB */}
        {activeTab === 'funding' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-xs text-gray-400 uppercase">
                <tr><th className="p-4">Venture</th><th className="p-4">Investor</th><th className="p-4">Amount</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.funding.map(f => (
                  <tr key={f.id}>
                    <td className="p-4 font-bold">{f.venture_name}</td>
                    <td className="p-4">{f.investor_name}</td>
                    <td className="p-4 text-green-600 font-bold">${f.amount?.toLocaleString()}</td>
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