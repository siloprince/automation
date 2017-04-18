'use strict';
(function(document,window,console){
    let config = {
        "width": 1200,
        "height": 1200,
        "shapes": [
            { 
                angles: [30,150,30,150],
                lengthes: [100,100,100,100]
            }/*,
             { 
                angles: [30,150,30,150],
                lengthes: [100,100,100,100]
            },
            { 
                angles: [90,90,90,90],
                lengthes: [100,100,100,100]
            },
            { 
                angles: [60,60,60],
                lengthes: [100,100,100]
            },*/
        ]
    };
    updateConfig();
    let contentList = []; 

    let polygonList = [];
    for (let si=0;si<config.shapes.length;si++) {
        let pointList = [];
        let org = [1,0];
        let xy = [0,0];
        for (var ai=0;ai<config.shapes[si].angles.length;ai++) {
            var angle = config.shapes[si].angles[ai];
            var length = config.shapes[si].lengthes[ai];
            let XY = rotatescale(xy,org,angle,length);
            pointList.push(XY.join(' '));
            org = xy.concat([]);
            xy = XY.concat([])
        }
        polygonList.push(`<polygon points="${pointList.join(',')}" />`);
    }
    contentList.push(polygonList.join(''));

    let html = `<svg width="${config.width}" height="${config.height}">${contentList.join('')}</svg>`;
    document.currentScript.insertAdjacentHTML('afterend',html);

    function rotatescale(src,dest,degree,scale) {
        let radian = (degree/180)*Math.PI;
        let dir = [dest[0]-src[0], dest[1]-src[1]];
        console.log(dir);
        let cr = Math.cos(radian);
        let sr = Math.sin(radian);
        let x = dir[0]*cr - dir[1]*sr;
        let y = dir[0]*sr + dir[1]*cr;
        let norm = Math.sqrt(x*x+y*y);
        return [
            src[0] + x*scale/norm,
            src[1] + y*scale/norm 
        ];
    }
    function updateConfig () {
        let jsonStr = document.currentScript.textContent.trim();
        if (jsonStr.length>0) {
            let tmp = JSON.parse(jsonStr);
            for (var tk in tmp) {
                config[tk] = tmp[tk];
            }
        }
    }
})(document,window,console);