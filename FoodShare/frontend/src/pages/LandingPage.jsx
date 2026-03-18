import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Truck, ChevronRight, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-2xl tracking-tight">
            <Heart className="w-6 h-6 fill-primary-600 animate-pulse" />
            FoodShare
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium px-4 py-2 transition-colors">Log In</Link>
            <Link to="/signup" className="bg-primary-600 text-white hover:bg-primary-700 px-5 py-2 rounded-full font-medium transition-colors shadow-sm hover:shadow-md">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Share Surplus. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">Feed Someone in Need.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of businesses and individuals redirecting perfectly good food to those who need it most. Reduce waste, fight hunger.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link to="/signup?role=donor" className="btn-primary flex items-center justify-center gap-2 group text-lg">
              Sign Up as Donor
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/signup?role=receiver" className="btn-secondary text-lg">
              Sign Up as Receiver
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 text-lg">Three simple steps to make a difference in your community.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-primary-200 opacity-50 z-0"/>
            
            {[
              { title: "Donors submit surplus food", icon: <CheckCircle className="w-8 h-8 text-primary-500" />, desc: "Restaurants, grocery stores, and individuals list their excess food on our platform." },
              { title: "Receivers claim nearby food", icon: <MapPin className="w-8 h-8 text-secondary-500" />, desc: "Charities and individuals locate available food nearby and claim it instantly." },
              { title: "Food gets delivered", icon: <Truck className="w-8 h-8 text-primary-500" />, desc: "Direct handoffs ensure fresh food reaches people immediately with zero waste." }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col text-center items-center group">
                <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stats */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700">
            <div className="p-8">
              <div className="text-5xl font-extrabold text-primary-400 mb-2">12,400+</div>
              <div className="text-slate-300 font-medium">Total Donations</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-extrabold text-secondary-400 mb-2">8,200+</div>
              <div className="text-slate-300 font-medium">Receivers Helped</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-extrabold text-primary-400 mb-2">45,000+</div>
              <div className="text-slate-300 font-medium">Meals Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <Heart className="w-5 h-5 fill-primary-600" />
            FoodShare
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 FoodShare. All rights reserved. Let's make hunger history.
          </div>
          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-primary-600">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600">Terms of Service</a>
            <a href="#" className="hover:text-primary-600">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
