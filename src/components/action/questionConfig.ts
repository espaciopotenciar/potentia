import type { Channel, OpportunityStage, SaleType, UnansweredMessages } from "@/types/action";

export const opportunityStageOptions: { value: OpportunityStage; label: string }[] = [
  { value: "agendar_reunion", label: "Estoy buscando agendar una llamada, turno o reunión" },
  { value: "primera_conversacion_sin_proximo_paso", label: "Tuvimos una primera conversación y falta definir el próximo paso" },
  { value: "reuniones_falta_avanzar", label: "Tuvimos una o más reuniones y falta avanzar" },
  { value: "pendiente_coordinar_reunion", label: "Quedó pendiente coordinar una reunión" },
  { value: "enviar_propuesta", label: "Tengo que enviar o presentar una propuesta" },
  { value: "comparti_precio", label: "Ya compartí mi precio o una cotización" },
  { value: "propuesta_sin_respuesta", label: "Envié la propuesta o cotización y no respondió" },
  { value: "evaluando_propuesta", label: "Está evaluando la propuesta" },
  { value: "confirmo_si_no_avanza", label: "Me confirmó que sí, pero el avance no se concreta" },
  { value: "hablarlo_con_tercero", label: "Tiene que hablarlo con otra persona y no me da una respuesta" },
  { value: "conversemos_mas_adelante", label: "Me dijo que lo conversemos más adelante" },
  { value: "otra_situacion", label: "Otra situación que no aparece en la lista" },
];

export const unansweredMessagesOptions: { value: UnansweredMessages; label: string }[] = [
  { value: 0, label: "Ninguno" },
  { value: 1, label: "Uno" },
  { value: 2, label: "Dos" },
  { value: 3, label: "Tres" },
  { value: 4, label: "Cuatro o más" },
];

export const channelOptions: { value: Channel; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Correo electrónico" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "otro_escrito", label: "Otro canal escrito" },
  { value: "verbal", label: "Llamada o conversación verbal" },
];

export const saleTypeOptions: { value: SaleType; label: string }[] = [
  { value: "persona", label: "A una persona" },
  { value: "empresa", label: "A una empresa" },
];
