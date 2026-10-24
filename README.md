# @fringeworks/react-parts-props

`@fringeworks/react-parts-props` is a library some will find handy, for passing props to each of the components that make up a composite React component.

**[日本語のREADMEはこちら](./README.ja.md)**

## Overview

When a component is built from several inner components (parts), users usually cannot pass arbitrary props such as `aria-*`, `data-*`, `ref` or event handlers to those parts.\
This library provides a `partsProps` prop convention for that, and a utility to merge the component's own props with the ones passed by the user.

## Usage

### Defining the props

Declare the parts and their props with `WithPartsProps`.

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

### Implementing the component

Merge the props the component gives to each part with `partsProps` using `mergePartProps`.\
The type of the props is inferred from the value of `partsProps`, so no type argument is needed.

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

### Using the component

Pass props to each part by its name.\
When a part itself has `partsProps`, nest another `partsProps` inside it.

```tsx
<Button
  icon="home.svg"
  partsProps={{
    root: { 'aria-label': 'Home', onClick: handleClick },
    icon: { partsProps: { img: { alt: '' } } },
  }}
>
  Home
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

Merges the props the component gives to a part (`base`) with the props to override them (mainly a value of `partsProps`).

- Later values take precedence
- `className` is concatenated, `style` is merged, and event handlers (`on[A-Z]*`) and `ref` are combined
- `partsProps` is merged recursively, part by part. Parts whose values are all falsy are left out of the result
- Falsy values (`undefined`, `null`, `false`) in `overrides` are ignored

The props type `P` is inferred from `overrides`; `base` is not used for inference.\
`base` accepts the props of `P` and `data-*`. When the type cannot be inferred, such as when no `overrides` are passed, specify it as a type argument like `mergePartProps<IconProps>(...)`.\
It does not check whether `base` and `overrides` together provide all the required props.

When both `base` and `overrides` have a `ref`, the combined ref is recreated on every render, so React detaches and reattaches it each time (calling the old ref with `null` and the new one with the element).\
If a callback ref has side effects (such as registering a `ResizeObserver`), pass the ref on only one side, or make the callback safe to run on every render.

| Parameter      | Type                                                           | Description                                                        |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `base`         | ``NoInfer<Partial<P>> & { [key: `data-${string}`]: unknown }`` | Props the component gives to the part                              |
| `...overrides` | `PartPropsValue<P>[]`                                          | Props to override them (mainly a value of the user's `partsProps`) |

### Types

| Type                | Description                                                                       |
| ------------------- | --------------------------------------------------------------------------------- |
| `PartsDefinition`   | Definition of the parts. The key is the part name, the value is its props         |
| `PartsProps<T>`     | Type of `partsProps`                                                              |
| `WithPartsProps<T>` | Props that have `partsProps`                                                      |
| `PartPropsValue<P>` | Value accepted by `overrides` of `mergePartProps` (`Partial<P>` or a falsy value) |
