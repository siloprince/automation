'use strict';
(function(console,document,window){

    let script = document.currentScript;
    
    let s = 2.4;
    let a = -0.5;

    let x0 = 1;
    let y0 = 0;
    let x1 = a; 
    let y1 = (1-a)/Math.sqrt(3);
    let x2 = a;
    let y2 = -(1-a)/Math.sqrt(3);

    script.insertAdjacentHTML('afterend',`<svg width="1500" height="1500">
    <g transform="translate(700,700)scale(50,50)">
    <g id="ss" transform="scale(${s},${s})rotate(30)">
    <g id="s" transform="scale(${s},${s})rotate(30)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.2" />
    </g>
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.4"/>
    </g>
    <g transform="scale(1,1)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" fill="#ffffff"/>
    </g>
    </g>
  </svg>`);
})(console,document,window);