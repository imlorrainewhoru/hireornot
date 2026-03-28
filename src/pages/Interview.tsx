import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Paperclip, ShieldAlert, Activity, BrainCircuit, User, Bot, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, FileText, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { InterviewResult, Application, Message } from '../types';

// Define interview stages
type InterviewStage = 'OPENING' | 'PROJECT_DEEP_DIVE' | 'JD_MATCHING' | 'STRESS_TEST' | 'REVERSE_INTERVIEW' | 'FINAL_REPORT';

const STAGE_LABELS: Record<InterviewStage, string> = {
  OPENING: '阶段1：开场介绍',
  PROJECT_DEEP_DIVE: '阶段2：项目深挖',
  JD_MATCHING: '阶段3：岗位匹配',
  STRESS_TEST: '阶段4：压力测试',
  REVERSE_INTERVIEW: '阶段5：反向面试',
  FINAL_REPORT: '面试评估报告'
};

interface InterviewProps {
  onBack: () => void;
  onFinish: () => void;
}

export default function Interview({ onBack, onFinish }: InterviewProps) {
  const [stage, setStage] = useState<InterviewStage>('OPENING');
  const [turnCount, setTurnCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好。我是你的 AI 质询官。面试现在开始。\n\n第一轮：请先进行自我介绍，并简要说明你认为最重要的一个项目。不要进入细节，不要评价。',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState({
    stress: 20,
    authenticity: 100,
    risks: 0
  });

  // Load ongoing interview on mount
  useEffect(() => {
    const saved = localStorage.getItem('ongoing_interview');
    if (saved) {
      try {
        const { messages: sMsg, stage: sStage, turnCount: sTurn, metrics: sMetrics } = JSON.parse(saved);
        if (sMsg && sMsg.length > 0) {
          setMessages(sMsg);
          setStage(sStage);
          setTurnCount(sTurn);
          setMetrics(sMetrics);
        }
      } catch (e) {
        console.error("Failed to load ongoing interview", e);
      }
    }
  }, []);

  // Save ongoing interview on state changes
  useEffect(() => {
    // Only save if it's not the initial state or if it's been loaded
    if (messages.length > 1 || stage !== 'OPENING') {
      localStorage.setItem('ongoing_interview', JSON.stringify({
        messages,
        stage,
        turnCount,
        metrics
      }));
    }
  }, [messages, stage, turnCount, metrics]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Logic to determine stage transitions
    let nextStage = stage;
    let nextTurnCount = turnCount + 1;

    // Stage transition logic based on user requirements
    if (stage === 'OPENING') {
      nextStage = 'PROJECT_DEEP_DIVE';
      nextTurnCount = 0;
    } else if (stage === 'PROJECT_DEEP_DIVE' && nextTurnCount >= 3) {
      nextStage = 'JD_MATCHING';
      nextTurnCount = 0;
    } else if (stage === 'JD_MATCHING' && nextTurnCount >= 2) {
      nextStage = 'STRESS_TEST';
      nextTurnCount = 0;
    } else if (stage === 'STRESS_TEST' && nextTurnCount >= 2) {
      nextStage = 'REVERSE_INTERVIEW';
      nextTurnCount = 0;
    } else if (stage === 'REVERSE_INTERVIEW' && nextTurnCount >= 1) {
      nextStage = 'FINAL_REPORT';
      nextTurnCount = 0;
    }

    setStage(nextStage);
    setTurnCount(nextTurnCount);

    // Dynamic metrics update
    setMetrics(prev => ({
      stress: Math.min(100, prev.stress + (stage === 'STRESS_TEST' ? 15 : 8)),
      authenticity: Math.max(0, prev.authenticity - (input.length < 20 ? 5 : 1)),
      risks: prev.stress > 75 ? prev.risks + 1 : prev.risks
    }));

    try {
      const systemInstruction = `你是一名极其严格、结果导向的面试官，目标不是帮助候选人感觉良好，而是判断他是否能通过面试。
你的行为必须遵循以下原则：
【核心目标】
- 判断候选人是否能通过该岗位面试
- 找出所有能力缺口、逻辑漏洞、夸大或不真实之处
- 给出明确的淘汰或通过倾向
【提问方式】
- 每一轮必须基于候选人回答进行“追问”，不能停留在表面
- 如果回答模糊，必须拆解并继续追问（例如：“你说负责，请具体说明你做了什么”）
- 如果出现数据或成果，必须追问来源、方法和个人贡献
- 不允许泛泛而谈或给提示性引导
【漏洞攻击】
- 主动识别以下问题并放大：
  - 模糊描述（参与、负责等）
  - 不合理成果（短期高增长等）
  - 无法验证的数据
- 对每一个可疑点至少追问2轮以上
【行业与公司理解】
- 自动结合候选人输入的公司与岗位（如果有上下文）：
  - 行业现状、公司发展阶段、该岗位真实需求
- 所有问题必须贴合该公司和岗位，而不是通用面试题
【反向面试】
- 在面试结束前，引导候选人提出问题，并评价其问题是否有深度
【评分与结论】
- 面试结束后必须输出结构化报告
【语气要求】
- 冷静、直接、不安抚，不使用鼓励性语言，不模糊判断。`;

      const stagePrompts: Record<InterviewStage, string> = {
        OPENING: "阶段1：开场。让候选人做自我介绍并说明最重要的项目。不要进入细节。",
        PROJECT_DEEP_DIVE: "阶段2：项目深挖。基于候选人提到的项目进行深度追问。必须覆盖：具体做了什么（本人贡献）、数据来源、决策逻辑。如果回答模糊，必须拆解并继续追问。禁止进入下一个问题，直到信息被榨干。",
        JD_MATCHING: "阶段3：岗位匹配。结合目标岗位JD，重点考核候选人对该岗位所需的核心知识和技能的掌握程度。提出至少2个与岗位要求直接相关的技术或能力问题，并深入追问细节。必须停止对阶段2项目的深挖，转向对岗位能力的硬核考核。",
        STRESS_TEST: "阶段4：压力测试。提出一个质疑候选人能力的假设（例如：你这个项目其实很简单），观察其反应，继续追问直到其逻辑自洽或崩溃。目标是判断抗压能力和真实性。",
        REVERSE_INTERVIEW: "阶段5：反向面试。要求候选人向你提问（关于公司/岗位）。评价这些问题是否有深度，指出问题的不足。",
        FINAL_REPORT: `面试结束。请输出最终评估报告。
        必须严格遵守以下 JSON 格式：
        {
          "offerProbability": number (0-100),
          "reason": "说明原因",
          "scores": {
            "matching": number (0-100),
            "expression": number (0-100),
            "authenticity": number (0-100),
            "industry": number (0-100)
          },
          "conclusion": "PASS" | "REJECT",
          "fatalProblems": ["问题1", "问题2", "问题3"],
          "optimizationPath": ["路径1", "路径2"]
        }
        除了 JSON 之外不要输出任何其他文字。`
      };

      const isFinalReport = nextStage === 'FINAL_REPORT';
      
      const currentCompany = localStorage.getItem('current_company') || '未知公司';
      const currentRole = localStorage.getItem('current_role') || '未知职位';
      const currentJD = localStorage.getItem('current_jd') || '未提供JD';

      const apiResponse = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-3-flash-preview",
          contents: [
            ...messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
            { role: 'user', parts: [{ text: `
              [目标岗位上下文]
              公司：${currentCompany}
              职位：${currentRole}
              JD：${currentJD}

              [当前面试阶段：${STAGE_LABELS[nextStage]}]
              [阶段指令：${stagePrompts[nextStage]}]
              候选人最新回答："${input}"
              
              ${isFinalReport ? "请直接输出 JSON 报告。" : "请根据指令进行质询。保持冷酷专业的语气。"}
            ` }] }
          ],
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: isFinalReport ? "application/json" : "text/plain"
          }
        })
      });

      if (!apiResponse.ok) {
        throw new Error('API request failed');
      }

      const response = await apiResponse.json();
      const aiContent = response.text || '由于系统波动，我暂时无法给出评价。请继续。';
      
      if (isFinalReport) {
        try {
          const result: InterviewResult = JSON.parse(aiContent);
          
          const aiMessage: Message = {
            role: 'assistant',
            content: `【面试评估报告】\n\n` +
              `Offer 概率：${result.offerProbability}%\n` +
              `原因：${result.reason}\n\n` +
              `【评分】\n` +
              `岗位匹配度：${result.scores.matching}\n` +
              `表达能力：${result.scores.expression}\n` +
              `项目真实性：${result.scores.authenticity}\n` +
              `行业理解：${result.scores.industry}\n\n` +
              `【结论】：${result.conclusion === 'PASS' ? '倾向通过' : '倾向淘汰'}\n\n` +
              `【3个最致命问题】：\n${result.fatalProblems.map((p, i) => `${i+1}. ${p}`).join('\n')}\n\n` +
              `【优化路径】：\n${result.optimizationPath.map((p, i) => `${i+1}. ${p}`).join('\n')}`,
            timestamp: new Date().toISOString()
          };

          // Save to localStorage
          const newApp: Application = {
            id: Date.now().toString(),
            company: localStorage.getItem('current_company') || '未知公司',
            role: localStorage.getItem('current_role') || '未知职位',
            date: new Date().toISOString().split('T')[0],
            status: result.conclusion === 'PASS' ? 'offered' : 'rejected',
            result: result,
            chatHistory: [...messages, userMessage, aiMessage]
          };
          
          const existingLogs = JSON.parse(localStorage.getItem('interview_logs') || '[]');
          localStorage.setItem('interview_logs', JSON.stringify([newApp, ...existingLogs]));
          
          // Clear ongoing interview after completion
          localStorage.removeItem('ongoing_interview');
          
          setMessages(prev => [...prev, aiMessage]);
        } catch (e) {
          console.error("Failed to parse final report JSON", e);
          const aiMessage: Message = {
            role: 'assistant',
            content: aiContent,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        const aiMessage: Message = {
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `【系统错误】：${error.message || '无法连接到 AI 质询官。请检查网络或 API 配置。'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Stage Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 z-20">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ 
              width: stage === 'OPENING' ? "10%" : 
                     stage === 'PROJECT_DEEP_DIVE' ? "30%" : 
                     stage === 'JD_MATCHING' ? "50%" : 
                     stage === 'STRESS_TEST' ? "70%" : 
                     stage === 'REVERSE_INTERVIEW' ? "90%" : "100%" 
            }}
          />
        </div>

        <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-1.5 bg-white/80 backdrop-blur rounded-full shadow-sm border border-slate-100 flex items-center gap-4">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
              {STAGE_LABELS[stage]}
            </span>
            <button 
              onClick={() => {
                if (window.confirm('确定要重置当前面试吗？所有进度将丢失。')) {
                  localStorage.removeItem('ongoing_interview');
                  window.location.reload();
                }
              }}
              className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest border-l border-slate-200 pl-4"
            >
              重置 / RESET
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 pt-16 space-y-8 hide-scrollbar"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-3xl",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  msg.role === 'assistant' ? "bg-on-surface text-white" : "bg-primary-container text-on-primary-container"
                )}>
                  {msg.role === 'assistant' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl shadow-sm leading-relaxed",
                  msg.role === 'assistant' 
                    ? "bg-white text-on-surface rounded-tl-none border border-slate-100" 
                    : "bg-primary-container text-on-primary-container rounded-tr-none font-medium"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[10px] opacity-40 mt-2 block">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex gap-4 mr-auto max-w-3xl">
              <div className="w-10 h-10 rounded-full bg-on-surface text-white flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
              <button className="p-2 hover:text-primary-container transition-colors"><Paperclip className="w-5 h-5" /></button>
              <button className="p-2 hover:text-primary-container transition-colors"><Mic className="w-5 h-5" /></button>
            </div>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={stage === 'FINAL_REPORT' ? "面试已结束" : "输入你的回答，接受质询..."}
              disabled={stage === 'FINAL_REPORT' || isTyping}
              className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-primary-container/20 pl-24 pr-16 py-5 rounded-2xl text-on-surface font-medium placeholder:text-slate-400 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping || stage === 'FINAL_REPORT'}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-orange-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
            {stage === 'FINAL_REPORT' ? "面试评估已完成" : "AI 正在实时分析你的语义、语调与逻辑一致性"}
          </p>
          {stage === 'FINAL_REPORT' && (
            <div className="flex justify-center mt-4">
              <button 
                onClick={onFinish}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                查看面试裁决 <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Monitoring Sidebar */}
      <div className="w-80 bg-white border-l border-slate-100 p-8 flex flex-col gap-8">
        <div>
          <h3 className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 实时监控 / MONITORING
          </h3>
          
          <div className="space-y-8">
            {/* Stage Info */}
            <div className="p-4 bg-on-surface rounded-xl text-white shadow-xl">
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <ClipboardList className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Current Stage</span>
              </div>
              <div className="text-sm font-black">{STAGE_LABELS[stage]}</div>
              <div className="mt-4 flex gap-1">
                {Object.keys(STAGE_LABELS).map((s, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-500",
                      i <= Object.keys(STAGE_LABELS).indexOf(stage) ? "bg-primary" : "bg-white/10"
                    )} 
                  />
                ))}
              </div>
            </div>

            {/* Stress Level */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-on-surface">压力指数 (Stress)</span>
                <span className={cn(
                  "text-lg font-black",
                  metrics.stress > 70 ? "text-error" : "text-primary-container"
                )}>{metrics.stress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.stress}%` }}
                  className={cn(
                    "h-full transition-colors duration-500",
                    metrics.stress > 70 ? "bg-error" : "bg-primary-container"
                  )}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant font-medium">
                {metrics.stress > 70 ? "警告：候选人情绪波动剧烈，逻辑可能出现漏洞。" : "当前状态：冷静。正在寻找突破口。"}
              </p>
            </div>

            {/* Authenticity */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-on-surface">真实性 (Authenticity)</span>
                <span className="text-lg font-black text-green-600">{metrics.authenticity}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.authenticity}%` }}
                  className="h-full bg-green-500"
                />
              </div>
              <p className="text-[10px] text-on-surface-variant font-medium">
                语义一致性评估中。未发现明显的简历造假痕迹。
              </p>
            </div>

            {/* Risks */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-error" />
                <span className="text-sm font-bold text-on-surface">风险标记 (Risks)</span>
              </div>
              {metrics.risks === 0 ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-bold text-green-700">暂无明显风险点</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-error" />
                    <span className="text-xs font-bold text-error">逻辑自洽性存疑 (x{metrics.risks})</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <span className="font-bold text-xs uppercase tracking-widest text-on-surface">AI 洞察 / INSIGHTS</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            {stage === 'OPENING' && "正在评估候选人的沟通效率与核心卖点。"}
            {stage === 'PROJECT_DEEP_DIVE' && "重点攻击：项目中的模糊描述。正在榨取底层技术细节。"}
            {stage === 'JD_MATCHING' && "能力质疑：候选人经验与岗位需求存在断层。"}
            {stage === 'STRESS_TEST' && "压测中：观察候选人在否定性假设下的情绪控制力。"}
            {stage === 'REVERSE_INTERVIEW' && "反向评估：通过提问深度判断候选人的职场成熟度。"}
            {stage === 'FINAL_REPORT' && "评估完成。正在生成最终裁决报告。"}
          </p>
        </div>
      </div>
    </div>
  );
}
