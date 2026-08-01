export type SearchResultGroup = "aprender" | "objeciones" | "conceptos";

export interface SearchResultItem {
  id: string;
  group: SearchResultGroup;
  title: string;
  snippet: string;
  href: string;
}
