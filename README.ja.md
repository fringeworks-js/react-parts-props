# @fringeworks/react-parts-props

`@fringeworks/react-parts-props` は React の複合コンポーネントを構成する各コンポーネントにプロパティを渡すための、誰かにとっては便利なライブラリです。

**[English README is available here](./README.md)**

## 概要

複数のコンポーネント（パーツ）を組み合わせて作られたコンポーネントでは、利用者が内部のパーツに `aria-*`、`data-*`、`ref`、イベントハンドラーなどを自由に渡すことができません。\
このライブラリは、そのための `partsProps` というプロパティの規約と、コンポーネント自身が設定するプロパティと利用者が渡したプロパティをマージするユーティリティを提供します。

## 使い方

### プロパティの定義

`WithPartsProps` でパーツとそのプロパティを定義します。

```ts
import type { WithPartsProps } from '@fringeworks/react-parts-props';

type IconProps = WithPartsProps<{
  root: ComponentProps<'span'>;
  img: ComponentProps<'img'>;
}> & {
  src: string;
};

type ButtonProps = WithPartsProps<{
  root: ComponentProps<'button'>;
  icon: IconProps;
}> & {
  icon?: string;
  children?: ReactNode;
};
```

### コンポーネントの実装

コンポーネントが各パーツに設定するプロパティと `partsProps` を `mergePartProps` でマージします。

```tsx
import { mergePartProps } from '@fringeworks/react-parts-props';

function Button({ icon, children, partsProps }: ButtonProps) {
  return (
    <button {...mergePartProps({ className: 'button' }, partsProps?.root)}>
      {icon && (
        <Icon {...mergePartProps<IconProps>({ src: icon }, partsProps?.icon)} />
      )}
      {children}
    </button>
  );
}
```

### コンポーネントの利用

パーツ名をキーにしてプロパティを渡します。\
パーツ自身が `partsProps` を持つ場合は、その中に更に `partsProps` を指定します。

```tsx
<Button
  icon="home.svg"
  partsProps={{
    root: { 'aria-label': 'ホーム', onClick: handleClick },
    icon: { partsProps: { img: { alt: '' } } },
  }}
>
  ホーム
</Button>
```

## API

### `mergePartProps(base, ...overrides)`

コンポーネントがパーツに設定するプロパティ（`base`）と、それを上書きするプロパティ（主に `partsProps` の値）をマージします。\
プロパティの型は `base` から推論されます。`base` がすべてのプロパティを持たない場合は、`mergePartProps<IconProps>(...)` のように型引数で指定してください。

- 後に指定した値が優先されます
- `className` は連結、`style` はマージ、イベントハンドラー（`on[A-Z]*`）と `ref` は合成されます
- `partsProps` はパーツ毎に再帰的にマージされます
- `overrides` の falsy な値（`undefined`、`null`、`false`）は無視されます

### 型

| 型                  | 説明                                                           |
| ------------------- | -------------------------------------------------------------- |
| `PartsDefinition`   | パーツの定義。キーにパーツ名、値にそのプロパティの型を指定する |
| `PartsProps<T>`     | `partsProps` の型                                              |
| `WithPartsProps<T>` | `partsProps` を持ったプロパティ                                |
