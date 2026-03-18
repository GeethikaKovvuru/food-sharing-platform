import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Package, Clock, MapPin, CheckCircle, Download, X, MessageSquare, Send, Calendar, Building2, Trash2, Heart } from 'lucide-react';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('donations'); // 'donations', 'ngo', 'recurring'
  const [donations, setDonations] = useState([]);
  const [ngoRequests, setNgoRequests] = useState([]);
  const [recurringPlans, setRecurringPlans] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    foodName: '', quantity: '', expiryDate: '', address: '', pickupTimeRange: '', image: null
  });
  const [recurringData, setRecurringData] = useState({
    foodName: '', quantity: '', frequency: 'Daily', address: '', pickupTimeRange: ''
  });

  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();

  const fetchDonations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/donations/my-donations', { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setDonations(res.data);
    } catch (err) {}
  };

  const fetchNgoRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ngo');
      setNgoRequests(res.data);
    } catch (err) {}
  };

  const fetchRecurringPlans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/recurring/my-recurring', { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setRecurringPlans(res.data);
    } catch (err) {}
  };

  useEffect(() => { 
    fetchDonations(); 
    fetchNgoRequests();
    fetchRecurringPlans();
    
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('joinRoom', payload.user.id);
      
      socketRef.current.on('receiveMessage', (data) => {
        if (activeChat === data.donationId) setChatMessages(prev => [...prev, data.message]);
      });

      socketRef.current.on('donationClaimed', (data) => {
        alert(`🔔 Notification: ${data.message}`);
        fetchDonations();
      });
    }
    return () => socketRef.current?.disconnect();
  }, [activeChat]);

  // CHAT logic
  const openChat = async (donationId) => {
    setActiveChat(donationId);
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${donationId}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setChatMessages(res.data.messages || []);
    } catch (err) {}
  };

  const sendMessage = async (e, donation) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/chat/${donation._id}`, {
        text: newMessage, receiverId: '000000000000000000000000'
      }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setChatMessages([...chatMessages, res.data]);
      setNewMessage('');
    } catch (err) {}
  };

  // ONE OFF DONATION
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      if (formData.image) {
        const uploadData = new FormData();
        uploadData.append('image', formData.image);
        const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadData, {
          headers: { 'x-auth-token': localStorage.getItem('token'), 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      await axios.post('http://localhost:5000/api/donations', {
        foodName: formData.foodName, quantity: formData.quantity, expiryDate: formData.expiryDate,
        address: formData.address, pickupTimeRange: formData.pickupTimeRange, imageUrl
      }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setIsModalOpen(false);
      fetchDonations();
    } catch (err) { alert(err.response?.data?.msg || 'Error adding donation'); }
  };

  // RECURRING DONATION
  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/recurring', recurringData, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setIsRecurringModalOpen(false);
      fetchRecurringPlans();
    } catch (err) { alert('Error scheduling recurring donation'); }
  };

  const deleteRecurring = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/recurring/${id}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchRecurringPlans();
    } catch (err) {}
  };

  // FULFILL NGO REQUEST
  const fulfillNgoRequest = async (id) => {
    if (!window.confirm("Are you sure you want to commit to fulfilling this bulk request?")) return;
    try {
      await axios.put(`http://localhost:5000/api/ngo/${id}/fulfill`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      fetchNgoRequests();
      alert("Successfully committed to fulfilling! The NGO has been notified.");
    } catch (err) {}
  };

  const downloadQR = (qrDataUrl, foodName) => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_${foodName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar role="Donor" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Donor Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage your shared surplus, recurring plans, and empower NGOs.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsRecurringModalOpen(true)} className="btn-secondary flex items-center gap-2 border border-slate-200 bg-white shadow-sm font-medium">
                <Calendar className="w-4 h-4" /> Schedule Recurring
              </button>
              <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" /> Share Food
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex gap-4 border-b border-slate-200 mb-6">
            <button onClick={() => setActiveTab('donations')} className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'donations' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>My Donations</button>
            <button onClick={() => setActiveTab('recurring')} className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'recurring' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Recurring Plans <span className="ml-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{recurringPlans.length}</span></button>
            <button onClick={() => setActiveTab('ngo')} className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'ngo' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>NGO Open Requests <span className="ml-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{ngoRequests.length}</span></button>
          </div>

          {/* Tab Content: Donations */}
          {activeTab === 'donations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                  <h3 className="font-bold text-primary-800 flex items-center gap-2 mb-2"><Package className="w-5 h-5"/> Total Shared</h3><p className="text-3xl font-black text-primary-900">{donations.length}</p>
                </div>
                <div className="card bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                  <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5"/> Delivered</h3><p className="text-3xl font-black text-green-900">{donations.filter(d => d.status === 'Delivered').length}</p>
                </div>
                <div className="card bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
                  <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2"><Clock className="w-5 h-5"/> Pending</h3><p className="text-3xl font-black text-amber-900">{donations.filter(d => d.status === 'Pending').length}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-md mb-8 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2"><Heart className="w-6 h-6"/> Your Global Impact Tracking</h3>
                  <p className="opacity-90 mt-1">Thank you for being a hero in the community.</p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-3xl font-black">{donations.filter(d => d.status === 'Delivered').length * 4}</div>
                    <div className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Meals Saved</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black">{donations.filter(d => d.status === 'Delivered').length * 2.5} <span className="text-sm font-medium">lbs</span></div>
                    <div className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Waste Reduced</div>
                  </div>
                </div>
              </div>

              {donations.map(donation => (
                <div key={donation._id} className="card p-0 flex flex-col md:flex-row overflow-hidden border-slate-200 hover:border-primary-300">
                  <div className="md:w-48 h-48 bg-slate-100 shrink-0">
                    {donation.imageUrl ? <img src={`http://localhost:5000${donation.imageUrl}`} alt="Food" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Package className="w-12 h-12" /></div>}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{donation.foodName}</h3>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p><Package className="inline w-4 h-4 mr-2 text-slate-400"/> {donation.quantity}</p>
                          <p><MapPin className="inline w-4 h-4 mr-2 text-slate-400"/> {donation.address}</p>
                          <p><Clock className="inline w-4 h-4 mr-2 text-slate-400"/> Pick up: {donation.pickupTimeRange || 'Anytime'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${donation.status === 'Pending' ? 'bg-amber-100 text-amber-700' : donation.status === 'Claimed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{donation.status}</span>
                        {donation.qrCode && <button onClick={() => downloadQR(donation.qrCode, donation.foodName)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-medium bg-primary-50 px-2 py-1 rounded"><Download className="w-3 h-3"/> Save QR</button>}
                      </div>
                    </div>
                    {donation.status !== 'Pending' && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                         <button onClick={() => openChat(donation._id)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors"><MessageSquare className="w-4 h-4" /> Open Chat</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {donations.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 mb-2">No donations yet</h3>
                  <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-4">Create First Donation</button>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Recurring Plans */}
          {activeTab === 'recurring' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recurringPlans.map(plan => (
                <div key={plan._id} className="card p-5 border-l-4 border-l-primary-500 shadow-sm relative group">
                  <button onClick={()=>deleteRecurring(plan._id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary-500"/> {plan.frequency} Drop</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><strong>Item:</strong> {plan.foodName} ({plan.quantity})</p>
                    <p><strong>Location:</strong> {plan.address}</p>
                    <p><strong>Next Automated Drop:</strong> {new Date(plan.nextDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {recurringPlans.length === 0 && <div className="col-span-full p-10 text-center text-slate-500"><Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3"/> You have no automated scheduled drops.</div>}
            </div>
          )}

          {/* Tab Content: NGO Requests */}
          {activeTab === 'ngo' && (
            <div className="grid grid-cols-1 gap-4">
              {ngoRequests.map(req => (
                <div key={req._id} className="card p-5 border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building2 className="text-blue-500 w-5 h-5"/> {req.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">Requested by: <strong>{req.ngoId?.name}</strong></p>
                    <div className="flex gap-4 mt-3 text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded-lg inline-flex">
                      <span className="flex items-center gap-1"><Package className="w-4 h-4"/> {req.quantity}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> By: {req.schedule}</span>
                    </div>
                  </div>
                  <button onClick={() => fulfillNgoRequest(req._id)} className="btn-primary bg-indigo-600 hover:bg-indigo-700 shadow-md transform hover:scale-105 transition-all">Fulfill Bulk Request</button>
                </div>
              ))}
              {ngoRequests.length === 0 && <div className="p-10 text-center text-slate-500">No NGOs have posted bulk requests right now.</div>}
            </div>
          )}

        </div>

        {/* Chat Slide-over Context */}
        {activeChat && (
          <div className="w-80 shrink-0 bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col h-[600px] sticky top-24 transform transition-all">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex justify-between items-center">
              <span>Delivery Chat</span>
              <button onClick={() => setActiveChat(null)} className="text-slate-400 hover:text-red-500">✕</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
              {chatMessages.length === 0 && <p className="text-sm text-slate-400 text-center mt-10">No messages yet.</p>}
              {chatMessages.map((msg, i) => {
                const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
                const isMe = msg.senderId === payload.user.id || msg.senderId?._id === payload.user.id;
                return (<div key={i} className={`max-w-[80%] p-2 rounded-lg text-sm ${isMe ? 'bg-primary-500 text-white self-end rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-none shadow-sm'}`}>{msg.text}</div>);
              })}
            </div>
            <form onSubmit={(e) => sendMessage(e, donations.find(d => d._id === activeChat))} className="p-3 border-t border-slate-200 flex gap-2">
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 input-field py-2 text-sm" placeholder="Type..." />
              <button type="submit" className="bg-primary-600 text-white p-2 rounded-lg"><Send className="w-4 h-4"/></button>
            </form>
          </div>
        )}
      </main>

      {/* Share Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Share Surplus Food</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="donationForm" onSubmit={handleSubmit} className="space-y-4">
                <input type="text" required className="input-field" placeholder="Food Name (e.g. 10 Loaves of Bread)" value={formData.foodName} onChange={e => setFormData({...formData, foodName: e.target.value})} />
                <input type="text" required className="input-field" placeholder="Quantity/Servings" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                <input type="datetime-local" required className="input-field" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                <input type="text" className="input-field" placeholder="Pickup Available (e.g. 10AM - 1PM)" value={formData.pickupTimeRange} onChange={e => setFormData({...formData, pickupTimeRange: e.target.value})} />
                <input type="text" required className="input-field" placeholder="Pickup Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                <input type="file" accept="image/*" className="input-field py-2" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" form="donationForm" className="btn-primary">Post Donation</button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Request Modal */}
      {isRecurringModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary-600"/> Automate Schedule</h2>
              <button onClick={() => setIsRecurringModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="recurringForm" onSubmit={handleRecurringSubmit} className="space-y-4">
                <select className="input-field" value={recurringData.frequency} onChange={e => setRecurringData({...recurringData, frequency: e.target.value})}>
                  <option value="Daily">Publish Daily</option>
                  <option value="Weekly">Publish Weekly</option>
                </select>
                <input type="text" required className="input-field" placeholder="Food Name (e.g. Case of Apples)" value={recurringData.foodName} onChange={e => setRecurringData({...recurringData, foodName: e.target.value})} />
                <input type="text" required className="input-field" placeholder="Quantity/Servings" value={recurringData.quantity} onChange={e => setRecurringData({...recurringData, quantity: e.target.value})} />
                <input type="text" className="input-field" placeholder="Pickup Time Range (e.g. 5PM - 6PM)" value={recurringData.pickupTimeRange} onChange={e => setRecurringData({...recurringData, pickupTimeRange: e.target.value})} />
                <input type="text" required className="input-field" placeholder="Pickup Address" value={recurringData.address} onChange={e => setRecurringData({...recurringData, address: e.target.value})} />
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsRecurringModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" form="recurringForm" className="btn-primary">Save Schedule</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DonorDashboard;
