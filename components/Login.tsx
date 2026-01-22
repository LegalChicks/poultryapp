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

  // Initialize default password if not exists
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
        
        const response = await fetch('https://api.ipify.org?format=json', { 
            signal: controller.signal 
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            ip = data.ip;
        }
    } catch (e) {
        // Fallback to unknown if offline or blocked or timed out
    }

    const log: LoginLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ipAddress: ip,
        deviceInfo: navigator.userAgent,
        status: status
    };

    const existingLogs: LoginLog[] = JSON.parse(localStorage.getItem('poultry_login_logs') || '[]');
    // Keep last 50 logs
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4 shadow-lg border-2 border-amber-500/50">
            <Bird size={32} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">PoultryPro Manager</h1>
          <p className="text-gray-400 text-sm">Farm Management System</p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-sm text-gray-500">Please enter your credentials to access the farm.</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-green-100">
                  <ShieldCheck size={16} />
                  {successMsg}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Username</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Enter username"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-amber-900/10 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Verifying...' : (
                    <>Sign In <ArrowRight size={18} /></>
                )}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => { setMode('reset'); setError(''); setSuccessMsg(''); }}
                  className="text-sm text-gray-500 hover:text-amber-600 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
               <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
                <p className="text-sm text-gray-500">Answer the security question to verify your identity.</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Security Question</p>
                    <p className="text-gray-800 font-medium">What is the default administrator role?</p>
                 </div>

                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Secret Answer</label>
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={secretAnswer}
                      onChange={(e) => setSecretAnswer(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Enter answer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">New Password</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Reset Password
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="fixed bottom-4 text-gray-400 text-xs text-center w-full">
        &copy; {new Date().getFullYear()} PoultryPro Manager. All rights reserved.
      </div>
    </div>
  );
};