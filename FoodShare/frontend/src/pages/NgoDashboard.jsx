import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Building2, Plus, Calendar, Package } from 'lucide-react';

const NgoDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', quantity: '', schedule: '' });

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ngo');
      // Filter for this NGO's requests
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      setRequests(res.data.filter(r => r.ngoId._id === payload.user.id || r.ngoId === payload.user.id));
    } catch (err) {}
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/ngo', formData, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setIsModalOpen(false);
      setFormData({ title: '', quantity: '', schedule: '' });
      fetchRequests();
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar role="NGO" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3"><Building2 className="w-8 h-8 text-primary-600" /> NGO Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage bulk food requests and community distribution schedules.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5"/> Post Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(req => (
            <div key={req._id} className="card p-6 border-l-4" style={{borderLeftColor: req.status === 'Fulfilled' ? '#22c55e' : '#3b82f6'}}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-900">{req.title}</h3>
                <span className={`px-2 py-1 text-xs font-bold rounded-md ${req.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {req.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-600 mb-6">
                <p className="flex items-center gap-2"><Package className="w-4 h-4"/> Requires: {req.quantity}</p>
                <p className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Needs by: {req.schedule}</p>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-slate-200">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-800 mb-2">No active requests</h3>
              <p className="text-slate-500">Post a new request to alert donors about bulk needs.</p>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Post Bulk Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required className="input-field" placeholder="Request Title (e.g., Soup Kitchen Needs)" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} />
                <input required className="input-field" placeholder="Quantity (e.g., 50 Meals)" value={formData.quantity} onChange={e=>setFormData({...formData,quantity:e.target.value})} />
                <input required type="date" className="input-field" value={formData.schedule} onChange={e=>setFormData({...formData,schedule:e.target.value})} />
                <div className="flex gap-3 justify-end mt-6">
                  <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Post Request</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default NgoDashboard;
