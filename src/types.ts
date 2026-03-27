export type Page = 'laboratory' | 'intelligence' | 'task-log' | 'verdict' | 'interview';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface InterviewResult {
  offerProbability: number;
  reason: string;
  scores: {
    matching: number;
    expression: number;
    authenticity: number;
    industry: number;
  };
  conclusion: 'PASS' | 'REJECT';
  fatalProblems: string[];
  optimizationPath: string[];
}

export interface Application {
  id: string;
  company: string;
  role: string;
  date: string;
  status: 'interviewing' | 'offered' | 'rejected';
  result?: InterviewResult;
  chatHistory?: Message[];
}
