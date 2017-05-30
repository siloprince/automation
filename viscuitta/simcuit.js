'use strict';
var config = {
    bbox: {
        size: 10,
        large: 2000,
        width: {},
        height: {},
        centerX: {},
        centerY: {},
    },
    id: 0,
    draggable: {
        currentX: {},
        currentY: {},
        initX: {},
        initY: {},
        state: {}
    },
    ctrlable: {
        initScaleBase: {},
        scaleBase: {},
        initRotateBase: {},
        rotateBase: {},
        state: {}
    }
};
document.currentScript.insertAdjacentHTML('afterend', `<svg width="600" height="600"></svg>`);
let svg = document.querySelector('svg');
// TODO: in case of cx!=100, cy!=100 

createObject(svg, `<circle class="draggable" r="100" cx="100" cy="100"/>`);

// objectives 
// * make a megane
// * make a drawing tool (out of scope)
// http://www.drawsvg.org/
// * place objects on megane
// * translate, scale, rotate objects on both sides
// http://interactjs.io/
// * distill the relation
// finally make this with webcomponent

// change mouse cursor
// https://tympanus.net/Development/ElasticSVGElements/drag.html

function getCtrlInfo(ev, id) {
    let ctrlTarget = ev.target;
    let ctrlType = ctrlTarget.getAttribute('ctrl');
    let scaleBase =config.ctrlable.scaleBase[id];
    let cx = config.draggable.currentX[id];
    let cy = config.draggable.currentY[id];
    let dx, dy;
    let rot=0;
    if (ctrlType === 'bbox00') {
        dx = (cx + config.bbox.width[id]*scaleBase - ev.clientX);
        dy = (cy + config.bbox.height[id]*scaleBase - ev.clientY);
    } else if (ctrlType === 'bbox01') {
        dx = (cx + config.bbox.width[id]*scaleBase - ev.clientX);
        dy = (ev.clientY - cy);
    } else if (ctrlType === 'bbox10') {
        dx = (ev.clientX - cx);
        dy = (cy + config.bbox.height[id]*scaleBase - ev.clientY);
    } else if (ctrlType === 'bbox11') {
        dx = (ev.clientX - cx);
        dy = (ev.clientY - cy);
    } else if (ctrlType === 'bbox22') {
        rot = 0;
    }
    //console.log(scaleBase+' '+dx+' '+dy);
    let dist = dx;
    if (dx <dy) {
        dist = dy;
    }
    return { dist: dist, rot: rot};
}
function enlarge(ev) {
    let ctrlObj = ev.target;
    let x = parseInt(ctrlObj.getAttribute('x'), 10) - config.bbox.large;
    let y = parseInt(ctrlObj.getAttribute('y'), 10) - config.bbox.large;
    let width = parseInt(ctrlObj.getAttribute('width'), 10) + config.bbox.large * 2;
    let height = parseInt(ctrlObj.getAttribute('height'), 10) + config.bbox.large * 2;
    ctrlObj.setAttribute('x', x);
    ctrlObj.setAttribute('y', y);
    ctrlObj.setAttribute('width', width);
    ctrlObj.setAttribute('height', height);
    ctrlObj.setAttribute('style', 'fill:rgba(0,0,0,0);stroke:rgba(0,0,0,0);');
}
function ensmall(ev) {
    let ctrlObj = ev.target;
    let x = parseInt(ctrlObj.getAttribute('x'), 10) + config.bbox.large;
    let y = parseInt(ctrlObj.getAttribute('y'), 10) + config.bbox.large;
    let width = parseInt(ctrlObj.getAttribute('width'), 10) - config.bbox.large * 2;
    let height = parseInt(ctrlObj.getAttribute('height'), 10) - config.bbox.large * 2;
    ctrlObj.setAttribute('x', x);
    ctrlObj.setAttribute('y', y);
    ctrlObj.setAttribute('width', width);
    ctrlObj.setAttribute('height', height);
    ctrlObj.setAttribute('style', 'fill:#aaaaaa;stroke:#aaaaaa;');
}
function log(){
    let id = 'obj0';
    let cx = config.draggable.currentX[id];
    let cy = config.draggable.currentY[id];
    let ix = config.draggable.initX[id];
    let iy = config.draggable.initY[id];
    let irb = config.ctrlable.initRotateBase[id];
    let rb = config.ctrlable.rotateBase[id];
    let isb = config.ctrlable.initScaleBase[id];
    let sb = config.ctrlable.scaleBase[id];

    return('c=('+cx+' '+cy+') i=('+ix+' '+iy+') rb='+rb+' irb='+irb+' sb='+sb+' isb='+isb);
}
let ctrlableList = svg.querySelectorAll('.bbox_ctrl_large');
for (let ci = 0; ci < ctrlableList.length; ci++) {
    let ctrlable = ctrlableList[ci];
    ctrlable.addEventListener('mousedown', function (ev) {
        let target = ev.target.parentNode.parentNode;
        let id = target.id;
        if (!(id in config.draggable.state)) {
            config.draggable.state[id] = false;
            config.draggable.initX[id] = 0;
            config.draggable.initY[id] = 0;
            config.draggable.currentX[id] = 0;
            config.draggable.currentY[id] = 0;
        }
        if (!(id in config.ctrlable.scaleBase)) {
            config.ctrlable.scaleBase[id] = 1.0;
        }
        if (!(id in config.ctrlable.rotateBase)) {
            config.ctrlable.rotateBase[id] = 0.0;
        }
        enlarge(ev);
        let info = getCtrlInfo(ev, id);
        config.ctrlable.initScaleBase[id] = info.dist;
        // TODO:
        config.ctrlable.initRotateBase[id] = 0.0;
        config.ctrlable.state[id] = true;
        // TODO: multiselect
        for (let sk in config.ctrlable.state) {
            config.ctrlable.state[sk] = (sk === id);
        }
    }, false);
    ctrlable.addEventListener('mousemove', function (ev) {
        let target = ev.target.parentNode.parentNode;
        let id = target.id;
        if (!config.ctrlable.state[id]) {
            return;
        }
        let info = getCtrlInfo(ev, id);
        let scale = info.dist / config.ctrlable.initScaleBase[id] * config.ctrlable.scaleBase[id];
        setScale(target, [scale, scale]);

        // TODO:
        let rotate = 0.0;
        setRotate(target,rotate);

        let dxy = config.ctrlable.initScaleBase[id] - info.dist;
        let ctrlType = ev.target.getAttribute('ctrl');
        let cx = config.draggable.currentX[id];
        let cy = config.draggable.currentY[id];
        if (ctrlType === 'bbox00') {
            setTranslate(target, [cx+dxy, cy+dxy]);
        } else if (ctrlType === 'bbox01') {
            setTranslate(target, [cx+dxy, cy+0]);
        } else if (ctrlType === 'bbox10') {
            setTranslate(target, [cx+0, cy+dxy]);
        } else if (ctrlType === 'bbox11') {
            setTranslate(target, [cx+0, cy+0]);
        } else if (ctrlType === 'bbox22') {
            setTranslate(target, [cx+0, cy+0]);
        }
    }, false);
    ctrlable.addEventListener('mouseup', function (ev) {
        let target = ev.target.parentNode.parentNode;
        let id = target.id;
        config.ctrlable.state[id] = false;
        
        let xy=getTranslate(target);
        let ctrlType = ev.target.getAttribute('ctrl');
        if (ctrlType === 'bbox00') {
            config.draggable.currentX[id] = xy[0];
            config.draggable.currentY[id] = xy[1];
        } else if (ctrlType === 'bbox01') {
            config.draggable.currentX[id] = xy[0];
        } else if (ctrlType === 'bbox10') {
            config.draggable.currentY[id] = xy[1];
        } else if (ctrlType === 'bbox11') {
            // nop
        } else if (ctrlType === 'bbox22') {
            // nop
        }
        let scale=getScale(target);
        config.ctrlable.scaleBase[id]=scale[0];
        // TODO:
        let rotate=getRotate(target);
        config.ctrlable.rotateBase[id]=rotate;
        ensmall(ev);
    }, false);
}

