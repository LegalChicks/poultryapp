import React, { useState, useEffect } from 'react';
import { Bird, Lock, User, Key, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { LoginLog } from '../types';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset Flow States
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initialize default password
  useEffect(() => {
    if (!localStorage.getItem('poultry_admin_password')) {
      localStorage.setItem('poultry_admin_password', 'legalchicks');
    }
  }, []);

  const logAttempt = async (status: 'Success' | 'Failed') => {
    let ip = 'Unknown IP';
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
        const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
            const data = await response.json();
            ip = data.ip;
        }
    } catch (e) { /* ignore */ }

    const log: LoginLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ipAddress: ip,
        deviceInfo: navigator.userAgent,
        status: status
    };
    const existingLogs: LoginLog[] = JSON.parse(localStorage.getItem('poultry_login_logs') || '[]');
    const newLogs = [log, ...existingLogs].slice(0, 50);
    localStorage.setItem('poultry_login_logs', JSON.stringify(newLogs));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const storedPass = localStorage.getItem('poultry_admin_password');
    if (username.toLowerCase() === 'admin' && password === storedPass) {
      await logAttempt('Success');
      setIsLoading(false);
      onLogin();
    } else {
      await logAttempt('Failed');
      setIsLoading(false);
      setError('Invalid username or password.');
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (secretAnswer.toLowerCase() === 'admin') {
      if (newPassword.length < 4) {
        setError('New password must be at least 4 characters.');
        return;
      }
      localStorage.setItem('poultry_admin_password', newPassword);
      setSuccessMsg('Password reset successfully. Please login.');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('');
        setPassword('');
        setSecretAnswer('');
        setNewPassword('');
      }, 1500);
    } else {
      setError('Incorrect answer to the secret question.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-black p-8 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg">
            <Bird size={32} className="text-black" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">PoultryPro</h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">Farm Management</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-black">Sign In</h2>
                <p className="text-sm text-gray-500 font-medium">Access your farm dashboard</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-100">
                  <ShieldCheck size={16} />
                  {successMsg}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Username</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-black font-medium placeholder-gray-400 bg-gray-50 focus:bg-white"
                      placeholder="admin"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-black font-medium placeholder-gray-400 bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? 'Verifying...' : (
                    <>Sign In <ArrowRight size={18} /></>
                )}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => { setMode('reset'); setError(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
               <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-black">Reset Password</h2>
                <p className="text-sm text-gray-500 font-medium">Security Verification</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-5">
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Security Question</p>
                    <p className="text-black font-bold">What is the default administrator role?</p>
                 </div>

                 <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">Answer</label>
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      value={secretAnswer}
                      onChange={(e) => setSecretAnswer(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-black font-medium bg-white"
                      placeholder="Enter answer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-black font-medium bg-white"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Reset Password
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="fixed bottom-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center w-full">
        &copy; {new Date().getFullYear()} PoultryPro
      </div>
    </div>
  );
};