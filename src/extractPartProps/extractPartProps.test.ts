import type { PartsProps, WithPartsProps } from '../types';
import extractPartProps from './extractPartProps';

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

describe('extractPartProps', () => {
  // ----------------------------------------------------------------
  // 基本動作
  // ----------------------------------------------------------------
  describe('基本動作', () => {
    it('partsProps が undefined のとき空オブジェクトを返す', () => {
      const result = extractPartProps('root', undefined);
      expect(result).toEqual({});
    });

    it('partsProps が空オブジェクトのとき空オブジェクトを返す', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {};
      const result = extractPartProps('root', partsProps);
      expect(result).toEqual({});
    });

    it('対象キーのプロパティをそのまま返す', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        root: { title: 'ホーム' },
      };
      const result = extractPartProps('root', partsProps);
      expect(result).toEqual({ title: 'ホーム' });
    });

    it('対象キーが partsProps に存在しないとき空オブジェクトを返す', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        root: { title: 'ホーム' },
      };
      const result = extractPartProps('label', partsProps);
      expect(result).toEqual({});
    });

    it('関係のないキーは結果に含まれない', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        root: { title: 'ホーム' },
        label: { className: 'label' },
      };
      const result = extractPartProps('root', partsProps);
      expect(result).toEqual({ title: 'ホーム' });
      expect(result).not.toHaveProperty('label');
    });

    it('直接渡しの値が undefined のとき空オブジェクトを返す', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: undefined,
      };
      const result = extractPartProps('icon', partsProps);
      expect(result).toEqual({});
    });
  });

  // ----------------------------------------------------------------
  // ドット記法の展開
  // ----------------------------------------------------------------
  describe('ドット記法の展開', () => {
    it('1階層のドット記法を partsProps の構造に変換する', () => {
      const onLoad = vi.fn();
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        'icon.img': { onLoad },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      expect(result.partsProps?.img?.onLoad).toBe(onLoad);
    });

    it('複数のドット記法キーが正しくそれぞれ展開される', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        'icon.root': { className: 'icon-root' },
        'icon.img': { className: 'icon-img' },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      expect(result.partsProps?.root?.className).toBe('icon-root');
      expect(result.partsProps?.img?.className).toBe('icon-img');
    });

    it('直接渡しとドット記法が両方あるとき両方が結果に含まれる', () => {
      const onLoad = vi.fn();
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: { className: 'icon-direct' },
        'icon.img': { onLoad },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      expect(result.className).toBe('icon-direct');
      expect(result.partsProps?.img?.onLoad).toBe(onLoad);
    });

    it('【問題1】直接渡しの partsProps とドット記法が競合するとき直接渡しが優先される', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: {
          partsProps: {
            img: { className: 'direct-partsProps' },
          },
        },
        'icon.img': { className: 'dot-notation' },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      // 直接渡し（icon.partsProps.img）がドット記法（'icon.img'）より優先される
      expect(result.partsProps?.img?.className).toBe('direct-partsProps');
    });

    it('【問題2】直接渡しの partsProps に複数キーがあるとき、ドット記法で指定したキーだけ上書きされ他のキーは残る', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: {
          partsProps: {
            root: { className: 'direct-root' }, // ドット記法で触らないキー
            img: { className: 'direct-img' }, // ドット記法と競合するキー
          },
        },
        'icon.img': { className: 'dot-img' },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      // root は直接渡しの値がそのまま残る（丸ごと置き換わっていない）
      expect(result.partsProps?.root?.className).toBe('direct-root');
      // img は直接渡しが優先される
      expect(result.partsProps?.img?.className).toBe('direct-img');
    });

    it('【問題2】ドット記法のキーと直接渡しの partsProps に異なるキーがあるとき両方が結果に含まれる', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: {
          partsProps: {
            root: { className: 'direct-root' },
          },
        },
        'icon.img': { className: 'dot-img' },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      // ドット記法由来のキーが残る
      expect(result.partsProps?.img?.className).toBe('dot-img');
      // 直接渡し由来のキーも残る（上書きされていない）
      expect(result.partsProps?.root?.className).toBe('direct-root');
    });

    it('icon に関係ないドット記法キー（label.root）は含まれない', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        'icon.img': { className: 'icon-img' },
        'label.root': { className: 'label-root' },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      expect(result.partsProps?.img?.className).toBe('icon-img');
      expect(result).not.toHaveProperty('label');
    });

    it('icon と iconExtra のように前方一致するキーが混在しても干渉しない', () => {
      type MixedPartsDefinition = {
        icon: NwrIconProps;
        iconExtra: NwrIconProps;
      };
      const partsProps: PartsProps<MixedPartsDefinition> = {
        'icon.img': { className: 'icon-img' },
        'iconExtra.root': { className: 'extra-root' },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      expect(result.partsProps?.img?.className).toBe('icon-img');
      expect(result).not.toHaveProperty('iconExtra');
    });
  });

  // ----------------------------------------------------------------
  // プロパティの独立性（参照の共有がないこと）
  // ----------------------------------------------------------------
  describe('プロパティの独立性', () => {
    it('直接渡しのオブジェクトはシャローコピーされる（元の partsProps を汚染しない）', () => {
      const original = { className: 'original' };
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        root: original,
      };
      const result = extractPartProps('root', partsProps) as ButtonProps;

      // result を変更しても original に影響しないこと
      result.className = 'modified';
      expect(original.className).toBe('original');
    });
  });

  // ----------------------------------------------------------------
  // 直接渡しの partsProps との統合（deepMerge の動作確認）
  // ----------------------------------------------------------------
  describe('直接渡しの partsProps との統合', () => {
    it('ドット記法と直接渡しの partsProps に同じキーがあるとき直接渡しのプロパティが優先される', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: {
          partsProps: {
            img: { className: 'direct-img', alt: 'direct-alt' },
          },
        },
        'icon.img': { className: 'dot-img', alt: 'dot-alt' },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      // 直接渡しが優先される
      expect(result.partsProps?.img?.className).toBe('direct-img');
      expect(result.partsProps?.img?.alt).toBe('direct-alt');
    });

    it('ドット記法と直接渡しの partsProps に異なるキーがあるとき両方のプロパティが結果に含まれる', () => {
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: {
          partsProps: {
            img: { alt: 'direct-alt' },
          },
        },
        'icon.img': { className: 'dot-img' },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      expect(result.partsProps?.img?.className).toBe('dot-img');
      expect(result.partsProps?.img?.alt).toBe('direct-alt');
    });
  });

  // ----------------------------------------------------------------
  // 元の partsProps の不変性
  // ----------------------------------------------------------------
  describe('元の partsProps の不変性', () => {
    it('結果を変更しても元の partsProps の直接渡しオブジェクトが変更されない', () => {
      const iconProps = { className: 'original' };
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        icon: iconProps,
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      result.className = 'modified';
      expect(iconProps.className).toBe('original');
    });

    it('結果を変更しても元の partsProps のドット記法オブジェクトが変更されない', () => {
      const imgProps = { className: 'original' };
      const partsProps: PartsProps<NwrButtonPartsDefinition> = {
        'icon.img': imgProps,
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      if (result.partsProps?.img) {
        result.partsProps.img.className = 'modified';
      }
      expect(imgProps.className).toBe('original');
    });
  });

  // ----------------------------------------------------------------
  // 3階層以上のネスト
  // ----------------------------------------------------------------
  describe('3階層以上のネスト', () => {
    type NwrDeepPartsDefinition = {
      icon: NwrIconProps; // icon は partsProps を持つ
    };

    it('2階層のドット記法（icon.img）が正しく展開される', () => {
      const onLoad = vi.fn();
      const partsProps: PartsProps<NwrDeepPartsDefinition> = {
        'icon.img': { onLoad },
      };
      const result = extractPartProps('icon', partsProps) as NwrIconProps;
      expect(result.partsProps?.img?.onLoad).toBe(onLoad);
    });
  });
});
