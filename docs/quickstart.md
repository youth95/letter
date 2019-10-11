# 快速开始

Letter托管在npm上，可使用以下命令进行安装。

```bash
npm install letter
# or
yarn add letter
```

推荐使用typescript，这样在使用Letter时可以更方便的使用里面的类型。

# 简单的例子

```javascript
import { ViewPort, createTransformMatrix, createTransformMatrix,RectShape } from 'letter';
// 创建viewPort
const viewPort = new ViewPort({
    ctx:createCanvasContext2d(),
    width:100,
    height:100,
    transformMatrix:createTransformMatrix()
});
// 创建一个图形
const rectShape = new RectShape([0,0,50,50]);
// 将图形加入渲染引擎
viewPort.engine.add(rectShape);
// 渲染
viewPort.engine.render();
// 挂载
document.getElementById('example0').appendChild(viewPort.engine.ctx.canvas);

```

然后将得到如下的样子

<iframe  src="_examples/example0.html" ></iframe>

现在让我们在上面加上点击事件试试。

```javascript
// 覆盖图形事件逻辑
rectShape.onMouseDown = function (ev) {
    if (this.drawState && this.drawState.strokeStyle === 'red') {
        this.drawState = {
            strokeStyle: "blue"
        };
    } else {
        this.drawState = {
            strokeStyle: "red"
        };
    }
    ev.viewport.engine.render(true);    // 清除并重绘画布
}

// dom事件绑定
const h = (ename) => (ev) => {
    const offsetLeft = viewPort.engine.ctx.canvas.offsetLeft;
    const offsetTop = viewPort.engine.ctx.canvas.offsetTop;
    const offsetX = ev.offsetX;
    const offsetY = ev.offsetY;
    viewPort.trigger([offsetX - offsetLeft, offsetY - offsetTop], ename);
};
viewPort.engine.ctx.canvas.addEventListener('mousedown', h('down'));
viewPort.engine.ctx.canvas.addEventListener('mousemove', h('move'));
```

现在点击这个矩形就会变色了

<iframe  src="_examples/example1.html" ></iframe>

# 编辑器

letter 中包含一个`Editor`类，是图形编辑器的一个实现。你可以这样使用它。

```javascript
import { Editor} from 'letter';

const app = new Editor();

// 挂载
app.mount('root');

// 绑定键盘事件
window.addEventListener('keydown', (event) => {
  switch (event.keyCode) {
    case 76:  // l 画直线
      app.cleanDrawCanvas();
      app.drawLine();
      break;
    case 83:  // s 选择图形
      app.cleanDrawCanvas();
      app.selectShape();
      break;
    case 82:  // r 画矩形
      app.cleanDrawCanvas();
      app.drawRect();
      break;
    case 67:  // c 画圆
      app.cleanDrawCanvas();
      app.drawCircle();
      break;
    case 8:   // Backspace 删除选中图形
      app.cleanDrawCanvas();
      app.removeAllSelected();
      app.cleanDrawCanvas();
      break;
    case 80:  // p 画多边形
      app.cleanDrawCanvas();
      app.drawPloygon();
      break;
  }
});
```

像这样,按下键盘上的`r`键试试?

<iframe height=600 src="_examples/example2.html" ></iframe>

