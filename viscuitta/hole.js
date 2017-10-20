'use strict';
(function(console,document,window){
    let script = document.currentScript;
    
    let s = 2;
    let a = -0.36;
    let b = 0.4;
    let x = a*s*s - b*s*s*s + b*s + s*s;
    let z =  a - b*s + b/s - x/s*s + 1;
    let y = (b*s + s*s - x)/s;
    
    let x0 = 1;
    let y0 = b;
    let x1 = a; 
    let y1 = b;
    let x2 = a;
    let y2 = -b;
    let x3 = 1;
    let y3 = -b;

    let x4 = x;
    let y4 = y;
    let x5 = z; 
    let y5 = y;
    let x6 = z;
    let y6 = y-(x-z)*(1-a)/(2*b);
    let x7 = x;
    let y7 = y-(x-z)*(1-a)/(2*b);

    let x8 = 1*s*s;
    let y8 = b*s*s;
    let x9 = a*s*s; 
    let y9 = b*s*s;
    let x10 = a*s*s;
    let y10 = -b*s*s;
    let x11 = 1*s*s;
    let y11 = -b*s*s;

    script.insertAdjacentHTML('afterend',`<svg width="1500" height="1500">
    <g transform="translate(700,700)scale(200,200)">
        <polygon points="${x8},${y8} ${x9},${y9} ${x10},${y10} ${x11},${y11}" opacity="0.2" />
        <polygon points="${x4},${y4} ${x5},${y5} ${x6},${y6} ${x7},${y7}" opacity="0.4"/>
        <polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="#ffffff"/>
    </g>
  </svg>`);
})(console,document,window);
/*
        
        <polygon points="${x8},${y8} ${x9},${y9} ${x10},${y10} ${x11},${y11}" stroke="#ff0000" fill="none"/>
http://www.wolframalpha.com/input/?i=y+%3D+(b+s+%2B+s%5E2+-+x)%2Fs,+z+%3D+(a+s%5E2+-+b+s%5E3+%2B+b+s+%2B+s%5E2+-+x)%2Fs%5E2,+z+%3D+s%5E2+a+-+s+b+-+s+(y-(x-z)(1-a)%2F2%2Fb)

http://www.wolframalpha.com/input/?i=y+%3D+(b+s+%2B+s%5E2+-+x)%2Fs,+z+%3D+(a+s%5E2+-+b+s%5E3+%2B+b+s+%2B+s%5E2+-+x)%2Fs%5E2

*/