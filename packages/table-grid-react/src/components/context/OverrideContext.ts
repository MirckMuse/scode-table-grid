import { createContext } from "react";
import { Spin } from "../spin";
import { Pagination } from "../pagination";
import { Empty } from "../empty";

export const OverrideContext = createContext({
  Spin,
  Pagination,
  Empty
});