import { ViewPortMouseEvent } from "../handler/MouseEventHandler";
export class DefaultMouseEvent {
    public onMouseDown(e: ViewPortMouseEvent): boolean {
        return true;
    }

    public onMouseEnter(e: ViewPortMouseEvent): boolean {
        return true;
    };

    public onMouseLeave(e: ViewPortMouseEvent): boolean {
        return true;
    };
    public onMouseMove(e: ViewPortMouseEvent): boolean {
        return true;
    };
    public onMouseOut(e: ViewPortMouseEvent): boolean {
        return true;
    }
    public onMouseOver(e: ViewPortMouseEvent): boolean {
        return true;
    }
    public onMouseUp(e: ViewPortMouseEvent): boolean {
        return true;
    }
    public onMouseWheel(e: ViewPortMouseEvent): boolean {
        return true;
    }
}
