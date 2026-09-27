/**
 * mergePartPropsで上書きに使用できる値
 * falsyな値は無視される
 */
export type PartPropsValue<P extends object> =
  | Partial<P>
  | null
  | undefined
  | false;
