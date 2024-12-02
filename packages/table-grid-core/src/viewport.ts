import type { TableState } from "./table";
import type { IViewport } from "./types";

export class Viewport {
  protected viewport: IViewport;

  private table_state: TableState;

  constructor(table_state: TableState, viewport: IViewport) {
    this.table_state = table_state;
    this.viewport = Object.assign({}, this.viewport, viewport);
  }

  update_viewport(viewport: Partial<IViewport>) {
    this.viewport = Object.assign({}, this.viewport, viewport);
  }

  get height() {
    return this.viewport.height;
  }

  get width() {
    return this.viewport.width;
  }

  // 重写 json，防止依赖循环
  toJSON() {
    return {
      width: this.width,
      height: this.height
    }
  }
}