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
  interpretation: {
    overall_level?: 'Низкий' | 'Умеренный' | 'Высокий';
    [key: string]: any;
  };
  recommendations: string;
  scores: {
    overall?: number;
    [key: string]: any;
  };
}