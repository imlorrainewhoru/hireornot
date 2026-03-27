import React from 'react';
import { 
  Beaker, 
  Zap, 
  ClipboardList, 
  Gavel, 
  Plus, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Page } from '@/src/types';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const navItems = [
    { id: 'laboratory', label: '实验室', icon: Beaker },
    { id: 'task-log', label: '任务日志', icon: ClipboardList },
    { id: 'verdict', label: '面试裁决', icon: Gavel },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-white flex flex-col p-6 border-r border-slate-100 shadow-[10px_0_30px_rgba(32,48,68,0.04)]">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">HireOrNot</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-container mb-1 leading-tight">
          Get rejected here, not in real life.
        </p>
        <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
          在这里被拒绝，总比在现实中好。
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id as Page)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:translate-x-1 text-sm font-medium",
              currentPage === item.id 
                ? "text-primary-container border-r-4 border-primary-container bg-orange-50/50 font-semibold" 
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-slate-100">
        <button 
          onClick={() => onPageChange('laboratory')}
          className="w-full bg-primary-container text-on-primary-container font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-4 hover:opacity-90 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>新分析</span>
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface text-xs transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span>帮助中心</span>
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface text-xs transition-colors">
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
