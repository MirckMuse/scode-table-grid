export interface PaginationProps {
  prefixCls: string;
}

export function Pagination(props: PaginationProps) {
  const { prefixCls } = props;
  const spinClass = prefixCls + "-pagination";

  return (
    <div className={spinClass}>
    </div>
  )
}