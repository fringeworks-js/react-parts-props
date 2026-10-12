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

Merge the props the component gives to each part with `partsProps` using `mergePartProps`.

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

### `mergePartProps(base, ...overrides)`

Merges the props the component gives to a part (`base`) with the props to override them (mainly a value of `partsProps`).\
The type of the props is inferred from `base`. Specify it as a type argument when `base` does not have all of them, such as `mergePartProps<IconProps>(...)`.

- Later values take precedence
- `className` is concatenated, `style` is merged, and event handlers (`on[A-Z]*`) and `ref` are combined
- `partsProps` is merged recursively, part by part
- Falsy values (`undefined`, `null`, `false`) in `overrides` are ignored

### Types

| Type                | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `PartsDefinition`   | Definition of the parts. The key is the part name, the value is its props |
| `PartsProps<T>`     | Type of `partsProps`                                                      |
| `WithPartsProps<T>` | Props that have `partsProps`                                              |
