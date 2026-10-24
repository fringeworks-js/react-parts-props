import { createRef } from 'react';
import type { WithPartsProps } from '../types';
import mergePartProps from './mergePartProps';

// ----------------------------------------------------------------
// テスト用の型定義
// ----------------------------------------------------------------
type ImgProps = {
  className?: string;
  style?: Record<string, unknown>;
  onLoad?: () => void;
  alt?: string;
};

type SpanProps = {
  className?: string;
  style?: Record<string, unknown>;
  onClick?: () => void;
};

type NwrIconPartsDefinition = {
  root: SpanProps;
  img: ImgProps;
};
type NwrIconProps = WithPartsProps<NwrIconPartsDefinition> & {
  value?: string;
  className?: string;
};

type NwrButtonPartsDefinition = {
  root: SpanProps;
  icon: NwrIconProps;
};
type NwrButtonProps = WithPartsProps<NwrButtonPartsDefinition> & {
  title?: string;
};

describe('mergePartProps', () => {
  // ----------------------------------------------------------------
  // 基本動作
  // ----------------------------------------------------------------
  describe('基本動作', () => {
    it('base のみのとき base と同じ内容を返す', () => {
      expect(mergePartProps<SpanProps>({ className: 'a' })).toEqual({
        className: 'a',
      });
    });

    it('falsyな上書きの値は無視する', () => {
      const result = mergePartProps<SpanProps>(
        { className: 'a' },
        undefined,
        null,
        false,
      );
      expect(result).toEqual({ className: 'a' });
    });

    it('パーツの型を指定しなくても overrides から推論される', () => {
      const override: Partial<NwrIconProps> | undefined = { value: 'search' };
      const result = mergePartProps({ className: 'a' }, override);
      expect(result).toEqual({ className: 'a', value: 'search' });
    });

    it('後に指定した値が優先される', () => {
      const result = mergePartProps<NwrIconProps>(
        { value: 'home' },
        { value: 'search' },
      );
      expect(result).toEqual({ value: 'search' });
    });

    it('後に指定した値が undefined のときは前の値を維持する', () => {
      const result = mergePartProps<NwrIconProps>(
        { value: 'home' },
        { value: undefined },
      );
      expect(result.value).toBe('home');
    });

    it('引数を変更しない', () => {
      const base: NwrIconProps = {
        className: 'a',
        partsProps: { img: { alt: 'x' } },
      };
      const override: NwrIconProps = {
        className: 'b',
        partsProps: { img: { alt: 'y' } },
      };
      mergePartProps(base, override);
      expect(base).toEqual({
        className: 'a',
        partsProps: { img: { alt: 'x' } },
      });
      expect(override).toEqual({
        className: 'b',
        partsProps: { img: { alt: 'y' } },
      });
    });
  });

  // ----------------------------------------------------------------
  // 合成されるプロパティ
  // ----------------------------------------------------------------
  describe('合成されるプロパティ', () => {
    it('className は連結される', () => {
      const result = mergePartProps<SpanProps>(
        { className: 'nwr-icon' },
        { className: 'custom' },
      );
      expect(result.className).toBe('nwr-icon custom');
    });

    it('style はマージされる', () => {
      const result = mergePartProps<SpanProps>(
        { style: { color: 'red', margin: 0 } },
        { style: { color: 'blue' } },
      );
      expect(result.style).toEqual({ color: 'blue', margin: 0 });
    });

    it('イベントハンドラーは指定順に両方呼ばれる', () => {
      const calls: string[] = [];
      const result = mergePartProps<SpanProps>(
        { onClick: () => calls.push('base') },
        { onClick: () => calls.push('override') },
      );
      result.onClick?.();
      expect(calls).toEqual(['base', 'override']);
    });

    it('ref は両方に設定される', () => {
      const ref1 = createRef<HTMLSpanElement>();
      const ref2 = createRef<HTMLSpanElement>();
      const result = mergePartProps<{ ref?: unknown }>(
        { ref: ref1 },
        { ref: ref2 },
      );
      const element = {} as HTMLSpanElement;
      (result.ref as (el: HTMLSpanElement) => void)(element);
      expect(ref1.current).toBe(element);
      expect(ref2.current).toBe(element);
    });

    it('イベントハンドラーに null を指定しても前のハンドラーを維持する', () => {
      const onClick = vi.fn();
      const result = mergePartProps<{ onClick?: (() => void) | null }>(
        { onClick },
        { onClick: null },
      );
      result.onClick?.();
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------------
  // partsProps のマージ
  // ----------------------------------------------------------------
  describe('partsProps のマージ', () => {
    it('partsProps が無いときは結果に partsProps を含めない', () => {
      const result = mergePartProps<NwrIconProps>({ value: 'home' });
      expect(result).not.toHaveProperty('partsProps');
    });

    it('片方にだけ partsProps があるときはそれを返す', () => {
      const result = mergePartProps<NwrIconProps>(
        { value: 'home' },
        { partsProps: { img: { alt: 'ホーム' } } },
      );
      expect(result).toEqual({
        value: 'home',
        partsProps: { img: { alt: 'ホーム' } },
      });
    });

    it('base にだけ partsProps があるときはそれを返す', () => {
      const result = mergePartProps<NwrIconProps>(
        { partsProps: { img: { alt: 'ホーム' } } },
        { value: 'home' },
      );
      expect(result).toEqual({
        value: 'home',
        partsProps: { img: { alt: 'ホーム' } },
      });
    });

    it('値が全て falsy のパーツは結果に含めない', () => {
      const result = mergePartProps<NwrIconProps>(
        { partsProps: { root: { className: 'a' }, img: undefined } },
        { partsProps: { img: undefined } },
      );
      expect(result.partsProps).toEqual({ root: { className: 'a' } });
    });

    it('partsProps はパーツ毎にマージされる', () => {
      const onLoad = vi.fn();
      const result = mergePartProps<NwrIconProps>(
        {
          partsProps: {
            root: { className: 'nwr-icon-root' },
            img: { className: 'nwr-icon-img', onLoad },
          },
        },
        {
          partsProps: {
            img: { className: 'custom', alt: 'ホーム' },
          },
        },
      );
      expect(result.partsProps?.root).toEqual({ className: 'nwr-icon-root' });
      expect(result.partsProps?.img).toMatchObject({
        className: 'nwr-icon-img custom',
        alt: 'ホーム',
      });
      result.partsProps?.img?.onLoad?.();
      expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it('ネストした partsProps も再帰的にマージされる', () => {
      const calls: string[] = [];
      const result = mergePartProps<NwrButtonProps>(
        {
          title: 'base',
          partsProps: {
            icon: {
              className: 'nwr-button-icon',
              partsProps: {
                img: {
                  className: 'nwr-button-icon-img',
                  onLoad: () => calls.push('base'),
                },
              },
            },
          },
        },
        {
          partsProps: {
            icon: {
              value: 'home',
              partsProps: {
                img: { alt: 'ホーム', onLoad: () => calls.push('override') },
              },
            },
          },
        },
      );
      const icon = result.partsProps?.icon;
      expect(result.title).toBe('base');
      expect(icon?.className).toBe('nwr-button-icon');
      expect(icon?.value).toBe('home');
      expect(icon?.partsProps?.img?.className).toBe('nwr-button-icon-img');
      expect(icon?.partsProps?.img?.alt).toBe('ホーム');
      icon?.partsProps?.img?.onLoad?.();
      expect(calls).toEqual(['base', 'override']);
    });

    it('3つ以上の値もマージできる', () => {
      const result = mergePartProps<NwrIconProps>(
        { partsProps: { img: { className: 'a' } } },
        { partsProps: { img: { className: 'b' } } },
        { partsProps: { img: { className: 'c' } } },
      );
      expect(result.partsProps?.img?.className).toBe('a b c');
    });
  });
});
