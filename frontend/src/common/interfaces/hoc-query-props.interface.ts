export type UpdateType = 'pushIn' | 'push' | 'replaceIn' | 'replace';

export interface IHOCQueryProps<T> {
  query: T;
  setQuery: (changes: T, updateType?: UpdateType) => void;
}
