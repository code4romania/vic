type UnionKeys<T> = T extends T ? keyof T : never;

type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never;

export type OneOf<T extends object[]> = {
  [K in keyof T]: Expand<
    T[K] & Partial<Record<Exclude<UnionKeys<T[number]>, keyof T[K]>, never>>
  >;
}[number];
