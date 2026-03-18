import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, PackageCheck, AlertTriangle, TrendingUp, ShieldCheck, CheckSquare, XSquare } from 'lucide-react';
import Navbar from '../components/Navbar';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      const headers = { 'x-auth-token': localStorage.getItem('token') };
      const [resStats, resUsers, resDonations, resReports] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', { headers }),
        axios.get('http://localhost:5000/api/admin/users', { headers }),
        axios.get('http://localhost:5000/api/admin/donations', { headers }),
        axios.get('http://localhost:5000/api/reports', { headers })
      ]);
      setStats(resStats.data);
      setUsers(resUsers.data);
      setDonations(resDonations.data);
      setReports(resReports.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleVerifyUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/verify`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchData();
    } catch (err) { alert('Error verifying user'); }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await axios.put(`http://localhost:5000/api/reports/${reportId}/resolve`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchData();
    } catch (err) { alert('Error resolving report'); }
  };

  const pendingDonations = donations.filter(d => d.status === 'Pending').length;
  const deliveredDonations = donations.filter(d => d.status === 'Delivered').length;
  const mealsSaved = deliveredDonations * 4; // Mock calculation 4 meals per donation
  const wasteReduced = deliveredDonations * 2.5; // lbs
  const peopleHelped = deliveredDonations * 2;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar role="Admin" />
      <div className="flex max-w-7xl mx-auto mt-8 px-4 gap-8">
        
        {/* Sidebar */}
        <div className="w-64 shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm p-4 hidden md:block self-start">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Management</h2>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <TrendingUp className="w-5 h-5"/> Overview & Impact
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Users className="w-5 h-5"/> Users & Verifications
            </button>
            <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'reports' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <div className="flex gap-3"><AlertTriangle className="w-5 h-5"/> Disputes</div>
              {reports.filter(r => r.status === 'Open').length > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{reports.filter(r => r.status === 'Open').length}</span>}
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp/> System Impact Metrics</h1>
              
              {/* Cards row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="card bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                  <p className="text-green-800 font-medium text-sm">Meals Saved</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">{mealsSaved}</p>
                </div>
                <div className="card bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200">
                  <p className="text-blue-800 font-medium text-sm">Waste Reduced</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">{wasteReduced} <span className="text-sm">lbs</span></p>
                </div>
                <div className="card bg-gradient-to-br from-purple-50 to-fuchsia-100 border-purple-200">
                  <p className="text-purple-800 font-medium text-sm">People Helped</p>
                  <p className="text-3xl font-bold text-purple-700 mt-1">{peopleHelped}</p>
                </div>
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                  <p className="text-primary-800 font-medium text-sm">Total Hub Donations</p>
                  <p className="text-3xl font-bold text-primary-700 mt-1">{donations.length || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="card">
                  <p className="text-slate-500 font-medium text-sm">Delivered / Completed</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{deliveredDonations}</p>
                </div>
                <div className="card">
                  <p className="text-slate-500 font-medium text-sm">Pending Availability</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{pendingDonations}</p>
                </div>
              </div>

              {/* Fraud Detection Simple Warning Panel */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2"><ShieldCheck/> Security & Fraud Insights</h3>
                <p className="text-amber-700 text-sm">
                  {reports.length > 5 ? "High volume of reports detected. Review dispute center immediately." : "System health is stable. Proceed monitoring user activity."}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">User Management</h1>
              <div className="card p-0 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 uppercase">
                    <tr>
                      <th className="px-6 py-4 border-b border-slate-100">Name / Email</th>
                      <th className="px-6 py-4 border-b border-slate-100">Role</th>
                      <th className="px-6 py-4 border-b border-slate-100">Rating</th>
                      <th className="px-6 py-4 border-b border-slate-100">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 flex items-center gap-2">
                            {user.name} 
                            {user.verified && <ShieldCheck className="w-4 h-4 text-primary-500" title="Verified"/>}
                          </p>
                          <p className="text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">{user.role}</span></td>
                        <td className="px-6 py-4 text-amber-500 font-bold">★ {user.rating || 0}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button onClick={() => handleVerifyUser(user._id)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${user.verified ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}>
                            {user.verified ? 'Revoke Verification' : 'Verify User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Dispute Management System</h1>
              <div className="flex flex-col gap-4">
                {reports.length === 0 ? (
                  <div className="card py-12 text-center text-slate-500">No active reports.</div>
                ) : reports.map(report => (
                  <div key={report._id} className={`card border-l-4 ${report.status === 'Resolved' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          Reason: {report.reason}
                          <span className={`text-xs px-2 py-0.5 rounded ${report.status==='Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{report.status}</span>
                        </h4>
                        <p className="text-sm text-slate-600 mt-2">Reporter: {report.reporterId?.name}</p>
                        <p className="text-sm text-slate-600">Reported User: {report.reportedUserId?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-600 mt-2">Donation: {report.donationId?.foodName || 'Deleted/Unknown'}</p>
                      </div>
                      {report.status === 'Open' && (
                        <button onClick={() => handleResolveReport(report._id)} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
                          <CheckSquare className="w-4 h-4"/> Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
