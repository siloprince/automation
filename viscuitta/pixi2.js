// canvasのサイズ（任意）
const SC_WIDTH = 400;
const SC_HEIGHT = 256;
const IMG_SRC = "./test.png";

const init = function(loader, resources) {
  // アプリ生成
  let app = new PIXI.Application(SC_WIDTH, SC_HEIGHT);
  document.body.appendChild(app.view);

  // スプライト追加
  let img = new PIXI.Sprite(resources.img.texture);
  app.stage.addChild(img);

  // フィルタを適用
  let myFilter = new PIXI.filters.MyFilter();
  app.stage.filters = [myFilter];
};

// 画像ロード完了後に初期化
PIXI.loader.add('img', IMG_SRC).load(init);