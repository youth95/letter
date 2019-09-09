import { createCanvasContext2d } from "./utils";
import { Element, BitMap, BitMapInitOptions, PloygonInitOptions } from "./element";

export interface LayerOptions {
    name?: string;
}


export interface LayerInfo {
    id: number;
    name: string;
}

export interface appendShapeAble {
    append(el: Element): Layer
}

class Layer implements LayerInfo, appendShapeAble {
    private els: Element[] = [];

    public append(el: Element<any>): Layer {
        this.els.push(el);
        return this;
    }

    public render(ctx: CanvasRenderingContext2D) {
        this.els.forEach(item => item.fr(ctx));
    }

    constructor(
        public id: number,
        public name: string,
    ) { }
}

export class Editor implements appendShapeAble {

    private static instance: Editor | null;
    private static autoLayerId = 0;
    private constructor() { }
    private ctx = createCanvasContext2d();
    private layersMapper = new Map<number, Layer>();

    public static getInstance(): Editor {
        if (this.instance === null)
            this.instance = new Editor();
        return this.instance;
    }

    public addLayer(options?: LayerOptions): Layer {
        const id = Editor.autoLayerId++;
        if (!options) {
            const name = `default${id}`;
            this.layersMapper.set(id, new Layer(id, name));
        } else {
            this.layersMapper.set(id, new Layer(id, options.name || `default${id}`));
        }
        return this.layersMapper.get(id)!;
    }

    /**
     * 渲染所有图元
     */
    public renderAll() {
        [...this.layersMapper.keys()].sort().forEach(i => this.layersMapper.get(i)!.render(this.ctx));
    }

    public append(el: Element<any>): Layer {
        if (this.layersMapper.size === 0) {
            this.addLayer();
        }
        return this.layersMapper.get(Editor.autoLayerId - 1)!;
    }

}