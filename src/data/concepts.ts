export interface Concept {
  id: string;
  title: string;
  snippet: string;
  keywords: string[];
  lessonSlug: string;
}

/**
 * Conceptos y recomendaciones destacadas para el buscador general.
 * Apuntan a lecciones existentes en lessons.ts.
 */
export const concepts: Concept[] = [
  {
    id: "concept-4x4",
    title: "Sistema 4x4",
    snippet: "Cuatro mensajes de seguimiento, cada cuatro días hábiles, cuando ya existió una conversación previa.",
    keywords: ["4x4", "seguimiento", "cadencia"],
    lessonSlug: "que-es-el-sistema-4x4",
  },
  {
    id: "concept-m1",
    title: "Mensaje 1: retomar",
    snippet: "El primer mensaje del ciclo retoma algo real de la conversación y propone continuidad.",
    keywords: ["mensaje 1", "retomar"],
    lessonSlug: "mensaje-1-retomar-desde-lo-real",
  },
  {
    id: "concept-m2",
    title: "Mensaje 2: tangible",
    snippet: "El segundo mensaje incorpora un recurso concreto para reducir la fricción de decidir.",
    keywords: ["mensaje 2", "tangible", "recurso"],
    lessonSlug: "mensaje-2-aportar-algo-tangible",
  },
  {
    id: "concept-m3",
    title: "Mensaje 3: validación",
    snippet: "El tercer mensaje usa un caso, testimonio o resultado relacionado con la necesidad del cliente.",
    keywords: ["mensaje 3", "validacion", "caso", "testimonio"],
    lessonSlug: "mensaje-3-construir-validacion",
  },
  {
    id: "concept-m4",
    title: "Mensaje 4: cierre",
    snippet: "El cuarto mensaje cierra el hilo con firmeza amable y deja la puerta abierta.",
    keywords: ["mensaje 4", "cierre", "firmeza amable"],
    lessonSlug: "mensaje-4-cerrar-con-firmeza-amable",
  },
  {
    id: "concept-nurturing",
    title: "Nurturing",
    snippet: "Mantener el vínculo con contenido de valor esporádico, sin seguimiento frecuente.",
    keywords: ["nurturing", "vinculo largo plazo"],
    lessonSlug: "que-es-nurturing",
  },
  {
    id: "concept-crm",
    title: "Por qué Potentia no es un CRM",
    snippet: "Un CRM registra contactos y oportunidades; Potentia ayuda a decidir la próxima acción.",
    keywords: ["crm", "organizacion", "gestion"],
    lessonSlug: "para-que-sirve-un-crm",
  },
  {
    id: "concept-proximo-paso",
    title: "Definir el próximo paso",
    snippet: "Terminar una conversación sin un próximo paso concreto suele estancar la oportunidad.",
    keywords: ["proximo paso", "reunion", "avance"],
    lessonSlug: "definir-proximos-pasos",
  },
  {
    id: "concept-errores",
    title: "Errores frecuentes del seguimiento",
    snippet: "Enviar siempre '¿pudiste verlo?' o insistir después del cuarto contacto sin respuesta.",
    keywords: ["errores", "no responde", "insistir"],
    lessonSlug: "errores-frecuentes-del-seguimiento",
  },
];
