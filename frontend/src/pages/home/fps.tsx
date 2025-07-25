import { IS_FPS_COUNTER_ENABLED } from './dev-config';

type Props = {
  value: number;
};

function FPS({ value }: Props) {
  if (!IS_FPS_COUNTER_ENABLED) return;

  return <div className="absolute top-0 right-0 p-2 text-white bg-black">{value}</div>;
}

export { FPS };
