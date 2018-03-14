'use strict';
(function(console,document,window){

    let script = document.currentScript;
    
    let s = 2.4;
    let a = -1;
    let b = 0.6;

    let x0 = 1;
    let y0 = b;
    let x1 = a; 
    let y1 = b;
    let x2 = a;
    let y2 = -b;
    let x3 = 1;
    let y3 = -b;


    script.insertAdjacentHTML('afterend',`<svg width="1500" height="1500">
    <g transform="translate(700,700)scale(50,50)">
    <g transform="scale(${s},${s})rotate(45)">
    <g transform="scale(${s},${s})rotate(45)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}" opacity="0.2" />
    </g>
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}" opacity="0.4"/>
    </g>
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="#ffffff"/>
  
    </g>
  </svg>`);
})(console,document,window);