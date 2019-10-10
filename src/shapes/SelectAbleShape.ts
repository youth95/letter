import { Shape } from "./Shape";
import { ViewPortMouseEvent } from "../handler/MouseEventHandler";
import { ViewPort } from "../viewport";

/**
 * 可选中图形
 */
export abstract class SelectAbleShape extends Shape {
  public abstract onSelected(newViewPort: ViewPort, e: ViewPortMouseEvent): void;
  public abstract onUnSelected(): void;

  public onMouseDown(e: ViewPortMouseEvent): boolean {
    if (!this.isSelected()) {
      this.select();
      this.drawState = { strokeStyle: 'red' };
      // clone 到一个新的画布上
      const newViewPort = e.viewport.clone();
      // 处理取消问题
      newViewPort.engine.ctx.canvas.addEventListener('mousedown', ev => {
        const { offsetTop, offsetLeft } = e.viewport.engine.ctx.canvas;
        const [x, y] = [ev.offsetX - offsetLeft, ev.offsetY - offsetTop];
        const vev = newViewPort.transformEvent('move', [x, y]);
        const result = newViewPort.engine.hitTest(vev.p);
        // 取消选中
        if (result.length === 0) {
          this.drawState = {
            strokeStyle: '#000',
            fillStyle: '#000',
          };
          // 把自身再次移动回原有画布
          e.viewport.engine.add(this);
          e.viewport.engine.render(true);
          newViewPort.engine.ctx.canvas.remove();
          this.unSelect();
        }
      });

      // 将自身从旧的画布中移除
      this.remove();
      // 清除在原有画布上的选中内容
      e.viewport.engine.clearAll();
      e.viewport.engine.render();
      // 把自己添加到新画布中
      newViewPort.engine.add(this);
      // 触发选中函数
      this.onSelected(newViewPort, e);
      // 渲染新画布
      newViewPort.engine.render();
      // 将新画布追加到编辑器中
      e.viewport.appendViewPort(newViewPort);
      // 重新渲染底层画布
      e.viewport.engine.render(true);

    }
    return false;
  }

  /**
   * 取消选中
   */
  public unSelect() {
    this.drawState = {
      strokeStyle: '#000',
    };
    this.onUnSelected();
    super.unSelect();
  }
}