import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Map, LayoutGrid, List, CheckCircle, Package, MapPin, Clock, Heart, AlertTriangle, MessageSquare, Star, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';

const ReceiverDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [claims, setClaims] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Chat
  const [claimingId, setClaimingId] = useState(null);
  const [pickupTime, setPickupTime] = useState('');
  
  const [activeChat, setActiveChat] = useState(null); // Donation ID context for chat
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();

  const [ratingModal, setRatingModal] = useState(null); // Claim ID context
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const [reportModal, setReportModal] = useState(null); // Donation ID context
  const [reportReason, setReportReason] = useState('');

  const fetchDocs = async () => {
    try {
      const headers = { 'x-auth-token': localStorage.getItem('token') };
      const [donationsRes, claimsRes, favsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/donations?foodName=${search}`, { headers }),
        axios.get('http://localhost:5000/api/claims/my-claims', { headers }),
        axios.get('http://localhost:5000/api/favorites', { headers })
      ]);
      setDonations(donationsRes.data);
      setClaims(claimsRes.data);
      setFavorites(favsRes.data.map(f => f.donationId?._id).filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('joinRoom', payload.user.id);
      socketRef.current.on('receiveMessage', (data) => {
        if (activeChat === data.donationId) {
          setChatMessages(prev => [...prev, data.message]);
        }
      });
    }
    return () => socketRef.current?.disconnect();
  }, [search, activeChat]);

  // CLAIMING
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/claims/${claimingId}`, { selectedPickupTime: pickupTime }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      alert('Food claimed successfully!');
      setClaimingId(null);
      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error claiming food');
    }
  };

  // FAVORITES
  const toggleFavorite = async (donId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/favorites/${donId}`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      if (res.data.isFavorite) setFavorites([...favorites, donId]);
      else setFavorites(favorites.filter(id => id !== donId));
    } catch (err) {}
  };

  // RATINGS
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/ratings', {
        donorId: ratingModal.donorId,
        claimId: ratingModal._id,
        score: ratingScore,
        comment: ratingComment
      }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      alert('Rating submitted successfully!');
      setRatingModal(null);
    } catch (e) {
      alert('Error submitting rating');
    }
  };

  // REPORTS
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/reports', {
        reportedUserId: reportModal.donorId,
        donationId: reportModal._id,
        reason: reportReason
      }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      alert('Report submitted. An admin will review it.');
      setReportModal(null);
    } catch (e) {
      alert('Error submitting report');
    }
  };

  // CHAT
  const openChat = async (donation) => {
    setActiveChat(donation._id);
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${donation._id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setChatMessages(res.data.messages || []);
    } catch (err) {}
  };

  const sendMessage = async (e, donation) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/chat/${donation._id}`, {
        text: newMessage,
        receiverId: donation.donorId._id || donation.donorId
      }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setChatMessages([...chatMessages, res.data]);
      setNewMessage('');
    } catch (err) {}
  };

  // HELPERS
  const getExpiryStatus = (date) => {
    const diffHours = (new Date(date) - new Date()) / (1000 * 60 * 60);
    if (diffHours < 24) return { color: 'text-red-600 bg-red-100 border-red-200', text: 'Expiring Soon' };
    if (diffHours < 72) return { color: 'text-yellow-600 bg-yellow-100 border-yellow-200', text: 'Moderate' };
    return { color: 'text-green-600 bg-green-100 border-green-200', text: 'Fresh' };
  };

  const recommendedDonations = donations.slice(0, 3); // Basic recommendation

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar role="Receiver" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        
        {/* Main Feed Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Food Discovery</h1>
              <p className="text-slate-600 mt-1">Find nearby surplus food, schedule pickups, and chat with donors.</p>
            </div>
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'browse' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Browse Food</button>
              <button onClick={() => setActiveTab('claims')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'claims' ? 'bg-white text-secondary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>My Claims</button>
            </div>
          </div>

          {activeTab === 'browse' && (
            <>
              {/* Recommendations Section */}
              {!search && donations.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Recommended For You
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendedDonations.map(don => {
                      const exp = getExpiryStatus(don.expiryDate);
                      return (
                        <div key={'rec_'+don._id} className="card p-4 hover:border-primary-300">
                          <h4 className="font-bold text-slate-900 truncate">{don.foodName}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-2 ${exp.color}`}>{exp.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View Toggle / Search */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Search by food name or location..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-end md:self-auto">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow text-primary-600' : 'text-slate-500'}`}><LayoutGrid className="w-5 h-5"/></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-slate-500'}`}><List className="w-5 h-5"/></button>
                  <button onClick={() => setViewMode('map')} className={`p-2 rounded ${viewMode === 'map' ? 'bg-white shadow text-primary-600' : 'text-slate-500'}`}><Map className="w-5 h-5"/></button>
                </div>
              </div>

              {/* Data Display */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>)}
                </div>
              ) : viewMode === 'map' ? (
                <div className="card h-[600px] p-0 overflow-hidden relative border-0 shadow-md">
                  <iframe width="100%" height="100%" frameBorder="0" style={{ border:0 }} src={`https://maps.google.com/maps?q=${encodeURIComponent(search || 'New York')}&t=&z=12&ie=UTF8&iwloc=&output=embed`} allowFullScreen></iframe>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 mb-2">No food found</h3>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-4"}>
                  {donations.map(don => {
                    const isFaved = favorites.includes(don._id);
                    const exp = getExpiryStatus(don.expiryDate);
                    return (
                    <div key={don._id} className={`card p-0 overflow-hidden group flex ${viewMode === 'list' ? 'flex-row h-48' : 'flex-col'}`}>
                      <div className={`${viewMode === 'list' ? 'w-48 border-r border-slate-100' : 'h-48'} bg-slate-200 relative shrink-0`}>
                        {don.imageUrl ? (
                          <img src={`http://localhost:5000${don.imageUrl}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                            <Package className="w-12 h-12" />
                          </div>
                        )}
                        <button onClick={() => toggleFavorite(don._id)} className="absolute top-3 left-3 p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm">
                          <Heart className={`w-5 h-5 ${isFaved ? 'fill-primary-500 text-primary-500' : 'text-slate-400'}`} />
                        </button>
                        <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded shadow-sm flex items-center gap-1 border ${exp.color}`}>
                          {exp.text}
                        </div>
                      </div>
                      
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{don.foodName}</h3>
                            <button onClick={() => setReportModal(don)} title="Report Issue" className="text-slate-400 hover:text-red-500">
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-sm text-slate-600 mb-3 line-clamp-2">
                            <Package className="w-4 h-4 inline mr-1 text-slate-400"/> {don.quantity}
                            <br/><MapPin className="w-4 h-4 inline mr-1 text-slate-400 mt-1"/> {don.address}
                            <br/><Clock className="w-4 h-4 inline mr-1 text-slate-400 mt-1"/> Available: {don.pickupTimeRange || 'Anytime'}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                          <div className="text-xs text-slate-500 font-medium">Donor: {don.donorId?.name || 'Anonymous'} <span className="ml-1 text-amber-500">★ {don.donorId?.rating || 0}</span></div>
                          <button onClick={() => setClaimingId(don._id)} className="btn-primary py-1.5 px-4 text-sm font-semibold rounded shrink-0">Claim Setup</button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </>
          )}

          {activeTab === 'claims' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><CheckCircle className="text-secondary-600" /> Your Claim History & Impact</h2>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm border border-green-200">
                  <Package className="w-4 h-4" /> You've reduced ~{claims.filter(c => c.status === 'Completed' || c.donationId?.status === 'Delivered').length * 2.5} lbs of food waste!
                </div>
              </div>
              
              <ul className="divide-y divide-slate-100">
                {claims.map((claim) => (
                  <li key={claim._id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-900">{claim.donationId?.foodName || 'Unknown Food'}</h4>
                      <p className="text-sm text-slate-600 flex gap-4 mt-1">
                        <span><MapPin className="inline w-3 h-3 mr-1"/>{claim.donationId?.address}</span>
                        <span><Clock className="inline w-3 h-3 mr-1"/>Pickup: {claim.selectedPickupTime || 'Unknown'}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <button onClick={() => openChat(claim.donationId)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg text-sm w-full sm:w-auto justify-center">
                        <MessageSquare className="w-4 h-4" /> Message Donor
                      </button>
                      
                      {claim.donationId?.status === 'Delivered' && claim.status !== 'Completed' ? (
                        <button onClick={() => setRatingModal({ ...claim, donorId: claim.donationId.donorId })} className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium py-2 px-4 rounded-lg text-sm w-full sm:w-auto justify-center">
                          <Star className="w-4 h-4" /> Rate Donor
                        </button>
                      ) : (
                        <span className={`px-4 py-2 rounded-lg text-sm font-semibold text-center w-full sm:w-auto ${claim.donationId?.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {claim.donationId?.status || claim.status}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Right Sidebar: Active Chat Slide-over Context (Only renders if chat is open) */}
        {activeChat && (
          <div className="w-80 shrink-0 bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col h-[600px] sticky top-24 transform transition-all">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex justify-between items-center">
              <span>Delivery Chat</span>
              <button onClick={() => setActiveChat(null)} className="text-slate-400 hover:text-red-500">✕</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
              {chatMessages.length === 0 && <p className="text-sm text-slate-400 text-center mt-10">No messages yet. Say hello!</p>}
              {chatMessages.map((msg, i) => {
                const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
                const isMe = msg.senderId === payload.user.id || msg.senderId?._id === payload.user.id;
                return (
                  <div key={i} className={`max-w-[80%] p-2 rounded-lg text-sm ${isMe ? 'bg-primary-500 text-white self-end rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                );
              })}
            </div>
            <form onSubmit={(e) => sendMessage(e, donations.find(d => d._id === activeChat) || claims.find(c => c.donationId._id === activeChat).donationId)} className="p-3 border-t border-slate-200 flex gap-2">
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 input-field py-2 text-sm" placeholder="Type..." />
              <button type="submit" className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700"><Send className="w-4 h-4"/></button>
            </form>
          </div>
        )}
      </main>

      {/* Claim Modal */}
      {claimingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Schedule Pickup</h2>
            </div>
            <form onSubmit={handleClaimSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">When can you pick this up?</label>
                <input required type="time" className="input-field" value={pickupTime} onChange={e => setPickupTime(e.target.value)} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setClaimingId(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Confirm Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Rate your experience</h2>
            </div>
            <form onSubmit={handleRatingSubmit} className="p-6 space-y-4">
              <div className="flex justify-center gap-2 mb-4">
                {[1,2,3,4,5].map(s => (
                  <button type="button" key={s} onClick={() => setRatingScore(s)} className={`p-2 rounded-full ${s <= ratingScore ? 'text-amber-500' : 'text-slate-200'}`}>
                    <Star className="w-10 h-10 fill-current" />
                  </button>
                ))}
              </div>
              <textarea placeholder="Leave a review for the donor..." className="input-field" rows="3" value={ratingComment} onChange={e => setRatingComment(e.target.value)}></textarea>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setRatingModal(null)} className="btn-secondary flex-1">Skip</button>
                <button type="submit" className="btn-primary flex-1">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-red-50 text-red-800">
              <h2 className="text-xl font-bold flex items-center gap-2"><AlertTriangle/> Report Issue</h2>
            </div>
            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What went wrong?</label>
                <select required className="input-field" value={reportReason} onChange={e => setReportReason(e.target.value)}>
                  <option value="">Select reason...</option>
                  <option value="Food not available">Food was not available</option>
                  <option value="Food spoiled">Food was spoiled/expired</option>
                  <option value="Inappropriate behavior">Inappropriate donor behavior</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setReportModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 flex-1">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceiverDashboard;
