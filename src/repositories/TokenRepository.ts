import { createClient, Entry } from 'contentful';
import { FieldAppSDK } from '@contentful/app-sdk';

const spaceId = 'gqa9z44cxh9k';
const environmentId = 'master';
const accessToken = 'wacXzfF9nMPicl_V76AChe-ltYTl_9bqGLMvaPlOD0U';

export interface TokenEntry {
  id: string;
  name: string;
  description?: string;
  type: string;
}

export class TokenRepository {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({
      space: spaceId,
      environment: environmentId,
      accessToken: accessToken,
    });
  }

  async getAllTokens(): Promise<TokenEntry[]> {
    const entries = await this.client.getEntries({
      content_type: 'token',
      limit: 1000,
    });

    return entries.items.map((item: Entry<any>) => ({
      id: item.fields.id as string,
      name: item.fields.name as string,
      description: item.fields.description as string | undefined,
      type: item.fields.type as string,
    }));
  }

  /**
   * Search for tokens by a query string.
   * This will search in the name, id, description, and type fields.
   */
  async searchTokens(query: string): Promise<TokenEntry[]> {
    const entries = await this.client.getEntries({
      content_type: 'token',
      limit: 1000,
      query, // This will search all full-text fields
    });

    return entries.items.map((item: Entry<any>) => ({
      id: item.fields.id as string,
      name: item.fields.name as string,
      description: item.fields.description as string | undefined,
      type: item.fields.type as string,
    }));
  }
}
