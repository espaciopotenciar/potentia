export interface ObjectionResponse {
  template: string;
  example: string;
}

export interface Objection {
  id: string;
  slug: string;
  title: string;
  category: string;
  commonPhrase: string;
  active: boolean;
  isOpenEnded?: boolean;
  whatItMayExpress: string[];
  whatNotToAssume: string[];
  questionsToExplore: string[];
  whatToAvoid: string[];
  nextGoal: string;
  empathetic: ObjectionResponse;
  neutral: ObjectionResponse;
  direct: ObjectionResponse;
  mistakeToAvoid: string;
  relatedLessonIds: string[];
  keywords: string[];
}
