import { MouseEvent } from "../handler/MouseEventHandler";
export class DefaultMouseEvent {
    public onMouseDown(e: MouseEvent): boolean {
        return true;
    }

    public onMouseEnter(e: MouseEvent): boolean {
        return true;
    };

    public onMouseLeave(e: MouseEvent): boolean {
        return true;
    };
    public onMouseMove(e: MouseEvent): boolean {
        return true;
    };
    public onMouseOut(e: MouseEvent): boolean {
        return true;
    }
    public onMouseOver(e: MouseEvent): boolean {
        return true;
    }
    public onMouseUp?(e: MouseEvent): boolean {
        return true;
    }
    public onMouseWheel(e: MouseEvent): boolean {
        return true;
    }
}
