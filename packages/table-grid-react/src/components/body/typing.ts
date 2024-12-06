import type { RawData } from "@scode/table-grid-core";

export interface TableBodyProps {
  prefixCls: string;

  dataSource: RawData[];

  updateDataSource: () => void;
}