interface EmptyProps {
  prefixCls: string;
}

export function Empty(props: EmptyProps) {
  const { prefixCls } = props;
  return (
    <div className={prefixCls + '-empty'}>
      暂无数据
    </div>
  )
}