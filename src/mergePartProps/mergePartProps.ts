import mergeProps from '@fringeworks/react-merge/mergeProps';
import type { PartsProps } from '../types';
import type { PartPropsValue } from './types';

/**
 * パーツに渡すプロパティをマージする
 * 後に指定したものが優先され、className・style・イベントハンドラー・refは合成される
 * partsPropsはパーツ毎に再帰的にマージされる
 * プロパティの型は overrides から推論する（base は推論に使わない）
 * @param base コンポーネントがパーツに設定するプロパティ。`data-*` も指定できる
 * @param overrides 上書きするプロパティ（主に利用者から渡されたpartsPropsの値）
 * @returns マージしたプロパティ
 */
export default function mergePartProps<P extends object>(
  base: NoInfer<Partial<P>> & { [key: `data-${string}`]: unknown },
  ...overrides: PartPropsValue<P>[]
): P {
  return _mergePartProps([base, ...overrides]) as P;
}

function _mergePartProps(
  propsList: PartPropsValue<object>[],
): Record<string, unknown> {
  const partsPropsList: PartsProps[] = [];
  const restList = propsList.map((props) => {
    if (!props) {
      return props;
    }
    const { partsProps, ...rest } = props as { partsProps?: PartsProps };
    if (partsProps) {
      partsPropsList.push(partsProps);
    }
    return rest;
  });

  const result = mergeProps(...restList) as Record<string, unknown>;
  if (partsPropsList.length) {
    result.partsProps = _mergePartsProps(partsPropsList);
  }
  return result;
}

/**
 * partsPropsをパーツ毎にマージする
 * 値が全て falsy のパーツは結果に含めない
 * @param partsPropsList マージするpartsPropsの一覧
 * @returns パーツ毎にマージしたpartsProps
 */
function _mergePartsProps(partsPropsList: PartsProps[]): PartsProps {
  const parts = new Set(
    partsPropsList.flatMap((partsProps) => Object.keys(partsProps)),
  );
  const result: PartsProps = {};
  for (const part of parts) {
    const propsList = partsPropsList.map((partsProps) => partsProps[part]);
    if (propsList.some(Boolean)) {
      result[part] = _mergePartProps(propsList);
    }
  }
  return result;
}
