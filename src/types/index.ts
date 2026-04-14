export interface Resource {
  id: string;
  titre: string;
  description: string;
  categorie: string;
  tags: string[];
  type: 'pdf' | 'video' | 'link' | 'image';
  url: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  categorie: string;
  poids: number;
}

export interface QuizResponse {
  questionId: string;
  reponse: boolean;
}

export interface ScoreResult {
  score: number;
  date: string;
  categoriesFaibles: string[];
}
