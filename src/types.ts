export type OptimizationGoal = 'seo' | 'readability' | 'engagement' | 'professional' | 'concise';

export interface OptimizationSettings {
  goal: OptimizationGoal;
  targetAudience: string;
  keywords: string;
  tone: string;
}

export interface OptimizedContent {
  original: string;
  optimized: string;
  explanation: string;
  metrics: {
    originalWordCount: number;
    optimizedWordCount: number;
    readabilityScore: string;
    improvements: string[];
  };
}
