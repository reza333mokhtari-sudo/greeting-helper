import MiniSearch from 'minisearch';
import { DOCS_DATA } from '@/components/dungeon/docs/docsData';
import { ASSETS_REGISTRY } from './assets';

export interface SearchResult {
  id: string;
  type: 'doc' | 'prop' | 'texture';
  title: string;
  content: string;
  metadata?: any;
}

const miniSearch = new MiniSearch({
  fields: ['title', 'content'], // fields to index for full-text search
  storeFields: ['type', 'title', 'content', 'metadata'], // fields to return with search results
  searchOptions: {
    boost: { title: 2 },
    fuzzy: 0.2,
    prefix: true
  }
});

let isIndexed = false;

export function ensureIndexed() {
  if (isIndexed) return;

  const documents: SearchResult[] = [
    ...DOCS_DATA.map(doc => ({
      id: `doc-${doc.id}`,
      type: 'doc' as const,
      title: doc.title,
      content: doc.content,
      metadata: { sectionId: doc.id }
    })),
    ...Object.entries(ASSETS_REGISTRY).map(([id, asset]) => ({
      id: `prop-${id}`,
      type: 'prop' as const,
      title: asset.name,
      content: `${asset.category} ${asset.tags?.join(' ') || ''}`,
      metadata: { assetId: id, category: asset.category, url: asset.url }
    }))
  ];

  miniSearch.addAll(documents);
  isIndexed = true;
}

export function searchApp(query: string) {
  ensureIndexed();
  return miniSearch.search(query);
}

export function getSuggestions(query: string) {
  ensureIndexed();
  return miniSearch.autoSuggest(query);
}
