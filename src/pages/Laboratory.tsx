import React, { useState, useRef } from 'react';
import { Upload, ArrowRight, Lightbulb, Quote, FileText, X, CheckCircle, TrendingUp, AlertTriangle, Brain, Zap, Download, BarChart3, Search, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface LaboratoryProps {
  onStartInterview: () => void;
}

interface IntelligenceData {
  marketStatus: {
    rank: string;
    share: string;
    trend: string;
    retention: string;
    competitiveness: string;
    sector: string;
  };
  recentTrends: Array<{
    date: string;
    title: string;
    detail: string;
    type: 'info' | 'warning' | 'success';
  }>;
  competitors: Array<{
    name: string;
    desc: string;
    detail: string;
    tags: string[];
  }>;
  pitfalls: Array<{
    title: string;
    text: string;
  }>;
}

export default function Laboratory({ onStartInterview }: LaboratoryProps) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [intelData, setIntelData] = useState<IntelligenceData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx') || droppedFile.name.endsWith('.pdf'))) {
      setFile(droppedFile);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runAnalysis = async () => {
    if (!company || !jd) return;
    
    setIsAnalyzing(true);
    try {
      const apiResponse = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-3-flash-preview",
          contents: `你是一名资深的职业顾问，专门为实习生和应届生提供求职情报。
          目标公司：${company}
          职位描述：${jd}
          
          请利用 Google Search 搜索该公司的最新真实信息，并为实习生/应届生量身定制一份深度情报报告。
          必须包含：
          1. 行业地位（针对该岗位的细分领域）。
          2. 近期动态（融资、业务调整、校招/实习生招聘趋势）。
          3. 核心竞对分析。
          4. 面试避坑指南（特别针对缺乏经验的应届生，如：考察重点、文化偏好、面试官常见陷阱）。
          
          请确保数据真实、时效性强。`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                marketStatus: {
                  type: "OBJECT",
                  properties: {
                    rank: { type: "STRING", description: "行业排名，如 TOP 3" },
                    share: { type: "STRING", description: "市场占有率或增长率" },
                    trend: { type: "STRING", description: "增长趋势，如 ↑ 15%" },
                    retention: { type: "STRING", description: "人才留存率或校招口碑" },
                    competitiveness: { type: "STRING", description: "薪酬竞争力，如 P75" },
                    sector: { type: "STRING", description: "细分赛道名称" }
                  },
                  required: ["rank", "share", "trend", "retention", "competitiveness", "sector"]
                },
                recentTrends: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      date: { type: "STRING" },
                      title: { type: "STRING" },
                      detail: { type: "STRING" },
                      type: { type: "STRING", enum: ["info", "warning", "success"] }
                    },
                    required: ["date", "title", "detail", "type"]
                  }
                },
                competitors: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      desc: { type: "STRING" },
                      detail: { type: "STRING" },
                      tags: { type: "ARRAY", items: { type: "STRING" } }
                    },
                    required: ["name", "desc", "detail", "tags"]
                  }
                },
                pitfalls: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      title: { type: "STRING" },
                      text: { type: "STRING" }
                    },
                    required: ["title", "text"]
                  }
                }
              },
              required: ["marketStatus", "recentTrends", "competitors", "pitfalls"]
            }
          }
        })
      });

      if (!apiResponse.ok) {
        throw new Error('API request failed');
      }

      const response = await apiResponse.json();
      const data = JSON.parse(response.text);
      setIntelData(data);
      setShowIntelligence(true);
      
      // Scroll to intelligence section
      setTimeout(() => {
        const intelSection = document.getElementById('intelligence-section');
        intelSection?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Intelligence Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-12 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <h2 className="text-[3.5rem] font-bold text-on-surface leading-tight tracking-tight mb-4">
          实验室 <span className="text-primary-container">配置阶段</span>
        </h2>
        <p className="text-xl text-on-surface-variant max-w-2xl font-medium">
          Ready to step into the "Hot Seat"? Here, we strip away the sugarcoating and leave only the direct truth. Please provide the following essential materials before we begin.
        </p>
      </motion.div>

      <div className="grid grid-cols-12 gap-8 mb-16">
        <div className="col-span-8 space-y-8">
          {/* Step 1: Company Name */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(32,48,68,0.06)]">
            <div className="flex items-start gap-4 mb-8">
              <span className="bg-primary-container text-on-primary-container w-8 h-8 rounded flex items-center justify-center font-bold text-sm">01</span>
              <div>
                <h3 className="text-xl font-semibold mb-1 text-on-surface">目标公司名称</h3>
                <p className="text-sm text-on-surface-variant">我们将根据公司文化定制面试风格。</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="relative group">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">公司名称</label>
                <input 
                  type="text" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="例如：字节跳动、腾讯..."
                  className="w-full bg-surface-container-low border-none focus:ring-0 px-4 py-4 rounded-lg text-lg font-medium placeholder:text-outline-variant/60 transition-all"
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-container group-focus-within:w-full transition-all duration-300"></div>
              </div>
              <div className="relative group">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">职位名称</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="例如：产品经理实习生..."
                  className="w-full bg-surface-container-low border-none focus:ring-0 px-4 py-4 rounded-lg text-lg font-medium placeholder:text-outline-variant/60 transition-all"
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-container group-focus-within:w-full transition-all duration-300"></div>
              </div>
            </div>
          </section>

          {/* Step 2: Resume Upload */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(32,48,68,0.06)] border-l-4 border-primary-container">
            <div className="flex items-start gap-4 mb-8">
              <span className="bg-primary-container text-on-primary-container w-8 h-8 rounded flex items-center justify-center font-bold text-sm">02</span>
              <div>
                <h3 className="text-xl font-semibold mb-1 text-on-surface">上传简历</h3>
                <p className="text-sm text-on-surface-variant">支持 PDF 或 DOCX 格式。这是我们分析你的主要依据。</p>
              </div>
            </div>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "group cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all duration-300",
                isDragging ? "border-primary-container bg-primary-container/5 scale-[1.01]" : "border-outline-variant/30 bg-surface-container-low/50 hover:bg-surface-container-low",
                file ? "border-green-500 bg-green-50/30" : ""
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
                accept=".pdf,.docx" 
              />
              
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center pt-5 pb-6"
                  >
                    <Upload className={cn("w-10 h-10 mb-3 transition-colors", isDragging ? "text-primary" : "text-primary-container")} />
                    <p className="mb-2 text-sm font-semibold text-on-surface">点击或拖拽文件到此处</p>
                    <p className="text-xs text-on-surface-variant">最大限制 10MB (PDF/DOCX)</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="filled"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-6 w-full"
                  >
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex items-center gap-4 relative group/file">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FileText className="text-green-600 w-6 h-6" />
                      </div>
                      <div className="pr-8">
                        <p className="text-sm font-bold text-on-surface truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> 已就绪
                        </p>
                      </div>
                      <button 
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Step 3: JD Paste */}
          <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(32,48,68,0.06)]">
            <div className="flex items-start gap-4 mb-8">
              <span className="bg-primary-container text-on-primary-container w-8 h-8 rounded flex items-center justify-center font-bold text-sm">03</span>
              <div>
                <h3 className="text-xl font-semibold mb-1 text-on-surface">粘贴职位详情</h3>
                <p className="text-sm text-on-surface-variant">请将职位描述（Job Description）的文本粘贴在下方。</p>
              </div>
            </div>
            <textarea 
              rows={8}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="粘贴 JD 全文..."
              className="w-full bg-surface-container-low border-none focus:ring-0 px-4 py-4 rounded-lg text-base leading-relaxed placeholder:text-outline-variant/60 transition-all"
            />
          </section>

          <div className="pt-8 flex items-center gap-6">
            <button 
              onClick={runAnalysis}
              disabled={!company || !jd || isAnalyzing}
              className="bg-on-surface text-white px-8 py-4 rounded-lg font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>正在深度扫描情报...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>获取公司情报 / Run Intelligence</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => {
                localStorage.setItem('current_company', company);
                localStorage.setItem('current_role', role);
                localStorage.setItem('current_jd', jd);
                onStartInterview();
              }}
              disabled={!company || !role || !file || !jd}
              className="bg-gradient-to-br from-primary to-primary-container text-white px-10 py-5 rounded-lg font-bold text-lg shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              <span>Enter The Hot Seat / 开始深度面试</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="col-span-4 space-y-8">
          <div className="bg-surface-container p-8 rounded-xl border border-white">
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb className="text-primary-container w-5 h-5 fill-primary-container" />
              <span className="font-bold text-sm uppercase tracking-widest text-primary">专业建议 / PRO TIP</span>
            </div>
            <h4 className="text-lg font-bold mb-4 text-on-surface">如何获得最精准的反馈？</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant font-medium">
              <li className="flex gap-3">
                <span className="text-primary-container">•</span>
                <span>简历中不要隐藏任何“水分”，我们的算法会像资深 HR 一样嗅到它们。</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-container">•</span>
                <span>JD 越详细，模拟面试的针对性就越强。</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-container">•</span>
                <span>保持心态开放。我们的目标不是安慰你，而是让你变得更强。</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl overflow-hidden aspect-[3/4] shadow-2xl relative group">
            <img 
              src="https://picsum.photos/seed/office/600/800" 
              alt="Office" 
              className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
              <span className="text-white/60 text-[10px] font-bold tracking-[0.3em] mb-2 uppercase">氛围设定 / ATMOSPHERE</span>
              <p className="text-white text-lg font-medium leading-tight">像在真实的 27 层会议室里一样思考。</p>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Section */}
      <AnimatePresence>
        {showIntelligence && intelData && (
          <motion.div
            id="intelligence-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pt-12 border-t border-outline-variant/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-on-surface mb-2 flex items-center gap-4">
                  <ShieldCheck className="w-10 h-10 text-primary" />
                  深度情报中心 <span className="text-primary-container italic">Intelligence Center</span>
                </h2>
                <p className="text-on-surface-variant font-medium">基于 {company} 的实时市场数据与内部洞察分析。</p>
              </div>
              <button className="px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
                <Download className="w-5 h-5" />
                <span>导出完整报告</span>
              </button>
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* Industry Position */}
              <div className="col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(32,48,68,0.04)]">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2">INDUSTRY POSITION</p>
                    <h3 className="text-2xl font-bold text-on-surface">行业位置分析</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-6xl font-black text-primary-container/40">{intelData.marketStatus.rank}</span>
                    <p className="text-sm font-medium text-on-surface-variant">{intelData.marketStatus.sector}</p>
                  </div>
                </div>
                
                <div className="relative h-64 bg-surface-container-low rounded-lg overflow-hidden flex items-end gap-4 p-8">
                  <div className="flex-1 bg-surface-container-high rounded-t-lg h-[40%]"></div>
                  <div className="flex-1 bg-surface-container-high rounded-t-lg h-[65%]"></div>
                  <div className="flex-1 bg-primary-container rounded-t-lg h-[95%] relative shadow-lg shadow-primary-container/20">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container text-[10px] px-2 py-1 rounded font-bold">CURRENT</div>
                  </div>
                  <div className="flex-1 bg-surface-container-high rounded-t-lg h-[55%]"></div>
                  <div className="flex-1 bg-surface-container-high rounded-t-lg h-[30%]"></div>
                </div>

                <div className="mt-6 flex gap-8">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">市场占有/增长</p>
                    <p className="text-lg font-bold">{intelData.marketStatus.share} <span className="text-xs text-green-600">{intelData.marketStatus.trend}</span></p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">校招/人才口碑</p>
                    <p className="text-lg font-bold">{intelData.marketStatus.retention}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase">薪酬竞争力</p>
                    <p className="text-lg font-bold">{intelData.marketStatus.competitiveness}</p>
                  </div>
                </div>
              </div>

              {/* Recent Trends */}
              <div className="col-span-4 bg-surface-container-low p-8 rounded-xl h-full">
                <div className="mb-8">
                  <p className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2">RECENT TRENDS</p>
                  <h3 className="text-2xl font-bold text-on-surface">近期动态</h3>
                </div>
                <div className="space-y-8 relative">
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-outline-variant/30"></div>
                  {intelData.recentTrends.map((trend, i) => (
                    <div key={i} className="relative pl-10">
                      <div className={cn(
                        "absolute left-3 top-1.5 w-2.5 h-2.5 rounded-full",
                        trend.type === 'info' ? "bg-primary ring-4 ring-primary/20" :
                        trend.type === 'warning' ? "bg-red-500 ring-4 ring-red-500/20" :
                        "bg-green-500 ring-4 ring-green-500/20"
                      )}></div>
                      <p className="text-xs font-bold text-on-surface-variant mb-1">{trend.date}</p>
                      <p className="font-bold text-on-surface">{trend.title}</p>
                      <p className="text-sm text-on-surface-variant mt-1">{trend.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitors */}
              <div className="col-span-12">
                <h3 className="text-xl font-bold text-on-surface mb-6">核心竞对对比</h3>
                <div className="grid grid-cols-3 gap-6">
                  {intelData.competitors.map((comp, i) => (
                    <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xl font-bold text-on-surface">{comp.name[0]}</div>
                        <div>
                          <h4 className="font-bold text-on-surface">{comp.name}</h4>
                          <p className="text-xs text-on-surface-variant">{comp.desc}</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4 text-on-surface-variant">{comp.detail}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {comp.tags.map((tag, j) => (
                          <span key={j} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-on-surface-variant">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pitfall Guide */}
              <div className="col-span-12">
                <div className="bg-on-surface text-white rounded-2xl p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                    <img 
                      src="https://picsum.photos/seed/abstract/800/600" 
                      alt="Abstract" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="relative z-10 max-w-2xl">
                    <p className="text-primary-container font-bold tracking-widest text-xs mb-4 uppercase">CRITICAL INSIGHTS</p>
                    <h3 className="text-3xl font-bold mb-8 italic">面试避坑指南 (实习/校招专供)</h3>
                    <div className="space-y-6">
                      {intelData.pitfalls.map((item, i) => (
                        <div key={i} className="flex items-start gap-6 group">
                          <div className="w-12 h-12 rounded-full border border-primary-container/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                            {i === 0 ? <AlertTriangle className="w-6 h-6" /> : i === 1 ? <Brain className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                            <p className="text-slate-400 leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-24 pt-12 border-t border-slate-200 max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Quote className="w-10 h-10 text-primary-container opacity-30 fill-primary-container" />
        </div>
        <p className="text-2xl font-serif italic text-on-surface-variant leading-relaxed mb-6">
          “真正的进步始于你承认自己表现平平的那一刻。在这里被击碎自尊，总好过在现实中错失机会。”
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-8 bg-outline-variant/30"></div>
          <span className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">The Candid Curator</span>
          <div className="h-[1px] w-8 bg-outline-variant/30"></div>
        </div>
      </footer>
    </div>
  );
}
