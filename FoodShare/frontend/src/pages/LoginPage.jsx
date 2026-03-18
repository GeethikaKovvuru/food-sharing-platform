import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Heart, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      
      if (res.data.role === 'Donor') navigate('/donor');
      else if (res.data.role === 'Receiver') navigate('/receiver');
      else if (res.data.role === 'Admin') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-slide-up">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-3xl mb-8">
            <Heart className="w-8 h-8 fill-primary-600 animate-pulse" />
            FoodShare
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">Sign Up</Link>
          </p>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">{error}</div>}
              
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
                    className="input-field pl-10" placeholder="••••••••" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full flex justify-center items-center gap-2">
                {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-primary-600 to-secondary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113565214-802c67623912?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative h-full flex flex-col items-center justify-center text-center p-12 z-10">
          <h2 className="text-5xl font-extrabold mb-6">Fighting Hunger, Together.</h2>
          <p className="text-xl max-w-lg opacity-90 leading-relaxed">Join the platform that bridges the gap between excess and scarcity.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
