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
            let XY = nextPoint(xy,org,angle,length);
            pointList.push(XY.join(' '));
            org = xy.concat([]);
            xy = XY.concat([]);
        }
        polygonList.push(`<polygon class="touchSensor" points="${pointList.join(',')}" />`);
    }
    contentList.push(polygonList.join(''));

    let html = `<svg width="${config.width}" height="${config.height}">${contentList.join('')}</svg>`;
    document.currentScript.insertAdjacentHTML('afterend',html);

    let svg = document.currentScript.nextSibling;
    let polygons = svg.querySelectorAll('polygon.touchSensor');
    for (let pi=0;pi<polygons.length;pi++) {
        let center = calcCenter(polygons[pi]);
        setCenter(polygons[pi],center);
        polygons[pi].addEventListener('click',function(ev) {
            let target = ev.target;
            console.log(target.transform);
            target.transform.baseVal.getItem(0).setScale(1,1);
            let degree = getRotate(target);
            degree += 10;
            setRotate(target,degree);
        },false);
        // TODO : support drag
    }
    // TODO : more conv functions
    function setCenter (polygon,xy) {
        let transform = polygon.getAttribute('transform');
        if (/translate\s*\(([^\)]+)\)rotate\s*\(([^\)]+)\)/.test(transform)) {
            transform = transform.replace(/translate\s*\([^\)]+\)rotate/,`translate(${xy.join(',')})rotate`);
            transform = transform.replace(/translate\s*\([^\)]+\)\s*$/,`translate(${negate(xy).join(',')})`);
        } else {
            transform = `translate(0,0)translate(${xy.join(',')})rotate(0)scale(1,1)translate(${negate(xy).join(',')})`;
        }
        polygon.setAttribute('transform',transform);
    }
    function setScale (polygon,xy) {
        let transform = polygon.getAttribute('transform');
        if (/scale\s*\([^\)]+\)/.test(transform)) {
            transform = transform.replace(/scale\s*\([^\)]+\)/,`scale(${xy.join(',')})`);
        } else {
            transform = `translate(0,0)translate(0,0)rotate(0)scale(${xy.join(',')})translate(0,0)`;
        }
        polygon.setAttribute('transform',transform);
    }
    function setRotate (polygon,degree,center) {
        let transform = polygon.getAttribute('transform');
        if (/rotate\s*\([^\)]+\)/.test(transform)) {
            transform = transform.replace(/rotate\s*\([^\)]+\)/,`rotate(${degree})`);
        } else {
            transform = `translate(0,0)translate(0,0)rotate(${degree})scale(1,1)translate(0,0)`;
        }
        polygon.setAttribute('transform',transform);
    }
    function getCenter (polygon) {
        let transform = polygon.getAttribute('transform');
        let centerStr = '0,0';
        if (/translate\s*\(([^\)]+)\)rotate\s*\(([^\)]+)\)/.test(transform)) {
            centerStr = RegExp.$1;
        }
        let center = centerStr = split(',');
        let xy = [
            parseFloat(center[0]),
            parseFloat(center[1])
        ];
        return xy;
    }  
    function getScale (polygon) {
        let transform = polygon.getAttribute('transform');
        let scaleStr = '1,1';
        if (/scale\s*\(([^\)]+)\)/.test(transform)) {
            scaleStr = RegExp.$1;
        }
        let scale = scaleStr = split(',');
        let xy = [
            parseFloat(scale[0]),
            parseFloat(scale[1])
        ];
        return xy;
    }  
    function getRotate (polygon) {
        let transform = polygon.getAttribute('transform');
        let degree = 0;
        if (/rotate\s*\(([^\)]+)\)/.test(transform)) {
            degree = RegExp.$1;
            degree = parseFloat(degree);
        }
        return degree;
    }
    function negate(xy){
        return [-xy[0],-xy[1]];
    }
    function calcCenter(polygon) {
        let pointsStr = polygon.getAttribute('points');
        let pointList = pointsStr.split(',');
        let sumx = 0;
        let sumy = 0;
        for (let pi=0;pi<pointList.length;pi++) {
            let xy = pointList[pi].split(/\s+/);
            sumx += parseFloat(xy[0]);
            sumy += parseFloat(xy[1]);
        }
        return [sumx/pointList.length, sumy/pointList.length];
    }
    function nextPoint(src,dest,degree,scale) {
        let radian = (degree/180)*Math.PI;
        let dir = [dest[0]-src[0], dest[1]-src[1]];
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