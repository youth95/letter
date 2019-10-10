import { Editor } from '../../src/index';

const app = new Editor();

app.mount('root');

// 
window.addEventListener('keydown', (event) => {

  switch (event.keyCode) {
    case 76:  // l
      app.cleanDrawCanvas();
      app.drawLine();
      break;
    case 83:  // s
      app.cleanDrawCanvas();
      app.selectShape();
      break;
    case 82:  // r
      app.cleanDrawCanvas();
      app.drawRect();
      break;
    case 67:  // c
      app.cleanDrawCanvas();
      app.drawCircle();
      break;
    case 8:   // Backspace
      app.cleanDrawCanvas();
      app.removeAllSelected();
      app.cleanDrawCanvas();
      break;
    case 80:  // p
      app.cleanDrawCanvas();
      app.drawPloygon();
      break;
  }
  console.log(event);
})