/**
 * partsPropsの定義用の型
 * キーに識別子、値にプロパティの型を設定する
 */
export type PartsDefinition = Record<string, object>;

/**
 * partsPropsを持ったプロパティ
 */
export type WithPartsProps<T extends PartsDefinition> = {
  partsProps?: PartsProps<T>;
};

/**
 * 長さNのタプルを構築する為の型
 */
type BuildTuple<
  N extends number,
  T extends unknown[] = [],
> = T['length'] extends N ? T : BuildTuple<N, [...T, unknown]>;

/**
 * タプルの先頭を除いた長さ（= N - 1）を取得する為の型
 */
type Prev<N extends number> =
  BuildTuple<N> extends [unknown, ...infer Rest] ? Rest['length'] : never;

/**
 * partsPropsの階層を追ってドット区切りの識別子のパスを作る為の型
 */
type DotKeys<
  TKey extends string,
  TProps extends object,
  TDepth extends number = 4,
> = [TDepth] extends [never]
  ? TKey
  : TProps extends WithPartsProps<infer TSlots>
    ?
        | TKey
        | {
            [K in string & keyof TSlots]: DotKeys<
              `${TKey}.${K}`,
              TSlots[K] & object,
              Prev<TDepth> // Depth[TDepth] から置き換え
            >;
          }[string & keyof TSlots]
    : TKey;

/**
 * partsPropsの識別子部分を取得できる型
 */
type PartsPropsKeys<T extends PartsDefinition, TDepth extends number = 4> = {
  [K in string & keyof T]: DotKeys<K, T[K] & object, TDepth>;
}[string & keyof T];

/**
 * partsProps配下に定義された型を解決する為の型
 */
type ResolveProps<
  TPath extends string,
  TSlots extends PartsDefinition,
  TDepth extends number = 4,
> = [TDepth] extends [never]
  ? never
  : TPath extends `${infer THead}.${infer TTail}`
    ? THead extends keyof TSlots
      ? TSlots[THead] extends WithPartsProps<infer TChildSlots>
        ? ResolveProps<TTail, TChildSlots, Prev<TDepth>>
        : never
      : never
    : TPath extends keyof TSlots
      ? TSlots[TPath]
      : never;

/**
 * partsPropsの型
 * 配下のコンポーネントへ渡す値はドット記法のパスで直接指定可能
 */
export type PartsProps<T extends PartsDefinition, TDepth extends number = 4> = {
  [K in PartsPropsKeys<T>]?: Partial<ResolveProps<K, T, TDepth>>;
};
