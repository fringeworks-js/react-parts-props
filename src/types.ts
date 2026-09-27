/**
 * partsPropsの定義用の型
 * キーに識別子、値にプロパティの型を設定する
 */
export type PartsDefinition = Record<string, object>;

/**
 * partsPropsの型
 * 配下のコンポーネントがpartsPropsを持つ場合は、その中で更にpartsPropsを指定することでネストした構成にも対応できる
 */
export type PartsProps<T extends PartsDefinition = PartsDefinition> = {
  [K in keyof T]?: Partial<T[K]>;
};

/**
 * partsPropsを持ったプロパティ
 */
export type WithPartsProps<T extends PartsDefinition> = {
  partsProps?: PartsProps<T>;
};
