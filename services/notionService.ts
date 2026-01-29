
import { NotionConfig, Category } from "../types";

/**
 * Sends a single idea to Notion.
 * NOTE: Notion's API does not support browser-side CORS requests natively.
 * We use corsproxy.io which properly forwards headers.
 */
export const addToNotion = async (
  config: NotionConfig,
  title: string,
  category: Category
): Promise<void> => {
  // Using custom Cloudflare Worker as CORS proxy
  const proxyUrl = 'https://winter-credit-2a39.diatra-yt.workers.dev/v1/pages';

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: config.databaseId },
        properties: {
          "Nom": {
            "title": [
              {
                "text": {
                  "content": title
                }
              }
            ]
          },
          "Tags": {
            "multi_select": [
              {
                "name": category
              }
            ]
          }
        }
      })
    });

    if (!response.ok) {
      let errorMessage = `Notion API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response wasn't JSON
      }
      throw new Error(errorMessage);
    }
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error("NetworkError: The CORS proxy might be blocked or unavailable. Please check your internet connection or try again later.");
    }
    throw err;
  }
};
