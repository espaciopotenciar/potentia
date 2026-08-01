export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(.*?)\}\}/g) ?? [];
  const unique = new Set(matches.map((match) => match.replace(/\{\{|\}\}/g, "").trim()));
  return Array.from(unique);
}

export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_match, key: string) => {
    const value = values[key.trim()];
    return value && value.trim() ? value.trim() : `[${key.trim()}]`;
  });
}

export const VARIABLE_LABELS: Record<string, string> = {
  nombre: "Nombre",
  empresa: "Empresa",
  servicio: "Servicio",
  necesidad: "Necesidad",
  problema: "Problema",
  propuesta: "Propuesta",
  recurso: "Recurso a compartir",
  caso: "Caso o ejemplo",
  resultado: "Resultado logrado",
  próximo_paso: "Próximo paso propuesto",
  fecha: "Fecha",
  tercero: "Persona con quien lo va a hablar",
  canal: "Canal",
  contexto: "Contexto",
};
