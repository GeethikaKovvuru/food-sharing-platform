import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Trophy, Medal, Star } from 'lucide-react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/leaderboard');
        setLeaders(res.data);
      } catch (err) {}
    };
    fetchLeaders();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold text-slate-900">Community Leaderboard</h1>
          <p className="text-slate-600 mt-2 text-lg">Recognizing our top contributors fighting food waste.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {leaders.map((user, index) => (
            <div key={user._id} className={`flex items-center p-6 border-b border-slate-100 last:border-0 ${index === 0 ? 'bg-yellow-50/30' : index === 1 ? 'bg-slate-50' : index === 2 ? 'bg-orange-50/30' : ''}`}>
              <div className="w-12 text-center font-bold text-slate-400 text-2xl">
                {index + 1}
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xl ml-4 mr-6 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {user.name}
                  {index === 0 && <Medal className="w-5 h-5 text-yellow-500" />}
                  {index === 1 && <Medal className="w-5 h-5 text-slate-400" />}
                  {index === 2 && <Medal className="w-5 h-5 text-orange-400" />}
                </h3>
                <span className="text-sm font-medium text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">{user.role}</span>
                <div className="flex gap-2 mt-2">
                  {user.badges?.map((badge, i) => (
                    <span key={i} className="text-xs font-semibold px-2 py-1 rounded bg-secondary-100 text-secondary-700 flex items-center gap-1">
                      <Star className="w-3 h-3" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-primary-600">{user.points}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Points</div>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="p-10 text-center text-slate-500">No leaders yet. Start donating or receiving to earn points!</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
