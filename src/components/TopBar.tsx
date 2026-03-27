import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { Page } from '@/src/types';

interface TopBarProps {
  currentPage: Page;
}

export default function TopBar({ currentPage }: TopBarProps) {
  const pageLabels: Record<Page, string> = {
    'laboratory': '实验室',
    'intelligence': '情报中心',
    'task-log': '任务日志',
    'verdict': '面试裁决',
    'interview': '核心面试: 深度压测模式'
  };

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center gap-4">
        <span className="text-on-surface-variant font-medium text-sm">当前路径 /</span>
        <span className="text-on-surface font-bold text-sm">{pageLabels[currentPage]}</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <button className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-slate-200">
          <img 
            src="https://picsum.photos/seed/professional/100/100" 
            alt="User profile" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
