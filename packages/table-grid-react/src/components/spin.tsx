export interface SpinProps {
  prefixCls: string;

  spinning?: boolean;

  tip?: string | JSX.Element;

  delay?: number;

  children?: JSX.Element;
}

export function Spin(props: SpinProps) {
  const { prefixCls, children } = props;
  const spinClass = prefixCls + "-spin";

  return (
    <div className={spinClass}>
      {children}
    </div>
  )
}