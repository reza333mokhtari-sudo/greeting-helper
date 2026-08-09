import MiniSearch from 'minisearch';
import { DOCS_DATA } from '@/components/dungeon/docs/docsData';
import { type AssetRow } from '@/lib/cloud';

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

export function indexAssets(assets: AssetRow[]) {
  const documents: SearchResult[] = [
    ...DOCS_DATA.map(doc => ({
      id: `doc-${doc.id}`,
      type: 'doc' as const,
      title: doc.title,
      content: doc.content,
      metadata: { sectionId: doc.id }
    })),
    ...assets.map((asset) => ({
      id: `prop-${asset.id}`,
      type: 'prop' as const,
      title: asset.name,
      content: `${asset.kind} ${asset.tags?.join(' ') || ''}`,
      metadata: { assetId: asset.id, category: asset.kind, url: asset.url }
    }))
  ];

  miniSearch.removeAll();
  miniSearch.addAll(documents);
  isIndexed = true;
}

export function ensureIndexed() {
  if (isIndexed) return;
  // Default to just docs if no assets provided yet
  indexAssets([]);
}

export function searchApp(query: string) {
  ensureIndexed();
  return miniSearch.search(query);
}

export function getSuggestions(query: string) {
  ensureIndexed();
  return miniSearch.autoSuggest(query);
}
