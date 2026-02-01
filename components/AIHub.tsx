import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, Activity, TrendingUp, Loader2, Lock, Key, Zap, CheckCircle, LogOut, MessageSquare } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';

type Tab = 'chat' | 'health' | 'analysis';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIHub: React.FC = () => {
  const [apiKey, setApiKey] = usePersistentState<string>('openai_api_key', '');
  const [inputKey, setInputKey] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your ChatGPT poultry assistant. I can help with flock management, health diagnostics, and market insights. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Health & Analysis States
  const [symptoms, setSymptoms] = useState('');
  const [birdAge, setBirdAge] = useState('');
  const [healthAnalysis, setHealthAnalysis] = useState('');
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleSaveKey = () => {
      if (inputKey.trim().startsWith('sk-')) {
          setApiKey(inputKey.trim());
      } else {
          alert("Please enter a valid OpenAI API Key starting with 'sk-'");
      }
  };

  const handleDisconnect = () => {
      setApiKey('');
      setInputKey('');
  };

  const callOpenAI = async (msgs: any[], systemPrompt?: string) => {
    try {
        const payloadMessages = systemPrompt 
            ? [{ role: "system", content: systemPrompt }, ...msgs] 
            : msgs;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: payloadMessages,
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || 'API Error');
        }

        return data.choices[0].message.content;
    } catch (error: any) {
        console.error("OpenAI API Error:", error);
        throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    try {
      // Prepare context from recent messages
      const apiMessages = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: 'user', content: input });

      const responseText = await callOpenAI(apiMessages, "You are an expert poultry farm consultant. Provide concise, practical advice for managing Rhode Island Reds and Black Australorps.");
      
      setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: responseText
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: `Error: ${error.message}. Please check your API key.` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    if (!symptoms.trim()) return;
    setIsHealthLoading(true);
    try {
      const prompt = `Veterinary diagnosis request.\nSubject Age: ${birdAge || 'Unknown'}.\nSymptoms: ${symptoms}.\n\nProvide a differential diagnosis, potential treatments, and recommended next steps. Note: Disclaimer that you are an AI, not a vet.`;
      const response = await callOpenAI([{ role: "user", content: prompt }], "You are an expert veterinary assistant specializing in poultry health.");
      setHealthAnalysis(response);
    } catch (error: any) { 
        setHealthAnalysis(`Analysis failed: ${error.message}`); 
    } finally { 
        setIsHealthLoading(false); 
    }
  };

  const handleGenerateReport = async () => {
    setIsAnalysisLoading(true);
    try {
      const birds = JSON.parse(localStorage.getItem('poultry_birds') || '[]');
      const eggs = JSON.parse(localStorage.getItem('poultry_eggs') || '[]');
      
      const prompt = `Generate a farm production analysis.\nContext: ${birds.length} birds in flock. Recent egg logs (last 5 days): ${JSON.stringify(eggs.slice(0, 5))}.\n\nAnalyze production efficiency, suggest improvements, and provide general market context for poultry farmers.`;
      
      const response = await callOpenAI([{ role: "user", content: prompt }], "You are an agricultural economist and poultry farm manager.");
      setAnalysisReport(response);
    } catch (error: any) { 
        setAnalysisReport(`Report generation failed: ${error.message}`); 
    } finally { 
        setIsAnalysisLoading(false); 
    }
  };

  if (!apiKey) {
      return (
          <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-8 space-y-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative">
                  <div className="absolute inset-0 blur-3xl bg-emerald-500/20 rounded-full scale-150"></div>
                  <div className="relative p-6 bg-slate-900 rounded-3xl text-emerald-400 shadow-2xl">
                      <Bot size={64} strokeWidth={1.5} />
                  </div>
              </div>
              <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Connect ChatGPT</h1>
                  <p className="text-slate-500 max-w-lg mt-4 text-lg font-medium">
                      Power your farm management with OpenAI's GPT-4o. Enter your API key to begin.
                  </p>
              </div>
              
              <div className="w-full max-w-md space-y-4">
                   <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="sk-..." 
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono text-sm"
                        />
                   </div>
                   <button 
                      onClick={handleSaveKey}
                      disabled={!inputKey}
                      className="w-full py-4 px-8 bg-slate-900 text-white rounded-[2rem] font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                   >
                       <Zap size={20} className="text-emerald-400 fill-emerald-400" />
                       Connect API
                   </button>
                   <p className="text-xs text-slate-400 font-medium">Your key is stored locally in your browser.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-emerald-400 shadow-xl">
                <Sparkles size={28} />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">ChatGPT Assistant</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">GPT-4o Connected</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden lg:flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {(['chat', 'health', 'analysis'] as Tab[]).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all
                        ${activeTab === tab ? 'bg-white text-slate-900 shadow-premium' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <button 
                onClick={handleDisconnect}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                title="Disconnect API Key"
            >
                <LogOut size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-4xl shadow-premium border border-slate-100 overflow-hidden relative flex flex-col">
        {activeTab === 'chat' && (
            <div className="flex flex-col h-full bg-slate-50/50">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[85%] rounded-3xl px-6 py-4 text-[15px] font-medium leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-slate-900 text-white rounded-br-none' 
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                }`}>
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                        <Bot size={14} className="text-emerald-600" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ChatGPT</span>
                                    </div>
                                )}
                                <span className="whitespace-pre-wrap markdown-body">{msg.content}</span>
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                             <div className="bg-white px-6 py-4 rounded-3xl rounded-bl-none border border-slate-200 flex items-center gap-3">
                                <Loader2 size={18} className="animate-spin text-emerald-600" />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ChatGPT is thinking...</span>
                             </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-6 bg-white border-t border-slate-100">
                    <div className="flex gap-3 bg-slate-100 p-2 rounded-[2rem] border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask about feed ratios, disease symptoms, or profit margins..."
                            className="flex-1 bg-transparent px-6 py-2 text-sm font-medium outline-none text-slate-900 placeholder-slate-400"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={isChatLoading || !input.trim()}
                            className="bg-slate-900 text-white p-3.5 rounded-full hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'health' && (
            <div className="h-full flex flex-col lg:flex-row">
                <div className="lg:w-80 p-8 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/30">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Activity size={14} className="text-rose-500" /> Parameters
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Subject Age</label>
                            <input type="text" value={birdAge} onChange={e => setBirdAge(e.target.value)} placeholder="e.g. 10w Pullet" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500/20 outline-none font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Clinical Signs</label>
                            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={5} placeholder="Describe observable symptoms..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500/20 outline-none font-medium resize-none" />
                        </div>
                        <button onClick={handleHealthCheck} disabled={isHealthLoading || !symptoms} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/10 flex items-center justify-center gap-2">
                            {isHealthLoading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                            Analyze with AI
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto bg-white">
                    {healthAnalysis ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                                <Sparkles size={24} className="text-emerald-500" />
                                AI Diagnosis
                            </h3>
                            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium bg-slate-50 border border-slate-100 rounded-3xl p-8 shadow-inner-soft">
                                {healthAnalysis}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Activity size={48} className="mb-4 opacity-10" />
                            <p className="font-bold text-sm tracking-wide">Ready for symptom analysis</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'analysis' && (
            <div className="h-full flex flex-col p-8 overflow-y-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">Market Intelligence</h3>
                        <p className="text-slate-400 font-medium mt-1">AI-driven analysis of your farm's production data.</p>
                    </div>
                    <button onClick={handleGenerateReport} disabled={isAnalysisLoading} className="w-full lg:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/10 flex items-center justify-center gap-2">
                        {isAnalysisLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        Generate Report
                    </button>
                </div>
                {analysisReport ? (
                     <div className="bg-indigo-950 text-indigo-100 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={120} /></div>
                         <div className="flex items-center gap-3 mb-6 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]">
                            <Bot size={16} /> Strategy Report
                         </div>
                         <div className="whitespace-pre-wrap text-lg leading-relaxed font-medium relative z-10">
                             {analysisReport}
                         </div>
                     </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[3rem] bg-slate-50/30">
                        <TrendingUp size={64} className="mb-6 opacity-10" />
                        <p className="font-bold uppercase tracking-widest text-xs">Awaiting data synthesis</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};