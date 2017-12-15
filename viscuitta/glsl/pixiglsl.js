PIXI.filters.MyFilter = class MyFilter extends PIXI.Filter {
    constructor() {
      var fragmentSrc = `
        precision mediump float;
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
  
        void main(void) {
          vec4 color = texture2D(uSampler, vTextureCoord);
          gl_FragColor = color;
        }
      `;
  
      super(
        null, // vertex shader
        fragmentSrc, // fragment shader
        {} // uniforms
      );
    }
};
const fragmentSrc = `
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  // テクスチャのピクセルデータ
  vec4 color = texture2D(uSampler, vTextureCoord);

  // 赤だけ定数にする
  color.r = 0.8;
  color.g = 0.1;   
  color.b = 0.1;  
  gl_FragColor = color;
}
`;