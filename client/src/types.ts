export interface QuestionConfig {
  min?: number;
  max?: number;
  min_label?: string;
  max_label?: string;
  options?: string[];
}

export interface Question {
  id?: number; 
  temp_id: string; 
  text: string;
  question_type: 'scale' | 'choice' | 'text';
  config: QuestionConfig;
  order: number;
}

export interface TestResult {
  id: number;
  test_id: number;
  test_title: string;
  created_at: string;
  interpretation: { [key: string]: any };
  recommendations: string;
  scores: { [key: string]: any };
}

export interface ApiUser {
  id: number;
  name: string;
}

export interface OverviewData {
  total_users: number;
  total_tests_passed: number;
  average_stress_level: number;
  level_distribution: {
    low: number;
    medium: number;
    high: number;
  };
}