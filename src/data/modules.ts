import type { LearningModule } from "@/types/lesson";

export const modules: LearningModule[] = [
  {
    id: "mentalidad",
    order: 1,
    title: "Mentalidad de la venta proactiva",
    description:
      "La base de todo: por qué liderar el proceso comercial es tu responsabilidad, no la del cliente.",
    icon: "compass",
  },
  {
    id: "proceso-comercial",
    order: 2,
    title: "El proceso comercial",
    description:
      "Cómo se estructura una oportunidad y por qué definir próximos pasos evita conversaciones abiertas.",
    icon: "route",
  },
  {
    id: "organizacion-comercial",
    order: 3,
    title: "Organización comercial",
    description:
      "Qué información mínima conviene registrar para tomar mejores decisiones, sin necesitar un CRM.",
    icon: "layout-grid",
  },
  {
    id: "sistema-4x4",
    order: 4,
    title: "Sistema de seguimiento 4x4",
    description:
      "La metodología central de Potentia: cuatro mensajes, cada cuatro días hábiles, cada uno con una función distinta.",
    icon: "repeat",
  },
  {
    id: "objeciones",
    order: 5,
    title: "Objeciones",
    description:
      "Cómo escuchar, preguntar y responder cuando el potencial cliente pone un freno.",
    icon: "message-circle-question",
  },
];
