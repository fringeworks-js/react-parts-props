import { createRef, type ComponentProps } from 'react';
import { describe, expectTypeOf, it } from 'vitest';
import type { PartsProps, WithPartsProps } from '../types';
import mergePartProps from './mergePartProps';

type IconProps = WithPartsProps<{
  root: ComponentProps<'span'>;
  img: ComponentProps<'img'>;
}> & {
  src: string;
};

type ButtonPartsProps = PartsProps<{
  root: ComponentProps<'span'>;
  icon: IconProps;
}>;

declare const partsProps: ButtonPartsProps | undefined;

describe('mergePartProps', () => {
  it('パーツの型を overrides から推論する', () => {
    const result = mergePartProps({ className: 'a' }, partsProps?.root);
    expectTypeOf(result).toEqualTypeOf<ComponentProps<'span'>>();
  });

  it('必須のプロパティを持つパーツも overrides から推論する', () => {
    const result = mergePartProps({ src: 'a.svg' }, partsProps?.icon);
    expectTypeOf(result).toEqualTypeOf<IconProps>();
  });

  it('base の値の型が overrides より狭くても受け付ける', () => {
    mergePartProps(
      {
        ref: createRef<HTMLSpanElement>(),
        style: { color: 'red' },
        onClick: () => {},
      },
      partsProps?.root,
    );
  });

  it('base に data-* を指定できる', () => {
    mergePartProps({ 'data-state': 'open' }, partsProps?.root);
  });

  it('base にパーツに無いプロパティは指定できない', () => {
    // @ts-expect-error foo は span のプロパティに無い
    mergePartProps({ foo: 1 }, partsProps?.root);
  });

  it('base にパーツと型が違う値は指定できない', () => {
    // @ts-expect-error style は CSSProperties
    mergePartProps({ style: 1 }, partsProps?.root);
  });

  it('型引数で指定した型を返す', () => {
    const result = mergePartProps<IconProps>({ src: 'a.svg' });
    expectTypeOf(result).toEqualTypeOf<IconProps>();
  });
});
