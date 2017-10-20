'use strict';
(function(console,document,window){

    let script = document.currentScript;
    
    let s = 3.2;
    let a = -0.5;
    let b = 0.5;

    let x0 = 1;
    let y0 = b;
    let x1 = a; 
    let y1 = b;
    let x2 = a;
    let y2 = -b;
    let x3 = 1;
    let y3 = -b;

    let xx = 0;
    let yy = a*s;
    let x4 = xx+ 0;
    let y4 = yy+ 0;
    let x5 = xx+ s*(2*b); 
    let y5 = yy+ 0;
    let x6 = xx+ s*(2*b);
    let y6 = yy+ s*(1-a);
    let x7 = xx+ 0;
    let y7 = yy+ s*(1-a);

    let x8 = 1*s*s;
    let y8 = b*s*s;
    let x9 = a*s*s; 
    let y9 = b*s*s;
    let x10 = a*s*s;
    let y10 = -b*s*s;
    let x11 = 1*s*s;
    let y11 = -b*s*s;

    script.insertAdjacentHTML('afterend',`<svg width="1500" height="1500">
    <g transform="translate(700,700)scale(50,50)">
    <g transform="scale(${s},${s})rotate(90)">
    <g transform="scale(${s},${s})rotate(90)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}" opacity="0.2" />
    </g></g>
    <g transform="scale(${s},${s})rotate(90)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}" opacity="0.4"/>
    </g>
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}" opacity="0.6"/>
  
    </g>
  </svg>`);
})(console,document,window);