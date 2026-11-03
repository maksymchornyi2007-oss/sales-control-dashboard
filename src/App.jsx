import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, MessageSquare, Activity, Settings, 
  Search, ShieldAlert, TrendingUp, Bell, Zap, 
  AlertTriangle, CheckCircle2, RefreshCw, ChevronRight, Star
} from 'lucide-react';

// Твої ключі Supabase
const SUPABASE_URL = 'https://zyzjivlzqdzvalsdkhab.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5pVD88-qcwS_-UMwnOFIqA_jTK4G1JI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudit, setSelectedAudit] = useState(null);

  const fetchAudits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chat_audits')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAudits(data);
      if (data.length > 0 && !selectedAudit) setSelectedAudit(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAudits();
    const channel = supabase
      .channel('realtime_audits')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_audits' }, (payload) => {
        setAudits((prev) => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const totalAudits = audits.length;
  const avgScore = totalAudits > 0 
    ? (audits.reduce((acc, item) => acc + (item.overall_score || 0), 0) / totalAudits).toFixed(1) 
    : '0.0';
  const criticalAudits = audits.filter(a => (a.overall_score || 0) <= 5);
  const excellentAudits = audits.filter(a => (a.overall_score || 0) >= 9);

  const filteredAudits = audits.filter(a => 
    a.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.client_username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreBadge = (score) => {
    if (score >= 8) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    if (score >= 6) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 font-sans flex selection:bg-indigo-500/30">
      <aside className="w-64 flex-shrink-0 bg-[#0f111a]/80 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between hidden md:flex z-10">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Lidox <span className="text-indigo-400 text-xs">AI</span></span>
            </div>
          </div>
          
          <nav className="p-4 space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Меню</p>
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Огляд' },
              { id: 'audits', icon: MessageSquare, label: 'Аудити чатів' },
              { id: 'analytics', icon: Activity, label: 'Аналітика' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
            <Settings className="w-5 h-5 text-slate-500" />
            <span className="text-sm">Налаштування</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

        <header className="h-20 bg-[#0f111a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>Проєкт</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-indigo-400 font-medium">Моя компанія</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={fetchAudits} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_5px_rgba(244,63,94,0.8)]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border border-white/10"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 z-10">
          
          {activeTab === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Вітаємо у Lidox 👋</h1>
                <p className="text-slate-400 text-sm mt-1">Ось що відбувається у вашому відділі продажів сьогодні.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#151822] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><MessageSquare className="w-16 h-16 text-indigo-500" /></div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Усього перевірено</p>
                  <h3 className="text-3xl font-bold text-white">{totalAudits}</h3>
                </div>
                
                <div className="bg-[#151822] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp className="w-16 h-16 text-emerald-500" /></div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Середній бал</p>
                  <h3 className="text-3xl font-bold text-emerald-400">{avgScore} <span className="text-lg text-slate-500">/ 10</span></h3>
                </div>

                <div className="bg-[#151822] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ShieldAlert className="w-16 h-16 text-rose-500" /></div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Критичні зливи</p>
                  <h3 className="text-3xl font-bold text-rose-400">{criticalAudits.length}</h3>
                </div>

                <div className="bg-[#151822] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Star className="w-16 h-16 text-amber-500" /></div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Ідеальні діалоги</p>
                  <h3 className="text-3xl font-bold text-amber-400">{excellentAudits.length}</h3>
                </div>
              </div>

              <div className="bg-[#151822] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Останні критичні діалоги</h3>
                  <button onClick={() => setActiveTab('audits')} className="text-sm text-indigo-400 hover:text-indigo-300">Дивитись усі →</button>
                </div>
                
                {criticalAudits.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-white/[0.02] rounded-xl border border-white/5 border-dashed">
                    Схоже, відділ продажів працює ідеально. Критичних зливів не знайдено!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {criticalAudits.slice(0, 3).map(audit => (
                      <div key={audit.id} className="flex items-center justify-between p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/10">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-200">{audit.manager_name || 'Менеджер'} <span className="text-slate-500 text-sm">vs</span> @{audit.client_username}</p>
                            <p className="text-xs text-rose-400/80 mt-0.5">{audit.client_intent || 'Не вказано'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedAudit(audit); setActiveTab('audits'); }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
                        >
                          Розбір
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'audits' && (
            <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
              <div className="w-full lg:w-[400px] flex flex-col h-[calc(100vh-9rem)] bg-[#151822] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-[#151822]">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Пошук (менеджер, клієнт)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {loading && audits.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">Завантаження бази...</div>
                  ) : filteredAudits.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">Діалогів не знайдено</div>
                  ) : (
                    filteredAudits.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedAudit(item)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedAudit?.id === item.id 
                            ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                            : 'bg-transparent border-white/5 hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm text-slate-200">{item.manager_name || 'Менеджер'}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getScoreBadge(item.overall_score)}`}>
                            {item.overall_score}/10
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">@{item.client_username || 'client'}</div>
                        <p className="text-xs text-slate-400 line-clamp-1">{item.client_intent || 'Без теми'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex-1 h-[calc(100vh-9rem)] overflow-y-auto bg-[#151822] border border-white/5 rounded-2xl p-6 custom-scrollbar relative">
                {selectedAudit ? (
                  <div className="max-w-3xl mx-auto space-y-8 pb-10">
                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                          <span>Аудит діалогу #{selectedAudit.id}</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(selectedAudit.created_at).toLocaleString('uk-UA')}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl border font-bold text-lg ${getScoreBadge(selectedAudit.overall_score)}`}>
                        Оцінка AI: {selectedAudit.overall_score} / 10
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0a0a0f] p-4 rounded-xl border border-white/5">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Менеджер</span>
                        <span className="font-semibold text-slate-200">{selectedAudit.manager_name || 'Невідомо'}</span>
                      </div>
                      <div className="bg-[#0a0a0f] p-4 rounded-xl border border-white/5">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Клієнт Instagram</span>
                        <span className="font-semibold text-indigo-400">@{selectedAudit.client_username}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-[#0a0a0f] p-5 rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-700"></div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Намір клієнта</h4>
                        <p className="text-sm text-slate-300">{selectedAudit.client_intent || 'Дані відсутні'}</p>
                      </div>

                      <div className="bg-rose-500/[0.02] p-5 rounded-xl border border-rose-500/10 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4" /> <span>Знайдені помилки</span>
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-slate-300 space-y-2">
                          {selectedAudit.mistakes ? (
                            Array.isArray(selectedAudit.mistakes) ? (
                              selectedAudit.mistakes.map((err, i) => <li key={i}>{err}</li>)
                            ) : (
                              <li>{selectedAudit.mistakes}</li>
                            )
                          ) : <li className="text-slate-500 italic list-none">Помилок не виявлено</li>}
                        </ul>
                      </div>

                      <div className="bg-emerald-500/[0.02] p-5 rounded-xl border border-emerald-500/10 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4" /> <span>Позитивні моменти</span>
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-slate-300 space-y-2">
                          {selectedAudit.good_points ? (
                            Array.isArray(selectedAudit.good_points) ? (
                              selectedAudit.good_points.map((pt, i) => <li key={i}>{pt}</li>)
                            ) : (
                              <li>{selectedAudit.good_points}</li>
                            )
                          ) : <li className="text-slate-500 italic list-none">Немає даних</li>}
                        </ul>
                      </div>

                      <div className="bg-indigo-500/[0.02] p-5 rounded-xl border border-indigo-500/20 relative overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.05)]">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center space-x-2">
                          <Zap className="w-4 h-4" /> <span>AI Рекомендація: Як треба було відповісти</span>
                        </h4>
                        <div className="p-4 bg-[#0a0a0f]/50 rounded-lg border border-white/5 text-sm text-indigo-200 leading-relaxed italic">
                          "{selectedAudit.ideal_response || 'Дані відсутні'}"
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                      <Search className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm">Оберіть аудит зі списку зліва для глибокого аналізу</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-4xl mx-auto text-center py-20 animate-in fade-in duration-500">
              <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-6">
                <Activity className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Глибока аналітика в розробці</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Тут будуть графіки конверсії, динаміка розвитку менеджерів та теплові карти діалогів. Цей модуль стане доступним у наступному оновленні.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
