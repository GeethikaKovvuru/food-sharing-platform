import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, Heart, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'donor' ? 'Donor' : 
                      searchParams.get('role') === 'receiver' ? 'Receiver' : 'Donor';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
      
      // Auto-login after successful registration
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      
      if (res.data.role === 'Donor') navigate('/donor');
      else if (res.data.role === 'Receiver') navigate('/receiver');
      else if (res.data.role === 'Admin') navigate('/admin');
      else if (res.data.role === 'NGO') navigate('/ngo');
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50">
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-secondary-600 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113565214-802c67623912?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative h-full flex flex-col items-center justify-center text-center p-12 z-10">
          <h2 className="text-5xl font-extrabold mb-6">Make an Impact.</h2>
          <p className="text-xl max-w-lg opacity-90 leading-relaxed">Join thousands who are eliminating food waste while feeding those in need.</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-slide-up">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-3xl mb-8">
            <Heart className="w-8 h-8 fill-primary-600 animate-pulse" />
            FoodShare
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign In</Link>
          </p>

          <div className="mt-8">
            <form onSubmit={handleSignup} className="space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email address</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10" placeholder="••••••••" minLength={6} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Account Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <div 
                    onClick={() => setRole('Donor')}
                    className={`cursor-pointer border rounded-lg p-3 text-center transition-all text-sm ${role === 'Donor' ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    Donate Food
                  </div>
                  <div 
                    onClick={() => setRole('Receiver')}
                    className={`cursor-pointer border rounded-lg p-3 text-center transition-all text-sm ${role === 'Receiver' ? 'border-secondary-500 bg-secondary-50 text-secondary-700 font-semibold shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    Need Food
                  </div>
                  <div 
                    onClick={() => setRole('NGO')}
                    className={`cursor-pointer border rounded-lg p-3 text-center transition-all text-sm ${role === 'NGO' ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    NGO / Org
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full flex justify-center items-center gap-2">
                {isLoading ? 'Creating account...' : 'Sign Up'} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
