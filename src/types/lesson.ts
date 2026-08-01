import type { IconName } from "@/components/icons";

export type ModuleId =
  | "mentalidad"
  | "proceso-comercial"
  | "organizacion-comercial"
  | "sistema-4x4"
  | "objeciones";

export interface LearningModule {
  id: ModuleId;
  order: number;
  title: string;
  description: string;
  icon: IconName;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  moduleId: ModuleId;
  order: number;
  estimatedMinutes: number;
  content: string[];
  keywords: string[];
  relatedLessonIds: string[];
  active: boolean;
}
