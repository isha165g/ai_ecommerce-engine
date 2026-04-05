"use client";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

type User = { full_name: string; email: string; budget: number };
type Alert = { id: number; product_id: number; target_price: number; is_active: boolean };

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [budgetInput, setBudgetInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const uRes = await fetchWithAuth("/users/me");
        if(uRes.ok) {
           const uData = await uRes.json();
           setUser(uData);
           setBudgetInput(uData.budget.toString());
        }
        const aRes = await fetchWithAuth("/alerts");
        if(aRes.ok) setAlerts(await aRes.json());
      } catch (err) { }
      setLoading(false);
    }
    load();
  }, []);

  const handleUpdateBudget = async () => {
    try {
      await fetchWithAuth("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: parseFloat(budgetInput) })
      });
      setUser(prev => prev ? { ...prev, budget: parseFloat(budgetInput) } : null);
      alert("Budget updated to ₹" + budgetInput + " successfully!");
    } catch(e) {
      alert("Failed to update budget.");
    }
  };

  if(loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-900 text-white p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-indigo-900/40 rounded-full filter blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10 pt-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Your Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Profile & Budget Card */}
          <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl transition hover:border-indigo-500/30">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">👤</span> Profile & Budget
            </h2>
            <div className="space-y-4">
              <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-400">Email: </span><span className="font-medium text-right">{user?.email}</span></p>
              <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-400">Name: </span><span className="font-medium text-right">{user?.full_name || "N/A"}</span></p>
              
              <div className="pt-4 mt-6">
                <label className="block text-gray-400 mb-2 font-medium">Monthly Budget Max (₹)</label>
                <div className="flex gap-4">
                  <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xl transition-all" />
                  <button onClick={handleUpdateBudget} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]">Update</button>
                </div>
              </div>
            </div>
          </div>

          {/* Price Alerts Card */}
          <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl transition hover:border-indigo-500/30 flex flex-col">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">🔔</span> Price Alerts
            </h2>
            <div className="flex-grow">
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 pb-6">
                  <span className="text-4xl opacity-50">📉</span>
                  <p>No active price alerts.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {alerts.map(a => (
                    <li key={a.id} className="bg-black/30 p-4 rounded-xl border border-white/5 flex justify-between items-center hover:border-indigo-500/30 transition-colors">
                      <div>
                        <p className="text-sm text-gray-400">Product ID: {a.product_id}</p>
                        <p className="font-medium text-lg">Target: <span className="text-green-400 font-bold">₹{a.target_price}</span></p>
                      </div>
                      <div className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 uppercase tracking-wider">
                        {a.is_active ? "Active" : "Paused"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-white/10">Alerts will trigger AI-driven push notifications when prices drop below your defined thresholds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
