/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Laboratory from './pages/Laboratory';
import TaskLog from './pages/TaskLog';
import Verdict from './pages/Verdict';
import Interview from './pages/Interview';
import { Page } from './types';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('laboratory');

  const renderPage = () => {
    switch (currentPage) {
      case 'laboratory':
        return <Laboratory onStartInterview={() => setCurrentPage('interview')} />;
      case 'task-log':
        return <TaskLog />;
      case 'verdict':
        return <Verdict />;
      case 'interview':
        return <Interview 
          onBack={() => setCurrentPage('laboratory')} 
          onFinish={() => setCurrentPage('verdict')} 
        />;
      default:
        return <Laboratory onStartInterview={() => setCurrentPage('interview')} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex overflow-hidden">
      {/* Sidebar is hidden during interview for focus */}
      {currentPage !== 'interview' && (
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      )}
      
      <main className={`flex-1 flex flex-col h-screen overflow-hidden ${currentPage !== 'interview' ? 'ml-64' : ''}`}>
        {currentPage !== 'interview' && <TopBar currentPage={currentPage} />}
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

