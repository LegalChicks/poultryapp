import React, { useState, useEffect, useRef } from 'react';
import { FunctionDeclaration, GoogleGenAI, Type } from "@google/genai";
import { Send, Bot, Sparkles, Activity, TrendingUp, AlertCircle, Loader2, FileText, Lock, ExternalLink } from 'lucide-react';
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
  
  // Shared State via hook for tasks
  const [tasks, setTasks] = usePersistentState<ManualTask[]>('poultry_tasks', []);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hello! I am your PoultryPro Farm Assistant. I can help answer questions or manage your task list. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Health State
  const [symptoms, setSymptoms] = useState('');
  const [birdAge, setBirdAge] = useState('');
  const [healthAnalysis, setHealthAnalysis] = useState('');
  const [isHealthLoading, setIsHealthLoading] = useState(false);

  // Analysis State
  const [analysisReport, setAnalysisReport] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  // Check for existing API key connection on mount
  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey()) {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConnect = async () => {
    if ((window as any).aistudio) {
        try {
            await (window as any).aistudio.openSelectKey();
            // Race condition mitigation: assume success immediately after dialog interactions
            setHasApiKey(true);
        } catch (error) {
            console.error("Connection cancelled", error);
        }
    }
  };

  const createAIClient = () => {
      // Always create a fresh instance to ensure the injected API key is picked up
      return new GoogleGenAI({ apiKey: process.env.API_KEY });
  };

  const handleAPIError = (error: any) => {
      console.error(error);
      const errorMsg = error.toString();
      if (errorMsg.includes("Requested entity was not found")) {
          setHasApiKey(false); // Reset state to force reconnection
          return "Session expired. Please reconnect your Google Account.";
      }
      return "Unable to connect to AI service. Please try again later.";
  };

  // Define Tools
  const createTaskTool: FunctionDeclaration = {
    name: 'createTask',
    description: 'Create a new manual task or to-do item for the farm manager.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            description: {
                type: Type.STRING,
                description: 'The content of the task (e.g., Buy feed, Fix fence).'
            },
            dueDate: {
                type: Type.STRING,
                description: 'The due date in YYYY-MM-DD format.'
            }
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
        contents: `You are an expert poultry farm consultant specializing in Rhode Island Reds and Black Australorps. 
        User Question: ${input}
        
        If the user wants to add a task, use the createTask tool. Today is ${new Date().toISOString().split('T')[0]}.`,
        config: {
            tools: [{ functionDeclarations: [createTaskTool] }]
        }
      });

      // Handle Function Calls
      const functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall)?.map(p => p.functionCall);
      
      if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          if (call && call.name === 'createTask') {
              const args = call.args as any;
              
              // Perform the logic (save task)
              const newTask: ManualTask = {
                  id: `task-${Date.now()}`,
                  description: args.description,
                  dueDate: args.dueDate,
                  completed: false,
                  createdAt: new Date().toISOString()
              };
              
              // We need to update local state. Since `tasks` comes from usePersistentState, 
              // we can't update it inside this async function easily without causing closure staleness issues 
              // if we use `setTasks` dependent on `tasks`.
              // So we read from localStorage directly to be safe, then update.
              const currentTasks = JSON.parse(localStorage.getItem('poultry_tasks') || '[]');
              const updatedTasks = [newTask, ...currentTasks];
              localStorage.setItem('poultry_tasks', JSON.stringify(updatedTasks));
              setTasks(updatedTasks); // Update React state to reflect globally if needed

              // Send response back to model
              const toolResponse = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: [
                      { role: 'user', parts: [{ text: input }] },
                      { role: 'model', parts: [{ functionCall: call }] },
                      { role: 'user', parts: [{ functionResponse: { name: 'createTask', response: { result: 'Task created successfully' } } }] }
                  ]
              });
              
               const text = toolResponse.text || "Task created.";
               setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text }]);
          }
      } else {
        const text = response.text || "I apologize, I couldn't generate a response at the moment.";
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text }]);
      }

    } catch (error) {
      const errorText = handleAPIError(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: errorText }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    if (!symptoms.trim()) return;
    setIsHealthLoading(true);

    try {
      const ai = createAIClient();
      const prompt = `I need a veterinary assessment for a poultry bird.
      Details:
      - Age/Stage: ${birdAge || 'Unknown'}
      - Symptoms: ${symptoms}
      
      Please provide:
      1. Potential Diagnosis (list top 3 possibilities)
      2. Recommended Immediate Actions
      3. When to call a vet
      
      Disclaimer: Provide advice but state this is AI assistance, not professional veterinary diagnosis.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setHealthAnalysis(response.text || "No analysis generated.");
    } catch (error) {
      handleAPIError(error);
      setHealthAnalysis("Error generating analysis. Please reconnect and try again.");
    } finally {
      setIsHealthLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsAnalysisLoading(true);
    
    // Gather Data from LocalStorage
    const birds: Bird[] = JSON.parse(localStorage.getItem('poultry_birds') || '[]');
    const eggs: EggLogEntry[] = JSON.parse(localStorage.getItem('poultry_eggs') || '[]');
    const finance: Transaction[] = JSON.parse(localStorage.getItem('poultry_finance') || '[]');

    // Summarize Data for the prompt (to avoid token limits)
    const totalBirds = birds.length;
    const activeHens = birds.filter(b => b.stage === 'Hen' && b.status === 'Active').length;
    const recentEggs = eggs.slice(0, 30); // Last 30 entries
    const recentFinance = finance.slice(0, 30); // Last 30 entries
    
    const prompt = `Analyze this poultry farm data and provide a performance report.
    
    Flock Stats:
    - Total Birds: ${totalBirds}
    - Active Hens: ${activeHens}
    
    Egg Logs (Last 30 entries):
    ${JSON.stringify(recentEggs.map(e => ({ d: e.date, c: e.count, dmg: e.damaged })))}
    
    Financials (Last 30 entries):
    ${JSON.stringify(recentFinance.map(f => ({ d: f.date, type: f.type, amt: f.amount, cat: f.category })))}
    
    Please provide a structured report with:
    1. Production Efficiency (Laying rate trends)
    2. Financial Health (Income vs Expense analysis)
    3. Three specific recommendations for improvement.`;

    try {
      const ai = createAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAnalysisReport(response.text || "Report generation failed.");
    } catch (error) {
      handleAPIError(error);
      setAnalysisReport("Error generating report. Please reconnect and try again.");
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  if (!hasApiKey) {
      return (
          <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 space-y-6 text-center">
              <div className="p-4 bg-indigo-100 rounded-full text-indigo-600 mb-2">
                  <Sparkles size={48} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Connect AI Assistant</h1>
              <p className="text-gray-500 max-w-md">
                  Link your Google Account to unlock Gemini-powered insights for your farm. 
                  Chat with an expert advisor, diagnose health issues, and generate performance reports.
              </p>
              
              <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-md">
                   <button 
                      onClick={handleConnect}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                   >
                       <Lock size={18} />
                       Connect Google Account
                   </button>
                   <div className="mt-4 text-xs text-gray-400">
                       By connecting, you agree to the usage terms. 
                       <a 
                          href="https://ai.google.dev/gemini-api/docs/billing" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline ml-1 inline-flex items-center gap-0.5"
                       >
                           View Billing Info <ExternalLink size={10} />
                       </a>
                   </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
            <Sparkles size={24} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Farm Assistant</h1>
            <p className="text-sm text-gray-500">Powered by Google Gemini</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-lg">
        <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all
            ${activeTab === 'chat' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <Bot size={18} /> Chat Advisor
        </button>
        <button 
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all
            ${activeTab === 'health' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <Activity size={18} /> Health Scanner
        </button>
        <button 
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all
            ${activeTab === 'analysis' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <TrendingUp size={18} /> Farm Analyst
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* CHAT TAB */}
        {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                {msg.role === 'model' && <Bot size={16} className="inline-block mr-2 mb-0.5 opacity-50" />}
                                <span className="whitespace-pre-wrap">{msg.text}</span>
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                             <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-indigo-600" />
                                <span className="text-xs text-gray-400">Thinking...</span>
                             </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask questions or say 'Create a task to buy feed tomorrow'..."
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={isChatLoading || !input.trim()}
                            className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* HEALTH TAB */}
        {activeTab === 'health' && (
            <div className="h-full flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50 overflow-y-auto">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-rose-500" /> 
                        Symptom Checker
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bird Age / Stage</label>
                            <input 
                                type="text" 
                                value={birdAge}
                                onChange={(e) => setBirdAge(e.target.value)}
                                placeholder="e.g. 12 week pullet"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Describe Symptoms</label>
                            <textarea 
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                rows={6}
                                placeholder="e.g. lethargic, pale comb, ruffled feathers..."
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                            />
                        </div>
                        <button 
                            onClick={handleHealthCheck}
                            disabled={isHealthLoading || !symptoms}
                            className="w-full py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isHealthLoading ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
                            Analyze Symptoms
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                    {healthAnalysis ? (
                        <div className="prose prose-sm max-w-none">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Diagnostic Assessment</h3>
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
                                {healthAnalysis}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Activity size={48} className="mb-4 opacity-20" />
                            <p>Enter symptoms to generate a veterinary assessment.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === 'analysis' && (
            <div className="h-full flex flex-col p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Farm Data Analyst</h3>
                        <p className="text-sm text-gray-500 max-w-xl">
                            This tool reads your Egg Logs, Financial Records, and Flock data to provide actionable insights and trend analysis.
                        </p>
                    </div>
                    <button 
                        onClick={handleGenerateReport}
                        disabled={isAnalysisLoading}
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {isAnalysisLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                        Generate New Report
                    </button>
                </div>

                {analysisReport ? (
                     <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 md:p-8">
                         <div className="flex items-center gap-2 mb-4 text-indigo-800 font-semibold border-b border-indigo-100 pb-2">
                            <Sparkles size={18} />
                            AI Generated Insights
                         </div>
                         <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-medium">
                             {analysisReport}
                         </div>
                         <div className="mt-6 text-xs text-gray-400 text-right">
                             Generated based on local farm records
                         </div>
                     </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <TrendingUp size={48} className="mb-4 opacity-20" />
                        <p>Click "Generate New Report" to analyze your farm's performance.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};