import extractPartProps from '../extractPartProps';
import type { PartsDefinition, PartsProps } from '../types';

export default function resolvePartsProps<T extends PartsDefinition>(
  partsProps: PartsProps<T> | undefined,
): { [K in keyof T]?: Partial<T[K]> } {
  if (!partsProps) {
    return {} as { [K in keyof T]?: Partial<T[K]> };
  }

  const rootParts = Array.from(
    new Set(Object.keys(partsProps).map((part) => part.split('.')[0])),
  );

  return rootParts.reduce<{ [K in keyof T]?: Partial<T[K]> }>(
    (result, rootPart) => {
      result[rootPart as keyof T] = extractPartProps(
        rootPart as keyof T,
        partsProps,
      );
      return result;
    },
    {},
  );
}
