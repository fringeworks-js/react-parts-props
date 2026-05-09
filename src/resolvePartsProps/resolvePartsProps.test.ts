import type { PartsProps, WithPartsProps } from '../types';
import resolvePartsProps from './resolvePartsProps';

// ----------------------------------------------------------------
// テスト用の型定義
// ----------------------------------------------------------------
type ImgProps = {
  className?: string;
  onLoad?: () => void;
  style?: Record<string, unknown>;
  alt?: string;
};

type SpanProps = {
  className?: string;
  style?: Record<string, unknown>;
  onClick?: () => void;
};

type ButtonProps = {
  className?: string;
  style?: Record<string, unknown>;
  onClick?: () => void;
  title?: string;
};

type NwrIconPartsDefinition = {
  root: SpanProps;
  img: ImgProps;
};
type NwrIconProps = WithPartsProps<NwrIconPartsDefinition> & {
  value?: string;
  className?: string;
};

type NwrLabelPartsDefinition = {
  root: SpanProps;
};
type NwrLabelProps = WithPartsProps<NwrLabelPartsDefinition> & {
  value?: string;
  className?: string;
};

type NwrButtonPartsDefinition = {
  root: ButtonProps;
  label: NwrLabelProps;
  icon: NwrIconProps;
};

describe('resolvePartsProps', () => {
  // ----------------------------------------------------------------
  // 基本動作
  // ----------------------------------------------------------------
  describe('基本動作', () => {
    it('partsProps が undefined のとき空オブジェクトを返す', () => {
      const result = resolvePartsProps(undefined);
      expect(result).toEqual({});
    });

    it('partsProps が空オブジェクトのとき空オブジェクトを返す', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {};
      const result = resolvePartsProps(partsProps);
      expect(result).toEqual({});
    });

    it('単一のルートキーのプロパティを返す', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        root: { title: 'ホーム' },
      };
      const result = resolvePartsProps(partsProps);
      expect(result.root).toEqual({ title: 'ホーム' });
    });

    it('複数のルートキーのプロパティをそれぞれ返す', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        root: { title: 'ホーム' },
        label: { className: 'nwr-label' },
        icon: { className: 'nwr-icon' },
      };
      const result = resolvePartsProps(partsProps);
      expect(result.root).toEqual({ title: 'ホーム' });
      expect(result.label).toEqual({ className: 'nwr-label' });
      expect(result.icon).toEqual({ className: 'nwr-icon' });
    });
  });

  // ----------------------------------------------------------------
  // ドット記法の展開
  // ----------------------------------------------------------------
  describe('ドット記法の展開', () => {
    it('ドット記法のキーが対応するルートキーの partsProps に展開される', () => {
      const onLoad = vi.fn();
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        'icon.img': { onLoad },
      };
      const result = resolvePartsProps(partsProps);
      expect((result.icon as NwrIconProps)?.partsProps?.img?.onLoad).toBe(
        onLoad,
      );
    });

    it('複数のドット記法キーがそれぞれ対応するルートキーに展開される', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        'icon.img': { className: 'icon-img' },
        'label.root': { className: 'label-root' },
      };
      const result = resolvePartsProps(partsProps);
      expect((result.icon as NwrIconProps)?.partsProps?.img?.className).toBe(
        'icon-img',
      );
      expect((result.label as NwrLabelProps)?.partsProps?.root?.className).toBe(
        'label-root',
      );
    });

    it('直接渡しとドット記法が両方あるとき両方が結果に含まれる', () => {
      const onLoad = vi.fn();
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: { className: 'nwr-icon' },
        'icon.img': { onLoad },
      };
      const result = resolvePartsProps(partsProps);
      expect((result.icon as NwrIconProps)?.className).toBe('nwr-icon');
      expect((result.icon as NwrIconProps)?.partsProps?.img?.onLoad).toBe(
        onLoad,
      );
    });
  });

  // ----------------------------------------------------------------
  // 優先度
  // ----------------------------------------------------------------
  describe('優先度', () => {
    it('同じキーに直接渡しとドット記法が競合するとき直接渡しが優先される', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: {
          partsProps: {
            img: { className: 'direct-img' },
          },
        },
        'icon.img': { className: 'dot-img' },
      };
      const result = resolvePartsProps(partsProps);
      expect((result.icon as NwrIconProps)?.partsProps?.img?.className).toBe(
        'direct-img',
      );
    });

    it('直接渡しの partsProps に複数キーがあるとき競合しないキーは両方残る', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: {
          partsProps: {
            root: { className: 'direct-root' },
            img: { className: 'direct-img' },
          },
        },
        'icon.img': { className: 'dot-img' },
      };
      const result = resolvePartsProps(partsProps);
      expect((result.icon as NwrIconProps)?.partsProps?.root?.className).toBe(
        'direct-root',
      );
      expect((result.icon as NwrIconProps)?.partsProps?.img?.className).toBe(
        'direct-img',
      );
    });
  });

  // ----------------------------------------------------------------
  // ルートキーの重複排除
  // ----------------------------------------------------------------
  describe('ルートキーの重複排除', () => {
    it('直接渡しとドット記法で同じルートキーが登場しても結果のキーは1つになる', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: { className: 'nwr-icon' },
        'icon.img': { className: 'icon-img' },
        'icon.root': { className: 'icon-root' },
      };
      const result = resolvePartsProps(partsProps);
      expect(Object.keys(result)).toEqual(['icon']);
    });
  });

  // ----------------------------------------------------------------
  // 元の partsProps の不変性
  // ----------------------------------------------------------------
  describe('元の partsProps の不変性', () => {
    it('結果を変更しても元の直接渡しオブジェクトが変更されない', () => {
      const iconProps = { className: 'original' };
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: iconProps,
      };
      const result = resolvePartsProps(partsProps);
      (result.icon as NwrIconProps).className = 'modified';
      expect(iconProps.className).toBe('original');
    });

    it('結果を変更しても元のドット記法オブジェクトが変更されない', () => {
      const imgProps = { className: 'original' };
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        'icon.img': imgProps,
      };
      const result = resolvePartsProps(partsProps);
      const iconResult = result.icon as NwrIconProps;
      if (iconResult?.partsProps?.img) {
        iconResult.partsProps.img.className = 'modified';
      }
      expect(imgProps.className).toBe('original');
    });
  });
});
