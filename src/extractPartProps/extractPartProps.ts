import type { PartsDefinition, PartsProps } from '../types';

/**
 * partsPropsから取得対象の識別子配下に当たるドット記法のパス指定のプロパティを、
 * partsPropsがネストした形式で統合して取得する
 * @param part 取得対象の識別子
 * @param partsProps
 * @returns
 */
export default function extractPartProps<T extends PartsDefinition>(
  part: keyof T,
  partsProps: PartsProps<T> | undefined,
): Partial<T[typeof part]> {
  if (!partsProps) {
    return {};
  }

  // 今回対象になるエントリーを取得する
  const dotPrefix = `${part as string}.`;
  const targetKeys = [
    ...Object.entries(partsProps)
      .filter(([key]) => key.startsWith(dotPrefix))
      .map(([key, value]) => [key, { ...(value as Record<string, unknown>) }]), // ← コピーを追加
    [part, { ...partsProps[part as string] }],
  ];

  // ドット記法由来のプロパティをpartsPropsを介したプロパティの構造に変換する
  const dotBase = targetKeys.reduce<Record<string, unknown>>(
    (result, [key, value]) => {
      const segments = key.split('.');
      const path = [segments[0] as string];
      let i = 1;
      while (segments[i] != null) {
        path.push('partsProps');
        path.push(segments[i]);
        i++;
      }

      // deepMerge で既存の値と再帰的にマージする
      return deepMerge(result, setIn({}, path, value));
    },
    {},
  );

  return dotBase[part as string] as Partial<T[typeof part]>;
}

const setIn = (
  obj: Record<string, unknown>,
  path: string[],
  value: unknown,
): Record<string, unknown> => {
  if (path.length === 0) {
    return obj;
  }
  const [head, ...tail] = path;
  if (tail.length === 0) {
    return { ...obj, [head]: value };
  }
  const child =
    obj[head] !== null && typeof obj[head] === 'object'
      ? (obj[head] as Record<string, unknown>)
      : {};
  return { ...obj, [head]: setIn(child, tail, value) };
};

const deepMerge = (
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> => {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overrideVal = override[key];
    if (
      typeof baseVal === 'object' &&
      baseVal !== null &&
      typeof overrideVal === 'object' &&
      overrideVal !== null &&
      !Array.isArray(baseVal) &&
      !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>,
      );
    } else {
      result[key] = overrideVal;
    }
  }
  return result;
};
