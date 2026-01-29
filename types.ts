
export enum Category {
  MONTH = "MON MOI",
  RESULTS = "MES RÉSULTATS",
  PRODUCT = "MON PRODUIT"
}

export interface IdeaItem {
  id: string;
  text: string;
  category: Category;
  status: 'pending' | 'syncing' | 'success' | 'error';
  error?: string;
}

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
}

export interface ProcessedResponse {
  refinedIdeas: string[];
}
