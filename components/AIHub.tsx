import React, { useState, useEffect, useRef } from 'react';
import { FunctionDeclaration, GoogleGenAI, Type } from "@google/genai";
import { Send, Bot, Sparkles, Activity, TrendingUp, AlertCircle, Loader2, FileText, Lock, ExternalLink, Zap } from 'lucide-react';
import { Bird, EggLogEntry, Transaction, ManualTask } from '../types';
import { usePersistentState } from '../hooks/usePersistentState';

type Tab = 'chat' | 'health' | 'analysis';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const AIHub: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [tasks, setTasks] = usePersistentState<ManualTask[]>('poultry_tasks', []);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Greetings, Farmer. I am Gemini, your strategic poultry consultant. I have analyzed your flock metrics. How can I assist with your RIRs and Australorps today?' }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Health & Analysis States...
  const [symptoms, setSymptoms] = useState('');
  const [birdAge, setBirdAge] = useState('');
  const [healthAnalysis, setHealthAnalysis] = useState('');
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey()) setHasApiKey(true);
    };
    checkKey();
  }, []);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleConnect = async () => {
    if ((window as any).aistudio) {
        try {
            await (window as any).aistudio.openSelectKey();
            setHasApiKey(true);
        } catch (error) {}
    }
  };

  const createAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

  const handleAPIError = (error: any) => {
      console.error(error);
      if (error.toString().includes("Requested entity was not found")) {
          setHasApiKey(false);
          return "Session expired. Re-authenticate to continue.";
      }
      return "Gemini service temporarily unavailable.";
  };

  const createTaskTool: FunctionDeclaration = {
    name: 'createTask',
    description: 'Schedule a new manual operational task.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: 'Task description.' },
            dueDate: { type: Type.STRING, description: 'ISO Date YYYY-MM-DD.' }
        },
        required: ['description', 'dueDate']
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    try {
      const ai = createAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an elite poultry farm consultant. Today is ${new Date().toISOString().split('T')[0]}. Handle tasks with the createTask tool. User asks: ${input}`,
        config: { tools: [{ functionDeclarations: [createTaskTool] }] }
      });

      const functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall)?.map(p => p.functionCall);
      
      if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0]!;
          if (call.name === 'createTask') {
              const args = call.args as any;
              const newTask: ManualTask = {
                  id: `task-${Date.now()}`,
                  description: args.description,
                  dueDate: args.dueDate,
                  completed: false,
                  createdAt: new Date().toISOString()
              };
              const currentTasks = JSON.parse(localStorage.getItem('poultry_tasks') || '[]');
              const updatedTasks = [newTask, ...currentTasks];
              localStorage.setItem('poultry_tasks', JSON.stringify(updatedTasks));
              setTasks(updatedTasks);

              const toolResponse = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: [
                      { role: 'user', parts: [{ text: input }] },
                      { role: 'model', parts: [{ functionCall: call }] },
                      { role: 'user', parts: [{ functionResponse: { name: 'createTask', response: { result: 'Operation scheduled.' } } }] }
                  ]
              });
              setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: toolResponse.text || "Task scheduled." }]);
          }
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: response.text || "Understood." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: handleAPIError(error) }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Rest of handlers (Health, Analysis) remain functional but with UI updates...
  const handleHealthCheck = async () => {
    if (!symptoms.trim()) return;
    setIsHealthLoading(true);
    try {
      const ai = createAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Veterinary diagnosis for ${birdAge || 'poultry'}: ${symptoms}`,
      });
      setHealthAnalysis(response.text || "Analysis complete.");
    } catch (error) { setHealthAnalysis(handleAPIError(error)); } finally { setIsHealthLoading(false); }
  };

  const handleGenerateReport = async () => {
    setIsAnalysisLoading(true);
    try {
      const ai = createAIClient();
      const birds = JSON.parse(localStorage.getItem('poultry_birds') || '[]');
      const eggs = JSON.parse(localStorage.getItem('poultry_eggs') || '[]');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a production efficiency report. Current flock: ${birds.length}. Recent logs: ${JSON.stringify(eggs.slice(0, 10))}`,
      });
      setAnalysisReport(response.text || "Report generated.");
    } catch (error) { setAnalysisReport(handleAPIError(error)); } finally { setIsAnalysisLoading(false); }
  };

  if (!hasApiKey) {
      return (
          <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-8 space-y-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative">
                  <div className="absolute inset-0 blur-3xl ai-shimmer opacity-20 rounded-full scale-150"></div>
                  <div className="relative p-6 bg-slate-900 rounded-3xl text-indigo-400 shadow-2xl">
                      <Sparkles size={64} strokeWidth={1.5} />
                  </div>
              </div>
              <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Activate Intelligence</h1>
                  <p className="text-slate-500 max-w-lg mt-4 text-lg font-medium">
                      Unlock high-performance diagnostics and automated task scheduling powered by Google Gemini.
                  </p>
              </div>
              
              <div className="p-1.5 bg-slate-900/5 rounded-4xl w-full max-w-md">
                   <button 
                      onClick={handleConnect}
                      className="w-full py-4 px-8 bg-slate-900 text-white rounded-[2rem] font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20"
                   >
                       <Zap size={20} className="text-amber-400 fill-amber-400" />
                       Link Gemini API
                   </button>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} /> Securely Managed via AI Studio
              </p>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="p-3 ai-shimmer rounded-2xl text-white shadow-xl">
                <Sparkles size={28} />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gemini Advisor</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Neural Link Active</span>
                </div>
            </div>
        </div>
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
      </div>

      <div className="flex-1 bg-white rounded-4xl shadow-premium border border-slate-100 overflow-hidden relative flex flex-col">
        {activeTab === 'chat' && (
            <div className="flex flex-col h-full bg-slate-50/50">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[75%] rounded-3xl px-6 py-4 text-[15px] font-medium leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-slate-900 text-white rounded-br-none' 
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                }`}>
                                {msg.role === 'model' && <Bot size={18} className="inline-block mr-2 mb-1 text-indigo-500" />}
                                <span className="whitespace-pre-wrap">{msg.text}</span>
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                             <div className="bg-white px-6 py-4 rounded-3xl rounded-bl-none border border-slate-200 flex items-center gap-3">
                                <Loader2 size={18} className="animate-spin text-indigo-500" />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Synthesizing...</span>
                             </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-6 bg-white border-t border-slate-100">
                    <div className="flex gap-3 bg-slate-100 p-2 rounded-[2rem] border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a query or 'Schedule vaccination for Monday'..."
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

        {/* Other Tabs with similar redesign... */}
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
                            {isHealthLoading ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                            Run Diagnostics
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto bg-white">
                    {healthAnalysis ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-6">AI Assessment Report</h3>
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
                        <h3 className="text-2xl font-black text-slate-900">Advanced Analytics</h3>
                        <p className="text-slate-400 font-medium mt-1">Cross-referencing flock health, finance, and laying logs.</p>
                    </div>
                    <button onClick={handleGenerateReport} disabled={isAnalysisLoading} className="w-full lg:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/10 flex items-center justify-center gap-2">
                        {isAnalysisLoading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                        Synthesize Report
                    </button>
                </div>
                {analysisReport ? (
                     <div className="bg-indigo-950 text-indigo-100 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={120} /></div>
                         <div className="flex items-center gap-3 mb-6 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]">
                            <Sparkles size={16} /> Gemini Performance Audit
                         </div>
                         <div className="whitespace-pre-wrap text-lg leading-relaxed font-medium relative z-10">
                             {analysisReport}
                         </div>
                     </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[3rem] bg-slate-50/30">
                        <TrendingUp size={64} className="mb-6 opacity-10" />
                        <p className="font-bold uppercase tracking-widest text-xs">Awaiting data input for synthesis</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};