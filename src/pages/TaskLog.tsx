import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, TrendingUp, Clock, CheckCircle, XCircle, Award, ArrowRight, ChevronDown, ChevronUp, AlertCircle, Zap, ClipboardList, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Application } from '../types';
import { cn } from '../lib/utils';

export default function TaskLog() {
  const [apps, setApps] = useState<Application[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('interview_logs') || '[]');
    setApps(logs);
  }, []);

  const updateStatus = (id: string, newStatus: Application['status']) => {
    const updatedApps = apps.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    );
    setApps(updatedApps);
    localStorage.setItem('interview_logs', JSON.stringify(updatedApps));
  };

  const stats = [
    { label: '总申请数', value: apps.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', sub: '本周 +12%', subColor: 'text-green-600' },
    { label: '进行中', value: apps.filter(a => a.status === 'interviewing').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', sub: '等待面试', subColor: 'text-orange-600' },
    { label: '已拒绝', value: apps.filter(a => a.status === 'rejected').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', sub: '"这只是成长的过程"', subColor: 'text-slate-400' },
    { label: '录用通知', value: apps.filter(a => a.status === 'offered').length, icon: Award, color: 'text-green-600', bg: 'bg-green-50', sub: `转化率 ${apps.length ? ((apps.filter(a => a.status === 'offered').length / apps.length) * 100).toFixed(1) : 0}%`, subColor: 'text-green-600' },
  ];

  return (
    <div className="px-12 py-10 space-y-12 max-w-6xl mx-auto">
      <section className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_10px_30px_rgba(32,48,68,0.04)] group hover:translate-y-[-4px] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">{stat.label}</span>
              <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-black text-on-surface">{stat.value}</div>
            <div className={`mt-2 text-xs ${stat.subColor} font-semibold`}>{stat.sub}</div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold text-on-surface mb-1">申请历史</h3>
            <p className="text-on-surface-variant text-sm">跟踪你的每一次职场尝试，并预测成功率。</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">导出数据</button>
            <button className="px-4 py-2 text-xs font-bold bg-on-surface text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Filter className="w-4 h-4" /> 筛选
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(32,48,68,0.04)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">公司</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">职位</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">日期</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">当前状态</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">录用预测</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {apps.map((app, i) => {
                const isExpanded = expandedId === app.id;
                const prob = app.result?.offerProbability || 0;
                const statusLabel = app.status === 'offered' ? '倾向通过' : app.status === 'rejected' ? '倾向淘汰' : '面试中';
                const statusColor = app.status === 'offered' ? 'bg-green-100 text-green-600' : app.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600';
                
                return (
                  <React.Fragment key={app.id}>
                    <tr 
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg bg-on-surface flex items-center justify-center text-white font-black text-xs`}>{app.company[0]}</div>
                          <span className="font-bold text-on-surface">{app.company}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-on-surface-variant font-medium">{app.role}</td>
                      <td className="px-8 py-6 text-sm text-slate-400">{app.date}</td>
                      <td className="px-8 py-6">
                        <div className="relative group/status">
                          <select 
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value as Application['status'])}
                            className={cn(
                              "appearance-none px-3 py-1 text-xs font-bold rounded-full cursor-pointer focus:outline-none pr-6",
                              statusColor
                            )}
                          >
                            <option value="interviewing">面试中</option>
                            <option value="offered">已录用</option>
                            <option value="rejected">已拒绝</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="w-48">
                          <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                            <span className={prob >= 80 ? 'text-green-600' : prob >= 50 ? 'text-orange-500' : 'text-red-500'}>
                              {prob}% Offer 概率
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all duration-500",
                                prob >= 80 ? 'bg-green-500' : prob >= 50 ? 'bg-orange-500' : 'bg-red-500'
                              )} 
                              style={{ width: `${prob}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </td>
                    </tr>
                    <AnimatePresence>
                      {isExpanded && app.result && (
                        <tr>
                          <td colSpan={6} className="px-8 py-0 bg-slate-50/30">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="py-8 grid grid-cols-12 gap-8 border-t border-slate-100">
                                <div className="col-span-4 space-y-6">
                                  <div>
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">能力评分 / SCORES</h4>
                                    <div className="space-y-4">
                                      {[
                                        { label: '岗位匹配度', score: app.result.scores.matching },
                                        { label: '表达能力', score: app.result.scores.expression },
                                        { label: '项目真实性', score: app.result.scores.authenticity },
                                        { label: '行业理解', score: app.result.scores.industry },
                                      ].map((s, idx) => (
                                        <div key={idx} className="space-y-1">
                                          <div className="flex justify-between text-[10px] font-bold">
                                            <span>{s.label}</span>
                                            <span>{s.score}</span>
                                          </div>
                                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-on-surface" style={{ width: `${s.score}%` }}></div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-on-surface mb-2 flex items-center gap-2">
                                      <AlertCircle className="w-3 h-3 text-primary" /> 核心原因
                                    </p>
                                    <p className="text-xs text-on-surface-variant leading-relaxed">{app.result.reason}</p>
                                  </div>
                                </div>

                                <div className="col-span-4">
                                  <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-4">3个最致命问题 / FATAL PROBLEMS</h4>
                                  <div className="space-y-3">
                                    {app.result.fatalProblems.map((p, idx) => (
                                      <div key={idx} className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                        <span className="text-red-600 font-black text-xs">{idx + 1}</span>
                                        <p className="text-xs text-red-800 font-medium">{p}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="col-span-4">
                                  <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-4">优化路径 / OPTIMIZATION</h4>
                                  <div className="space-y-3">
                                    {app.result.optimizationPath.map((p, idx) => (
                                      <div key={idx} className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                        <Zap className="w-3 h-3 text-green-600 mt-0.5" />
                                        <p className="text-xs text-green-800 font-medium">{p}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Chat History Section */}
                              {app.chatHistory && app.chatHistory.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" /> 对话记录 / CHAT HISTORY
                                  </h4>
                                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                    {app.chatHistory.map((msg, idx) => (
                                      <div 
                                        key={idx} 
                                        className={cn(
                                          "flex gap-3 max-w-[80%]",
                                          msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                        )}
                                      >
                                        <div className={cn(
                                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                          msg.role === 'assistant' ? "bg-on-surface text-white" : "bg-primary-container text-on-primary-container"
                                        )}>
                                          {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </div>
                                        <div className={cn(
                                          "p-3 rounded-xl text-xs leading-relaxed",
                                          msg.role === 'assistant' 
                                            ? "bg-slate-50 text-on-surface rounded-tl-none border border-slate-100" 
                                            : "bg-primary-container text-on-primary-container rounded-tr-none"
                                        )}>
                                          <p className="whitespace-pre-wrap">{msg.content}</p>
                                          <span className="text-[8px] opacity-40 mt-1 block">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <ClipboardList className="w-12 h-12" />
                      <p className="text-sm font-bold">暂无任务记录，快去实验室开启面试吧</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