let draggableList = svg.querySelectorAll('.draggable');
// STATUS: draggable OK
// TODO: make transparent large cover in case of mouseout
// draggable
// http://www.petercollingridge.co.uk/interactive-svg-components/draggable-svg-element

for (let di = 0; di < draggableList.length; di++) {
    let draggable = draggableList[di];
    draggable.addEventListener('dblclick', function (ev) {
        let target = ev.target.parentNode;
        let id = target.id;
        let bbox = target.querySelector('.bbox');
        bbox.setAttribute('style', 'display:inline;fill:none;stroke:#aaaaaa;stroke-width:2pt;');
        let ctrlList = target.querySelectorAll('.bbox_ctrl');
        for (let ci = 0; ci < ctrlList.length; ci++) {
            let ctrl = ctrlList[ci];
            ctrl.setAttribute('style', 'display:inline;fill:#aaaaaa;stroke:#aaaaaa;stroke-width:2pt;');
        }
    }, false);
    draggable.addEventListener('mousedown', function (ev) {
        let target = ev.target.parentNode;
        let id = target.id;
        if (!(id in config.draggable.state)) {
            config.draggable.initX[id] = ev.clientX;
            config.draggable.initY[id] = ev.clientY;
            config.draggable.currentX[id] = 0;
            config.draggable.currentY[id] = 0;
            config.draggable.state[id] = true;
        } else if (!config.draggable.state[id]) {
            config.draggable.initX[id] = ev.clientX-config.draggable.currentX[id];
            config.draggable.initY[id] = ev.clientY-config.draggable.currentY[id];
            config.draggable.state[id] = true;
        }
        // TODO: multiselect
        for (let sk in config.draggable.state) {
            config.draggable.state[sk] = (sk === id);
        }
    }, false);
    draggable.addEventListener('mousemove', function (ev) {
        let target = ev.target.parentNode;
        let id = target.id;
        if (!config.draggable.state[id]) {
            return;
        }
        let dx = ev.clientX - config.draggable.initX[id];
        let dy = ev.clientY - config.draggable.initY[id];
        config.draggable.currentX[id] = dx;
        config.draggable.currentY[id] = dy;
        setTranslate(target, [dx, dy]);
    }, false);
    let mouseupout = function (ev) {
        let target = ev.target.parentNode;
        let id = target.id;
        config.draggable.state[id] = false;
    }
    draggable.addEventListener('mouseup',mouseupout, false);
    draggable.addEventListener('mouseout',mouseupout, false);
}
function createObject(svg, objectStr) {
    let id = config.id++;
    let objid = 'obj' + id;
    let transform = 'translate(0,0)translate(0,0)rotate(0)scale(1,1)translate(0,0)';
    svg.insertAdjacentHTML('beforeend', `<g id="${objid}" transform="${transform}">${objectStr}</g>`);
    let obj = svg.querySelector(`g#obj${id}`);
    let bbox = obj.getBBox();
    let x = bbox.x;
    let y = bbox.y;
    let width = bbox.width;
    let height = bbox.height;
    let top = -25;
    config.bbox.width[objid] = width;
    config.bbox.height[objid] = height;
    config.bbox.centerX[objid] = width/2;
    config.bbox.centerY[objid] = height/2;
    obj.insertAdjacentHTML('afterbegin', `<rect class="bbox" style="display:none;" x="${x}" y="${y}" width="${width}" height="${height}"/>`);
    let size = config.bbox.size;
    obj.insertAdjacentHTML('beforeend', `
        <g><rect class="bbox_ctrl" style="display:none;" x="${x}" y="${y}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl" style="display:none;" x="${x}" y="${y+height - size}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl" style="display:none;" x="${x+width - size}" y="${y}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl" style="display:none;" x="${x+width - size}" y="${y+height - size}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl bbox_ctrl_large" ctrl="bbox00" style="display:none;" x="${x}" y="${y}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl bbox_ctrl_large" ctrl="bbox01" style="display:none;" x="${x}" y="${y+height - size}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl bbox_ctrl_large" ctrl="bbox10" style="display:none;" x="${x+width - size}" y="${y}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl bbox_ctrl_large" ctrl="bbox11" style="display:none;" x="${x+width - size}" y="${y+height - size}" width="${size}" height="${size}"/></g>
        <g><line class="bbox_ctrl" style="display:none;" x1="${x+width/2}" y1="${y+top}" x2="${x+width/2}" y2="${y}" /></g>
        <g><circle class="bbox_ctrl" style="display:none;" cx="${x+width/2}" cy="${y+top}" r="${size/2}"/></g>
        <g><circle class="bbox_ctrl bbox_ctrl_large" ctrl="bbox22" style="display:none;" cx="${x+width/2}" cy="${y+top}" r="${size/2}"/></g>
    `);
}
// rotate by drag
// http://jsfiddle.net/PbKYn/5/
// Returns radians
function angleBetweenPoints(p1, p2) {
    if (p1[0] == p2[0] && p1[1] == p2[1])
        return Math.PI / 2;
    else
        return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}
