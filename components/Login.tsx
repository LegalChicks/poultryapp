import React, { useState, useEffect } from 'react';
import { Bird, Lock, User, Key, ArrowRight, ShieldCheck, AlertCircle, Laptop, Smartphone } from 'lucide-react';
import { LoginLog } from '../types';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [userAlias, setUserAlias] = useState('');
  const [deviceName, setDeviceName] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset Flow States
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initialize default password and load saved device settings
  useEffect(() => {
    if (!localStorage.getItem('poultry_admin_password')) {
      localStorage.setItem('poultry_admin_password', 'legalchicks');
    }
    
    // Auto-fill device settings if previously logged in
    const savedDevice = localStorage.getItem('poultry_device_name');
    const savedUser = localStorage.getItem('poultry_current_user');
    
    if (savedDevice) setDeviceName(savedDevice);
    if (savedUser) setUserAlias(savedUser);
    else setUserAlias('Admin'); // Default
    
    // If no device name, try to guess
    if (!savedDevice) {
       const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
       setDeviceName(isMobile ? 'My Phone' : 'My Computer');
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
        userAlias: userAlias,
        deviceName: deviceName,
        status: status
    };
    const existingLogs: LoginLog[] = JSON.parse(localStorage.getItem('poultry_login_logs') || '[]');
    const newLogs = [log, ...existingLogs].slice(0, 50);
    localStorage.setItem('poultry_login_logs', JSON.stringify(newLogs));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!userAlias.trim() || !deviceName.trim()) {
        setError("Please provide a Name and Device Name for the audit logs.");
        return;
    }

    setIsLoading(true);
    const storedPass = localStorage.getItem('poultry_admin_password');
    
    // Simulate network delay for "Syncing" feel
    await new Promise(r => setTimeout(r, 800));

    if (username.toLowerCase() === 'admin' && password === storedPass) {
      await logAttempt('Success');
      
      // Save Audit Info
      localStorage.setItem('poultry_current_user', userAlias);
      localStorage.setItem('poultry_device_name', deviceName);
      
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg">
            <Bird size={32} className="text-slate-900" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">PoultryPro</h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Multi-Device Manager</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Secure Access</h2>
                <p className="text-sm text-slate-500 font-medium">Identify yourself to sync records</p>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-rose-100 animate-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-100 animate-in slide-in-from-top-2">
                  <ShieldCheck size={16} />
                  {successMsg}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                            type="text" 
                            value={userAlias}
                            onChange={(e) => setUserAlias(e.target.value)}
                            className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm font-bold text-slate-900"
                            placeholder="John Doe"
                            />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Device Name</label>
                        <div className="relative">
                            <Laptop size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                            type="text" 
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm font-bold text-slate-900"
                            placeholder="Office PC"
                            />
                        </div>
                     </div>
                </div>

                <div className="relative pt-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-xs text-slate-400 uppercase font-bold">Credentials</span>
                    </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-900 font-bold bg-slate-50 focus:bg-white"
                    placeholder="admin"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-900 font-bold bg-slate-50 focus:bg-white"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? 'Syncing Profiles...' : (
                    <>Login & Sync <ArrowRight size={18} /></>
                )}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => { setMode('reset'); setError(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-wider transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
               <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
                <p className="text-sm text-slate-500 font-medium">Security Verification</p>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-rose-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-5">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Security Question</p>
                    <p className="text-slate-900 font-bold">What is the default administrator role?</p>
                 </div>

                 <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Answer</label>
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      value={secretAnswer}
                      onChange={(e) => setSecretAnswer(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-900 font-medium bg-white"
                      placeholder="Enter answer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-900 font-medium bg-white"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Reset Password
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-wider transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="fixed bottom-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center w-full">
        &copy; {new Date().getFullYear()} PoultryPro • Multi-Session Enabled
      </div>
    </div>
  );
};