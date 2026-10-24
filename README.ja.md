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
import type { ComponentProps, ReactNode } from 'react';

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

コンポーネントが各パーツに設定するプロパティと `partsProps` を `mergePartProps` でマージします。\
プロパティの型は `partsProps` の値から推論されるため、型引数は不要です。

```tsx
import { mergePartProps } from '@fringeworks/react-parts-props';

function Button({ icon, children, partsProps }: ButtonProps) {
  return (
    <button {...mergePartProps({ className: 'button' }, partsProps?.root)}>
      {icon && <Icon {...mergePartProps({ src: icon }, partsProps?.icon)} />}
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

### `mergePartProps`

```ts
mergePartProps<P extends object>(
  base: NoInfer<Partial<P>> & { [key: `data-${string}`]: unknown },
  ...overrides: PartPropsValue<P>[]
): P
```

コンポーネントがパーツに設定するプロパティ（`base`）と、それを上書きするプロパティ（主に `partsProps` の値）をマージします。

- 後に指定した値が優先されます
- `className` は連結、`style` はマージ、イベントハンドラー（`on[A-Z]*`）と `ref` は合成されます
- `partsProps` はパーツ毎に再帰的にマージされます。値がすべて falsy のパーツは結果に含めません
- `overrides` の falsy な値（`undefined`、`null`、`false`）は無視されます

プロパティの型 `P` は `overrides` から推論され、`base` は推論に使いません。\
`base` には `P` のプロパティと `data-*` を指定できます。`overrides` を渡さない場合など、推論できないときは `mergePartProps<IconProps>(...)` のように型引数で指定してください。\
`base` と `overrides` で必須のプロパティがそろっているかは確認しません。

`base` と `overrides` の両方に `ref` がある場合、合成した ref はレンダーのたびに作り直されるため、React は毎回 ref を付け直します（古い ref を `null` で呼び、新しい ref を要素で呼ぶ）。\
コールバック ref で副作用のある処理（`ResizeObserver` の登録など）を行う場合は、ref を片方にまとめるか、毎回呼ばれても問題ない処理にしてください。

| 引数           | 型                                                             | 説明                                                         |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| `base`         | ``NoInfer<Partial<P>> & { [key: `data-${string}`]: unknown }`` | コンポーネントがパーツに設定するプロパティ                   |
| `...overrides` | `PartPropsValue<P>[]`                                          | 上書きするプロパティ（主に利用者が渡した `partsProps` の値） |

### 型

| 型                  | 説明                                                                             |
| ------------------- | -------------------------------------------------------------------------------- |
| `PartsDefinition`   | パーツの定義。キーにパーツ名、値にそのプロパティの型を指定する                   |
| `PartsProps<T>`     | `partsProps` の型                                                                |
| `WithPartsProps<T>` | `partsProps` を持ったプロパティ                                                  |
| `PartPropsValue<P>` | `mergePartProps` の `overrides` に指定できる値（`Partial<P>` または falsy な値） |
