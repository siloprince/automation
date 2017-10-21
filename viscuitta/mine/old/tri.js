'use strict';
(function(console,document,window){

    let script = document.currentScript;
    
    let s = 2.4;
    let a = -0.2;

    let x0 = 1;
    let y0 = 0;
    let x1 = a; 
    let y1 = (1-a)/Math.sqrt(3);
    let x2 = a;
    let y2 = -(1-a)/Math.sqrt(3);

    script.insertAdjacentHTML('afterend',`<svg width="1500" height="1500">
    <g transform="translate(700,700)scale(50,50)">
    <!--
    <g transform="scale(${s},${s})">
    <g transform="scale(${s},${s})">
        <g transform="rotate(30)rotate(30)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.2" />
        </g>
    </g>
        <g transform="rotate(30)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.4"/>
        </g>
    </g>
    <g transform="scale(1,1)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" fill="#ffffff"/>
    </g>
-->
    
    <g id="ss" transform="scale(${s},${s})rotate(30)">
    <g id="s" transform="scale(${s},${s})rotate(30)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.2" />
    </g>
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" opacity="0.4"/>
    </g>
    <g transform="scale(1,1)">
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" fill="#ffffff"/>
        <circle r="0.1" cx="0" cy="0" fill="#ff0000">
    </g>
    
    </g>
  </svg>`);
})(console,document,window);