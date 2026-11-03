import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  BarChart3, AlertTriangle, CheckCircle2, TrendingUp, Users, 
  Search, ShieldAlert, Zap, ArrowUpRight, MessageSquare, RefreshCw
} from 'lucide-react';

const SUPABASE_URL = 'https://zyzjivlzqdzvalsdkhab.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5pVD88-qcwS_-UMwnOFIqA_jTK4G1JI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
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

    if (error) {
      console.error('Помилка завантаження аудитів:', error);
    } else {
      setAudits(data || []);
      if (data && data.length > 0 && !selectedAudit) {
        setSelectedAudit(data[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAudits();

    const channel = supabase
      .channel('chat_audits_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_audits' }, (payload) => {
        setAudits((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalAudits = audits.length;
  const avgScore = totalAudits > 0 
    ? (audits.reduce((acc, item) => acc + (item.overall_score || 0), 0) / totalAudits).toFixed(1) 
    : '0.0';
  const criticalCount = audits.filter(a => (a.overall_score || 0) <= 5).length;

  const filteredAudits = audits.filter(a => 
    a.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.client_username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 6) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SalesControl <span className="text-indigo-400 font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 ml-1">AI QA</span>
            </span>
          </div>

          <button 
            onClick={fetchAudits}
            className="flex items-center space-x-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Оновити</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Проаналізовано чатів</p>
              <h3 className="text-2xl font-bold mt-1">{totalAudits}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Середній бал відділу</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">{avgScore} <span className="text-xs text-slate-500 font-normal">/ 10</span></h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Критичні зливи (≤ 5)</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-400">{criticalCount}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-[500px]">
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input 
                type="text" 
                placeholder="Пошук за менеджером або клієнтом..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loading && audits.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">Завантаження даних із Supabase...</div>
              ) : filteredAudits.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">Аудитів поки немає</div>
              ) : (
                filteredAudits.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAudit(item)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      selectedAudit?.id === item.id 
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-950/20' 
                        : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-slate-200">{item.manager_name || 'Невідомий'}</span>
                        <span className="text-xs text-slate-500">→ @{item.client_username || 'client'}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {item.client_intent || 'Без теми'}
                      </p>
                    </div>

                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${getScoreColor(item.overall_score)}`}>
                      {item.overall_score}/10
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
            {selectedAudit ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">
                      Аудит діалогу #{selectedAudit.id}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(selectedAudit.created_at).toLocaleString('uk-UA')}
                    </p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl border text-sm font-bold ${getScoreColor(selectedAudit.overall_score)}`}>
                    Оцінка: {selectedAudit.overall_score} / 10
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 block mb-1">Менеджер:</span>
                    <span className="font-medium text-slate-200 text-sm">{selectedAudit.manager_name}</span>
                  </div>
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 block mb-1">Клієнт:</span>
                    <span className="font-medium text-slate-200 text-sm">@{selectedAudit.client_username}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Намір клієнта (Client Intent)</h4>
                    <p className="text-sm bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 text-slate-300">
                      {selectedAudit.client_intent || 'Не вказано'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Критичні помилки</span>
                    </h4>
                    <ul className="list-disc pl-4 text-sm text-slate-300 space-y-1">
                      {selectedAudit.mistakes ? (
                        Array.isArray(selectedAudit.mistakes) ? (
                          selectedAudit.mistakes.map((err, i) => <li key={i}>{err}</li>)
                        ) : (
                          <li>{selectedAudit.mistakes}</li>
                        )
                      ) : (
                        <li className="text-slate-500 italic list-none">Не виявлено</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Позитивні моменти</span>
                    </h4>
                    <ul className="list-disc pl-4 text-sm text-slate-300 space-y-1">
                      {selectedAudit.good_points ? (
                        Array.isArray(selectedAudit.good_points) ? (
                          selectedAudit.good_points.map((pt, i) => <li key={i}>{pt}</li>)
                        ) : (
                          <li>{selectedAudit.good_points}</li>
                        )
                      ) : (
                        <li className="text-slate-500 italic list-none">Не виявлено</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">Як треба було відповісти</h4>
                    <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20 text-sm text-indigo-200">
                      {selectedAudit.ideal_response || 'Дані відсутні'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                <BarChart3 className="w-12 h-12 opacity-20" />
                <p className="text-sm">Оберіть аудит зі списку для перегляду деталей</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
