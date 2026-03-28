import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, TrendingUp, Clock, ArrowRight, Plus, ClipboardList, ShieldCheck, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Application, InterviewResult } from '../types';
import { cn } from '../lib/utils';

export default function Verdict() {
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const loadLogs = () => {
    const logs = JSON.parse(localStorage.getItem('interview_logs') || '[]');
    setApps(logs);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const latestApp = apps[selectedIndex];

  if (!apps.length || !latestApp || !latestApp.result) {
    return (
      <div className="p-12 max-w-6xl mx-auto h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
          <ClipboardList className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-on-surface mb-2">暂无面试裁决报告</h2>
          <p className="text-on-surface-variant max-w-md">你还没有完成任何模拟面试。请先前往“实验室”开启你的第一场职场实战演练。</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-orange-500/10 hover:scale-105 transition-transform"
        >
          刷新数据
        </button>
      </div>
    );
  }

  const result = latestApp.result;
  const radarData = [
    { subject: '岗位匹配', A: result.scores.matching, fullMark: 100 },
    { subject: '表达能力', A: result.scores.expression, fullMark: 100 },
    { subject: '真实性', A: result.scores.authenticity, fullMark: 100 },
    { subject: '行业理解', A: result.scores.industry, fullMark: 100 },
    { subject: '综合素质', A: (result.scores.matching + result.scores.expression + result.scores.authenticity + result.scores.industry) / 4, fullMark: 100 },
  ];

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-12">
      {/* Report Selector */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-on-surface">面试裁决报告</h2>
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-slate-100">
            <Clock className="w-4 h-4 text-slate-400" />
            <select 
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
              className="bg-transparent text-sm font-bold text-on-surface-variant focus:outline-none cursor-pointer"
            >
              {apps.map((app, i) => (
                <option key={app.id} value={i}>
                  {app.company} - {app.role} ({app.date})
                </option>
              ))}
            </select>
          </div>
        </div>
        <button 
          onClick={loadLogs}
          className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
        >
          <TrendingUp className="w-4 h-4" /> 刷新最新数据
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Probability Card */}
        <div className="col-span-8 bg-gradient-to-br from-on-surface to-slate-800 p-10 rounded-2xl text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <span className="relative z-10 inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">录取概率调查 / PROBABILITY</span>
          <h2 className="relative z-10 text-[4.5rem] font-black mb-4 leading-none tracking-tighter">
            {result.offerProbability}%
          </h2>
          <p className="relative z-10 text-xl font-medium opacity-90 mb-8 italic max-w-xl">
            “{result.reason}”
          </p>
          <div className="relative z-10 flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold">
              <TrendingUp className="w-4 h-4" /> 实时评估结果
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="w-4 h-4" /> {latestApp.company} · {latestApp.role}
            </div>
          </div>
        </div>

        {/* Verdict Opinion */}
        <div className="col-span-4 bg-surface-container-lowest p-8 rounded-2xl border-l-4 border-primary shadow-sm flex flex-col items-center justify-center text-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-6",
            result.conclusion === 'PASS' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {result.conclusion === 'PASS' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-bold mb-4 text-on-surface">最终裁决</h3>
          <p className={cn(
            "text-2xl font-black mb-4",
            result.conclusion === 'PASS' ? "text-green-600" : "text-red-600"
          )}>
            {result.conclusion === 'PASS' ? '倾向通过' : '倾向淘汰'}
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            基于 AI 质询官的深度逻辑扫描与压力测试，我们对你的本次表现给出了如上结论。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Reasons Analysis */}
        <div className="col-span-8 bg-surface-container-lowest p-10 rounded-2xl shadow-sm space-y-8">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-container rounded-full"></div>
            核心问题深度分析 (Fatal Problems)
          </h3>
          
          <div className="space-y-6">
            {result.fatalProblems.map((problem, i) => (
              <div key={i} className="p-5 bg-red-50/50 rounded-xl border border-red-100 flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-red-900 mb-1">关键缺陷 #{i + 1}</h4>
                  <p className="text-sm text-red-800/80 leading-relaxed">{problem}</p>
                </div>
              </div>
            ))}
            {result.fatalProblems.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant italic">
                表现完美，未发现致命逻辑漏洞。
              </div>
            )}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="col-span-4 bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-6">能力雷达图 (Gap Map)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar
                  name="你的表现"
                  dataKey="A"
                  stroke="#fe9400"
                  fill="#fe9400"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {radarData.map((d, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span>{d.subject}</span>
                <span className="text-on-surface">{d.A} / 100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recovery Roadmap */}
      <section className="bg-surface-container-lowest p-10 rounded-2xl shadow-sm relative">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-bold text-on-surface mb-2">优化路径 (Optimization Path)</h3>
            <p className="text-on-surface-variant text-sm">根据你的面评结果，我们为你规划了接下来的提升路径。</p>
          </div>
          <div className="bg-green-50 text-green-600 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold">
            <Clock className="w-4 h-4" /> 建议立即执行
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.optimizationPath.map((path, i) => (
            <div key={i} className="bg-surface-container-low p-6 rounded-xl border border-transparent hover:border-primary-container/20 transition-all group">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold mb-4 shadow-lg shadow-orange-500/10">
                {i + 1}
              </div>
              <h4 className="text-lg font-bold text-on-surface mb-3">改进建议 #{i + 1}</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">{path}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
