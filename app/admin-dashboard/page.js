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

  const sectorOptions = ['Fintech', 'SaaS', 'AI', 'Health', 'Cyber', 'Consumer'];

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

  if (loading) return <div className="p-10 font-mono text-gray-400">CONNECTING TO DATABASE...</div>;

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-slate-900" dir="ltr">
      <header className="mb-10 flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-black tracking-tighter">STARTZIG <span className="text-blue-600">OPS</span></h1>
            <p className="text-slate-400 font-medium">Control Tower</p>
        </div>
      </header>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {Object.entries(report.stats).map(([key, val]) => (
          <button key={key} onClick={() => setActiveTab(key.replace('Count','').toLowerCase())} className={`p-5 rounded-2xl border-2 text-left transition-all ${activeTab === key.replace('Count','').toLowerCase() ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key.replace('Count','')}</p>
            <p className="text-2xl font-black">{typeof val === 'number' && key === 'totalInvestment' ? `$${val.toLocaleString()}` : val}</p>
          </button>
        ))}
      </div>

      {activeTab === 'investors' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Investor Management</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm">
                {showAddForm ? 'Close Form' : '+ Add New Investor'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-3xl mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 border border-slate-200">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400">CORE IDENTITY</label>
                <input required placeholder="Investor Name" className="w-full p-3 rounded-xl border-0 shadow-sm" onChange={e => setNewInvestor({...newInvestor, name: e.target.value})} />
                <select className="w-full p-3 rounded-xl border-0 shadow-sm bg-white" onChange={e => setNewInvestor({...newInvestor, investor_type: e.target.value})}>
                  <option>Angel</option><option>VC</option><option>Family Office</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400">FINANCIALS (USD)</label>
                <div className="flex gap-2">
                    <input type="number" placeholder="Min Check" className="w-1/2 p-3 rounded-xl border-0 shadow-sm" onChange={e => setNewInvestor({...newInvestor, typical_check_min: e.target.value})} />
                    <input type="number" placeholder="Max Check" className="w-1/2 p-3 rounded-xl border-0 shadow-sm" onChange={e => setNewInvestor({...newInvestor, typical_check_max: e.target.value})} />
                </div>
                <div className="flex gap-2">
                    <input type="number" placeholder="Min Val Pref" className="w-1/2 p-3 rounded-xl border-0 shadow-sm" onChange={e => setNewInvestor({...newInvestor, preferred_valuation_min: e.target.value})} />
                    <input type="number" placeholder="Max Val Pref" className="w-1/2 p-3 rounded-xl border-0 shadow-sm" onChange={e => setNewInvestor({...newInvestor, preferred_valuation_max: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400">SECTOR FOCUS</label>
                <div className="flex flex-wrap gap-2">
                  {sectorOptions.map(s => (
                    <button key={s} type="button" onClick={() => setNewInvestor(prev => ({...prev, focus_sectors: prev.focus_sectors.includes(s) ? prev.focus_sectors.filter(x => x !== s) : [...prev.focus_sectors, s]}))} 
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition ${newInvestor.focus_sectors.includes(s) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-slate-400'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">SAVE TO CLOUD</button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-5">Name</th><th className="p-5">Type</th><th className="p-5">Focus</th><th className="p-5">Typical Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-600">
                {report.data.investors.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 text-slate-900 font-bold">{i.name}</td>
                    <td className="p-5 text-xs uppercase tracking-tighter">{i.investor_type}</td>
                    <td className="p-5">{i.focus_sectors?.join(', ')}</td>
                    <td className="p-5 font-mono text-blue-600">${i.typical_check_min?.toLocaleString()} - ${i.typical_check_max?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}