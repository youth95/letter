import { Element as CElement } from "./element";

export interface IDAble<T> {
    id: number;
    value: T
}

export type RElement = IDAble<CElement>;
export type RLayer = IDAble<Layer>;

export interface Layer {
    appendElement(ele: CElement): void;
    allElements(): RElement[];
}

export interface LayerManagerOptions {
    width: number;
    height: number;
}

let autoId = 0;

class BaseLayer implements Layer {
    private eles: RElement[] = [];
    public appendElement(ele: CElement): void {
        const id = autoId++;
        ele.ctx.canvas.style.zIndex = id.toString();
        this.eles.push({
            value: ele,
            id,
        });
    }
    public allElements(): RElement[] {
        return this.eles;
    }


}

export class LayerManager {
    public width: number;
    public height: number;
    public layerManagerRootDOM: HTMLDivElement;
    private layers: RLayer[] = [];

    constructor(root: Element, option: LayerManagerOptions = {width:400,height:300}) {
        this.width = option.width;
        this.height = option.height;
        // create dom
        this.layerManagerRootDOM = document.createElement("div");   // 顶层
        this.layerManagerRootDOM.className = 'layer-manager';
        this.layerManagerRootDOM.style.width = `${this.width}px`;
        this.layerManagerRootDOM.style.height = `${this.height}px`;
        this.layerManagerRootDOM.style.overflow = 'hidden';
        this.layerManagerRootDOM.style.position = 'relative';
        this.layerManagerRootDOM.style.border = '1px solid #000';
        // clear root
        const childList = root.childNodes;
        for (var i = 0, len = childList.length; i < len; i++) {
            root.removeChild(childList[i]);
        }
        // append to root
        root.appendChild(this.layerManagerRootDOM);
    }

    private appendLayer(layer: Layer) {
        this.layers.push({
            value: layer,
            id: autoId++,
        })
    }

    public appendBaseLayer(){
        const baseLayer = new BaseLayer();
        this.appendLayer(baseLayer);
        return baseLayer;
    }

    public init() {
        for (const layer of this.layers) {
            const allLayers = layer.value.allElements();
            for(const cele of allLayers){
                this.layerManagerRootDOM.appendChild(cele.value.actionBoard);
            }
        }
    }
}