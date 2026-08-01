export type SaleType = "persona" | "empresa";

export type OpportunityStage =
  | "agendar_reunion"
  | "primera_conversacion_sin_proximo_paso"
  | "reuniones_falta_avanzar"
  | "pendiente_coordinar_reunion"
  | "enviar_propuesta"
  | "comparti_precio"
  | "propuesta_sin_respuesta"
  | "evaluando_propuesta"
  | "confirmo_si_no_avanza"
  | "hablarlo_con_tercero"
  | "conversemos_mas_adelante"
  | "otra_situacion";

export type UnansweredMessages = 0 | 1 | 2 | 3 | 4;

export type Channel =
  | "whatsapp"
  | "email"
  | "linkedin"
  | "instagram"
  | "otro_escrito"
  | "verbal";

export type RecommendedStage =
  | "no_aplica_4x4"
  | "preparar_contacto"
  | "m1_retomar"
  | "m2_tangible"
  | "m3_validacion"
  | "m4_cierre"
  | "nurturing"
  | "respetar_fecha"
  | "preparar_reunion"
  | "preparar_propuesta"
  | "facilitar_compromiso"
  | "facilitar_tercero"
  | "sin_coincidencia";

export interface ActionAnswers {
  hasPreviousConversation: boolean | null;
  saleType: SaleType | null;
  opportunityStage: OpportunityStage | null;
  unansweredMessages: UnansweredMessages | null;
  channel: Channel | null;
  hasAgreedDate: boolean | null;
}

export interface MessageVariant {
  template: string;
  example: string;
  requiredVariables: string[];
}

export interface ActionMatrixEntry {
  id: string;
  hasPreviousConversation: boolean;
  saleType: SaleType | "cualquiera";
  opportunityStage: OpportunityStage | "cualquiera";
  unansweredMessages: UnansweredMessages | "cualquiera";
  channel: Channel | "cualquiera";
  hasAgreedDate: boolean | "cualquiera";
  applies4x4: boolean;
  recommendedStage: RecommendedStage;
  stageName: string;
  interpretation: string;
  objective: string;
  suggestedAction: string;
  advice: string;
  mistakeToAvoid: string;
  empathetic: MessageVariant;
  neutral: MessageVariant;
  direct: MessageVariant;
  relatedLessonIds: string[];
  active: boolean;
}

export interface ActionResultData {
  entry: ActionMatrixEntry;
  matchedExactly: boolean;
}
