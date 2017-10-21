'use strict';
(function(console,document,window){

    let script = document.currentScript;
    
    let rot = 40;
    let theta = rot*Math.PI/180;
    let x0 = 1;
    let y0 = 0;
    let x1 = 0; 
    let y1 = 0;
    let x2 = 0;
    let y2 = Math.tan(theta);
    let u = Math.sqrt(1+y2*y2);
    let s = (u-1)/y2;
    script.insertAdjacentHTML('afterend',`<svg width="1500" height="1500">
    <g transform="translate(700,700)scale(300,300)">
    <g transform="scale(1,1)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.4"/>
        <g transform="translate(0,0)rotate(90)scale(${s},${s})">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.2"/>
        </g>
    </g>
    </g>
  </svg>`);
})(console,document,window);