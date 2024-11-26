import { createContext } from "react";
import { Spin } from "../spin";
import { Pagination } from "../pagination";

export const OverrideContext = createContext({
  Spin,
  Pagination,
});