function distanceBetweenPoints(p1, p2) {
    return Math.sqrt(Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[0] - p1[0], 2));
}
// TODO : more conv functions
function setTranslate(polygon, xy) {
    polygon.transform.baseVal.getItem(0).setTranslate(xy[0], xy[1]);
}
function setCenter(polygon, xy) {
    polygon.transform.baseVal.getItem(1).setTranslate(xy[0], xy[1]);
    polygon.transform.baseVal.getItem(4).setTranslate(-xy[0], -xy[1]);
}
function setScale(polygon, xy) {
    polygon.transform.baseVal.getItem(3).setScale(xy[0], xy[1]);
}
function setRotate(polygon, degree) {
    polygon.transform.baseVal.getItem(2).setRotate(degree, 0, 0);
}
function getTranslate(polygon) {
    let mat = decomposeMatrix(polygon.getCTM());
    return mat.translate;
}
function getScale(polygon) {
    let mat = decomposeMatrix(polygon.getCTM());
    return mat.scale;
}
function getRotate(polygon) {
    let mat = decomposeMatrix(polygon.getCTM());
    return mat.rotate;
}
function getCenter(polygon) {
    let mat = decomposeMatrix(polygon.getCTM());
    if (mat.center[0] === 0 && mat.center[1] === 0) {
        return calcCenter(polygon);
    }
    return mat.center;

    function calcCenter(polygon) {
        let pointsStr = polygon.getAttribute('points');
        let pointList = pointsStr.split(',');
        let sumx = 0;
        let sumy = 0;
        for (let pi = 0; pi < pointList.length; pi++) {
            let xy = pointList[pi].split(/\s+/);
            sumx += parseFloat(xy[0]);
            sumy += parseFloat(xy[1]);
        }
        return [sumx / pointList.length, sumy / pointList.length];
    }
}

function decomposeMatrix(matrix) {
    // @see https://gist.github.com/2052247

    // calculate delta transform point
    let px = deltaTransformPoint(matrix, { x: 0, y: 1 });
    let py = deltaTransformPoint(matrix, { x: 1, y: 0 });

    // calculate skew
    let skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
    let skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

    let cx = 0;
    let cy = 0;
    let base = (-matrix.a * matrix.d + matrix.a + matrix.b * matrix.c + matrix.d - 1);

    cx = ((matrix.d - 1) * matrix.e - matrix.c * matrix.f) / base;
    cy = ((matrix.a - 1) * matrix.f - matrix.b * matrix.e) / base;
    if (isNaN(cx)) {
        cx = 0;
        cy = 0;
    }
    return {
        translate: [
            matrix.e,
            matrix.f
        ],
        scale: [
            Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
            Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d)
        ],
        skew: [skewX, skewY],
        rotate: skewX,
        center: [cx, cy]
        // rotation is the same as skew x
    };
    function deltaTransformPoint(matrix, point) {

        let dx = point.x * matrix.a + point.y * matrix.c + 0;
        let dy = point.x * matrix.b + point.y * matrix.d + 0;
        return { x: dx, y: dy };
    }
}