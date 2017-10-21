'use strict';
(function(console,document,window){

    let script = document.currentScript;
    
    let s = (1+Math.sqrt(5))/2;
    let x0 = 0;
    let y0 = 0;
    let x1 = 1; 
    let y1 = 0;
    let x2 = 1;
    let y2 = s;
    let x3 = 0;
    let y3 = s;


    script.insertAdjacentHTML('afterend',`<svg width="1500" height="1500">
    <g transform="translate(600,300)scale(200,200)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}" opacity="0.2"/>
    </g>
  </svg>`);
})(console,document,window);