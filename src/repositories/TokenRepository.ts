import { createClient, Entry } from 'contentful';
import { Token, TokenType } from '../Models/Token';
import { EntryFieldTypes, EntrySkeletonType } from 'contentful';

const spaceId = 'gqa9z44cxh9k';
const environmentId = 'master';
const accessToken = 'wacXzfF9nMPicl_V76AChe-ltYTl_9bqGLMvaPlOD0U';

// Internal skeletons
type TokenTypeSkeleton = EntrySkeletonType<{
  id: EntryFieldTypes.Text;
  name: EntryFieldTypes.Text;
  color: EntryFieldTypes.Text;
}, "tokenType">;

type TokenSkeleton = EntrySkeletonType<{
  id: EntryFieldTypes.Text;
  name: EntryFieldTypes.Text;
  description: EntryFieldTypes.Text;
  type: EntryFieldTypes.EntryLink<TokenTypeSkeleton>;
}, "token">;

// Helper to extract string from possibly localized field
function getString(field: any): string | undefined {
  if (typeof field === 'string') return field;
  if (field && typeof field === 'object') {
    const locales = Object.keys(field);
    if (locales.length > 0) return field[locales[0]];
  }
  return undefined;
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

  async getAllTokens(): Promise<Token[]> {
    const entries = await this.client.getEntries<TokenSkeleton>({
      content_type: 'token',
      include: 2,
    });

    return entries.items.map((item: Entry<TokenSkeleton>) => {
      const tokenTypeEntry = item.fields.type as Entry<TokenTypeSkeleton>;
      return {
        id: getString(item.fields.id)!,
        name: getString(item.fields.name)!,
        description: getString(item.fields.description),
        type: {
          id: getString(tokenTypeEntry.fields.id)!,
          name: getString(tokenTypeEntry.fields.name)!,
          color: getString(tokenTypeEntry.fields.color)!,
        },
      };
    });
  }

  async getTokenById(id: string): Promise<Token | undefined> {
    const entries = await this.client.getEntries<TokenSkeleton>({
      content_type: 'token',
      include: 2,
      'fields.id': id,
    });

    if (entries.items.length === 0) {
      return undefined;
    }

    const token = entries.items[0];
    const tokenTypeEntry = token.fields.type as Entry<TokenTypeSkeleton>;
    return {
      id: getString(token.fields.id)!,
      name: getString(token.fields.name)!,
      type: {
        id: getString(tokenTypeEntry.fields.id)!,
        name: getString(tokenTypeEntry.fields.name)!,
        color: getString(tokenTypeEntry.fields.color)!,
      },
    };
  }

  async getTokensByIds(ids: string[]): Promise<Token[]> {
    const entries = await this.client.getEntries<TokenSkeleton>({
      content_type: 'token',
      include: 2,
      'fields.id[in]': ids,
    });

    return entries.items.map((item: Entry<TokenSkeleton>) => {
      const tokenTypeEntry = item.fields.type as Entry<TokenTypeSkeleton>;
      return {
        id: getString(item.fields.id)!,
        name: getString(item.fields.name)!,
        type: {
          id: getString(tokenTypeEntry.fields.id)!,
          name: getString(tokenTypeEntry.fields.name)!,
          color: getString(tokenTypeEntry.fields.color)!,
        },
      };
    });
  }

  /**
   * Search for tokens by a query string.
   * This will search in the name, id, description, and type fields.
   */
  async searchTokens(query: string): Promise<Token[]> {
    const entries = await this.client.getEntries<TokenSkeleton>({
      content_type: 'token',
      limit: 1000,
      query,
      include: 2,
    });

    return entries.items.map((item: Entry<TokenSkeleton>) => {
      const tokenTypeEntry = item.fields.type as Entry<TokenTypeSkeleton>;
      return {
        id: getString(item.fields.id)!,
        name: getString(item.fields.name)!,
        description: getString(item.fields.description),
        type: {
          id: getString(tokenTypeEntry.fields.id)!,
          name: getString(tokenTypeEntry.fields.name)!,
          color: getString(tokenTypeEntry.fields.color)!,
        },
      };
    });
  }
}
