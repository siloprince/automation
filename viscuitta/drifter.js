'use strict';
(function(console,document,window){

    let script = document.currentScript;
    

    let x0 = 0;
    let y0 = 0;
    let x1 = 1; 
    let y1 = 0;
    let x2 = Math.cos(Math.PI/6)*Math.sqrt(3)/2;
    let y2 = Math.sin(Math.PI/6)*Math.sqrt(3)/2;
    let s = 1/Math.sqrt(3);
    script.insertAdjacentHTML('afterend',`<svg width="1500" height="1500">
    <g transform="translate(700,700)scale(300,300)">
    <g transform="scale(1,1)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.4"/>
        <g transform="rotate(30)scale(${s},${s})">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.2"/>
        </g>
    </g>
    </g>
  </svg>`);
})(console,document,window);