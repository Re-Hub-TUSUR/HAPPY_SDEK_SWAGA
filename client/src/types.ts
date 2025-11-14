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