import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, User, Moon, Sun, KeyRound, X, Bell } from 'lucide-react';

const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [isDark, setIsDark] = useState(false);
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Password Reset Modal states
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.user.name || 'User');
        // Fetch User profile to get points
        axios.get(`http://localhost:5000/api/admin/stats`, { headers: { 'x-auth-token': token } }) // Using admin stats for simplicity, wait no, let's just fetch notifications
        .catch(err => {});

        fetchNotifications(token);
      } catch (e) {}
    }

    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const fetchNotifications = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { 'x-auth-token': token }
      });
      setNotifications(res.data);
    } catch (err) {}
  };

  const markNotificationsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchNotifications(localStorage.getItem('token'));
    } catch (err) {}
  };

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/auth/change-password', 
        { currentPassword, newPassword },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      alert('Password successfully updated!');
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error changing password');
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-[50] shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-black bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                FoodShare
              </Link>
              {role && <span className="ml-3 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wide border border-slate-200">{role}</span>}
            </div>

            <div className="flex items-center gap-4">
              {role && (
                <Link to="/leaderboard" className="text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors">
                  Leaderboard
                </Link>
              )}

              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="relative">
                <button onClick={() => { setIsNotifOpen(!isNotifOpen); markNotificationsRead(); }} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.readStatus).length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900"></span>
                  )}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-slate-800">Alerts & Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className={`p-3 border-b border-slate-50 text-sm ${n.readStatus ? 'text-slate-500' : 'text-slate-800 font-medium bg-primary-50/30'}`}>
                            {n.message}
                            <div className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                <User className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-semibold text-slate-700 hidden sm:block">{userName}</span>
              </div>
              
              <button onClick={() => setPasswordModalOpen(true)} title="Change Password" className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-full transition-colors">
                <KeyRound className="w-5 h-5" />
              </button>

              <button onClick={handleLogout} title="Logout" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><KeyRound className="w-5 h-5" /> Change Password</h2>
              <button onClick={() => setPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input required type="password" placeholder="••••••••" className="input-field" 
                  value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input required type="password" placeholder="••••••••" className="input-field" 
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full mt-4">Update Password</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
