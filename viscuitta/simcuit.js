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
        rotateBase: {},
        initCenterX: {},
        initCenterY: {},
        currentCenterX: {},
        currentCenterY: {},
        centerState: {},
        state: {}
    }
};
document.currentScript.insertAdjacentHTML('afterend', `<svg width="1000" height="1000"></svg>`);
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
    let ret = {};
    let ctrlTarget = ev.target;
    let scaleBase = config.ctrlable.scaleBase[id];
    let cx = config.draggable.currentX[id];
    let cy = config.draggable.currentY[id];
    let ctrlType = ctrlTarget.getAttribute('ctrl');
    if (ctrlType === 'bbox22') {
        let xx = (cx + config.bbox.centerX[id] * scaleBase - (ev.clientX - 10));
        let yy = (cy + config.bbox.centerY[id] * scaleBase - ev.clientY);
        ret.rotate = Math.atan2(-xx, yy) * 180 / Math.PI;
        ret.type = 'rotate';
    } else if (ctrlType === 'bbox33') {
        ret.type = 'center';
    } else {
        ret.type = 'scale';
        let ctx = config.ctrlable.currentCenterX[id];
        let cty = config.ctrlable.currentCenterY[id];
        let dx = (ev.clientX - (cx + ctx * scaleBase));
        let dy = (ev.clientY - (cy + cty * scaleBase));
        ret.dist = Math.max(Math.abs(dx), Math.abs(dy));
    }
    return ret;
}
function enlarge(ev) {
    let ctrlObj = ev.target;
    if (ctrlObj.tagName === 'rect') {
        let x = parseInt(ctrlObj.getAttribute('x'), 10) - config.bbox.large;
        let y = parseInt(ctrlObj.getAttribute('y'), 10) - config.bbox.large;
        let width = parseInt(ctrlObj.getAttribute('width'), 10) + config.bbox.large * 2;
        let height = parseInt(ctrlObj.getAttribute('height'), 10) + config.bbox.large * 2;
        ctrlObj.setAttribute('x', x);
        ctrlObj.setAttribute('y', y);
        ctrlObj.setAttribute('width', width);
        ctrlObj.setAttribute('height', height);
    } else {
        let r = parseInt(ctrlObj.getAttribute('r'), 10) + config.bbox.large;
        ctrlObj.setAttribute('r', r);
    }
    ctrlObj.setAttribute('style', 'fill:rgba(0,0,0,0);stroke:rgba(0,0,0,0);');
}
function ensmall(ev) {
    let ctrlObj = ev.target;
    if (ctrlObj.tagName === 'rect') {
        let x = parseInt(ctrlObj.getAttribute('x'), 10) + config.bbox.large;
        let y = parseInt(ctrlObj.getAttribute('y'), 10) + config.bbox.large;
        let width = parseInt(ctrlObj.getAttribute('width'), 10) - config.bbox.large * 2;
        let height = parseInt(ctrlObj.getAttribute('height'), 10) - config.bbox.large * 2;
        if (width < 0 || height < 0) {
            return;
        }
        ctrlObj.setAttribute('x', x);
        ctrlObj.setAttribute('y', y);
        ctrlObj.setAttribute('width', width);
        ctrlObj.setAttribute('height', height);
    } else {
        let r = parseInt(ctrlObj.getAttribute('r'), 10) % config.bbox.large;
        ctrlObj.setAttribute('r', r);
    }
    ctrlObj.setAttribute('style', 'fill:#11aaff;stroke:#ffffff;');
}
function log() {
    let id = 'obj0';
    let cx = config.draggable.currentX[id];
    let cy = config.draggable.currentY[id];
    let ix = config.draggable.initX[id];
    let iy = config.draggable.initY[id];
    let rb = config.ctrlable.rotateBase[id];
    let isb = config.ctrlable.initScaleBase[id];
    let sb = config.ctrlable.scaleBase[id];
    let ctx = config.ctrlable.currentCenterX[id];
    let cty = config.ctrlable.currentCenterY[id];
    let ictx = config.ctrlable.initCenterX[id];
    let icty = config.ctrlable.initCenterY[id];

    return ('c=(' + cx + ' ' + cy + ') i=(' + ix + ' ' + iy + ') ct=(' + ctx + ',' + cty + ') ict=(' + ictx + ' ' + icty + ') rb=' + rb + ' sb=' + sb + ' isb=' + isb);
}
let ctrlableList = svg.querySelectorAll('.bbox_ctrl_large'); {
    for (let ci = 0; ci < ctrlableList.length; ci++) {
        let ctrlable = ctrlableList[ci];
        ctrlable.addEventListener('mousedown', function (ev) {
            let target = ev.target.parentNode.parentNode.parentNode;
            let id = target.id;
            if (!(id in config.draggable.state)) {
                config.draggable.state[id] = false;
                config.draggable.initX[id] = 0;
                config.draggable.initY[id] = 0;
                let cxy = getTranslate(target);
                config.draggable.currentX[id] = cxy[0];
                config.draggable.currentY[id] = cxy[1];
            }
            if (!(id in config.ctrlable.scaleBase)) {
                config.ctrlable.scaleBase[id] = 1.0;
            }
            if (!(id in config.ctrlable.rotateBase)) {
                config.ctrlable.rotateBase[id] = 0.0;
            }
            let info = getCtrlInfo(ev, id);
            if (info.type === 'scale') {
                config.ctrlable.initScaleBase[id] = info.dist;
            } else if (info.type === 'center') {
                if (!(id in config.ctrlable.centerState)) {
                    config.ctrlable.initCenterX[id] = ev.clientX;
                    config.ctrlable.initCenterY[id] = ev.clientY;
                    config.ctrlable.currentCenterX[id] = 0;
                    config.ctrlable.currentCenterY[id] = 0;
                    config.ctrlable.centerState[id] = true;
                } else if (!config.ctrlable.centerState[id]) {
                    config.ctrlable.initCenterX[id] = ev.clientX - config.ctrlable.currentCenterX[id];
                    config.ctrlable.initCenterY[id] = ev.clientY - config.ctrlable.currentCenterY[id];
                    config.ctrlable.centerState[id] = true;
                }
                config.ctrlable.centerState[id] = true;
            }
            config.ctrlable.state[id] = true;
            // TODO: multiselect
            for (let sk in config.ctrlable.state) {
                config.ctrlable.state[sk] = (sk === id);
            }
            enlarge(ev);
        }, false);
        ctrlable.addEventListener('mousemove', function (ev) {
            let target = ev.target.parentNode.parentNode.parentNode;
            let id = target.id;
            if (!(id in config.ctrlable.state) || !config.ctrlable.state[id]) {
                return;
            }
            let info = getCtrlInfo(ev, id);
            if (info.type === 'center') {
                if (!config.ctrlable.centerState[id]) {
                    return;
                }
                let ctx = ev.clientX - config.ctrlable.initCenterX[id];
                let cty = ev.clientY - config.ctrlable.initCenterY[id];
                config.ctrlable.currentCenterX[id] = ctx;
                config.ctrlable.currentCenterY[id] = cty;
                // TODO
                let cxy = [ctx + config.bbox.centerX[id], cty + config.bbox.centerY[id]];

                setCenter(target, cxy);
                let centerList = target.querySelectorAll('circle[ctrl="bbox33"]');
                for (let ci = 0; ci < centerList.length; ci++) {
                    // TODO:
                    setTranslate(centerList[ci].parentNode, [ctx, cty]);
                }
            } else if (info.type === 'rotate') {
                let rotate = info.rotate;
                setRotate(target, rotate);
            } else if (info.type === 'scale') {
                let scale = info.dist / config.ctrlable.initScaleBase[id] * config.ctrlable.scaleBase[id];

                //console.log('dist:' + info.dist + ' ' + config.ctrlable.initScaleBase[id] + ' ' + config.ctrlable.scaleBase[id]);

                setScale(target, [scale, scale]);

                let cx = config.draggable.currentX[id];
                let cy = config.draggable.currentY[id];
                setTranslate(target, [cx, cy]);
            }
        }, false);
        let mouseupout = function (ev) {
            let target = ev.target.parentNode.parentNode.parentNode;
            let id = target.id;
            if (!(id in config.ctrlable.state)) {
                return;
            }
            config.ctrlable.state[id] = false;
            config.ctrlable.centerState[id] = false;
            let scale = getScale(target);
            config.ctrlable.scaleBase[id] = scale[0];
            let rotate = getRotate(target);
            config.ctrlable.rotateBase[id] = rotate;
            ensmall(ev);
            updateTranslate(target,id);
            console.log(log());
        }
        ctrlable.addEventListener('mouseup', mouseupout, false);
        ctrlable.addEventListener('mouseout', mouseupout, false);
    }
}
function updateTranslate(target,id) {
    let dxy = getTranslate(target);
    config.draggable.currentX[id] = dxy[0];
    config.draggable.currentY[id] = dxy[1];
}
let draggableList = svg.querySelectorAll('.draggable'); {
    // STATUS: draggable OK
    // TODO: make transparent large cover in case of mouseout
    // draggable
    // http://www.petercollingridge.co.uk/interactive-svg-components/draggable-svg-element

    for (let di = 0; di < draggableList.length; di++) {
        let draggable = draggableList[di];
        draggable.addEventListener('dblclick', function (ev) {
            let target = ev.target.parentNode.parentNode;
            let id = target.id;
            let bbox = target.querySelector('.bbox');
            bbox.setAttribute('style', 'display:inline;fill:none;stroke:#11aaff;stroke-width:1pt;');
            let ctrlList = target.querySelectorAll('.bbox_ctrl');
            for (let ci = 0; ci < ctrlList.length; ci++) {
                let ctrl = ctrlList[ci];
                ctrl.setAttribute('style', 'display:inline;fill:#11aaff;stroke:#ffffff;stroke-width:1pt;');
            }
        }, false);
        draggable.addEventListener('mousedown', function (ev) {
            let target = ev.target.parentNode.parentNode;
            let id = target.id;
            if (!(id in config.draggable.state)) {
                let cxy = getTranslate(target);
                config.draggable.initX[id] = -cxy[0]+ev.clientX;
                config.draggable.initY[id] = -cxy[1]+ev.clientY;
                config.draggable.currentX[id] = cxy[0];
                config.draggable.currentY[id] = cxy[1];
                config.draggable.state[id] = true;
            } else if (!config.draggable.state[id]) {
                config.draggable.initX[id] = ev.clientX - config.draggable.currentX[id];
                config.draggable.initY[id] = ev.clientY - config.draggable.currentY[id];
                config.draggable.state[id] = true;
            }
            // TODO: multiselect
            for (let sk in config.draggable.state) {
                config.draggable.state[sk] = (sk === id);
            }
        }, false);
        draggable.addEventListener('mousemove', function (ev) {
            let target = ev.target.parentNode.parentNode;
            let id = target.id;
            if (!(id in config.draggable.state) || !config.draggable.state[id]) {
                return;
            }
            let dx = ev.clientX - config.draggable.initX[id];
            let dy = ev.clientY - config.draggable.initY[id];
            config.draggable.currentX[id] = dx;
            config.draggable.currentY[id] = dy;
            setTranslate(target, [dx, dy]);
        }, false);
        let mouseupout = function (ev) {
            let target = ev.target.parentNode.parentNode;
            let id = target.id;
            if (!(id in config.draggable.state)) {
                return;
            }
            config.draggable.state[id] = false;
            console.log(log());
        };
        draggable.addEventListener('mouseup', mouseupout, false);
        draggable.addEventListener('mouseout', mouseupout, false);
    }
}
function createObject(svg, objectStr) {
    let id = config.id++;
    let objid = 'obj' + id;
    let transform = 'translate(0,0)translate(0,0)rotate(0)scale(1,1)translate(0,0)';
    svg.insertAdjacentHTML('beforeend', `<g id="${objid}" transform="${transform}"><g id="adj${id}" transform="${transform}">${objectStr}</g></g>`);
    let obj = svg.querySelector(`g#obj${id}`);
    let bbox = obj.getBBox();
    let x = bbox.x;
    let y = bbox.y;
    let width = bbox.width;
    let height = bbox.height;
    config.bbox.width[objid] = width;
    config.bbox.height[objid] = height;
    config.bbox.centerX[objid] = width / 2;
    config.bbox.centerY[objid] = height / 2;

    let adj = obj.querySelector(`g#adj${id}`);
    let mv = [-x-config.bbox.centerX[objid],-y-config.bbox.centerY[objid]];
    setTranslate(adj,mv);
    setTranslate(obj,[-mv[0],-mv[1]]);
    console.log(mv);
    updateTranslate(obj,id);
    config.ctrlable.initCenterX[objid] = config.bbox.centerX[objid];
    config.ctrlable.initCenterY[objid] = config.bbox.centerY[objid];
    config.ctrlable.currentCenterX[objid] = 0;
    config.ctrlable.currentCenterY[objid] = 0;
    let ctx = config.bbox.centerX[objid];
    let cty = config.bbox.centerY[objid];
    let top = -25;
    adj.insertAdjacentHTML('afterbegin', `<rect class="bbox" style="display:none;" x="${x}" y="${y}" width="${width}" height="${height}"/>`);
    let size = config.bbox.size;
    adj.insertAdjacentHTML('beforeend', `
        <g><rect class="bbox_ctrl" style="display:none;" x="${x}" y="${y}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl" style="display:none;" x="${x}" y="${y + height - size}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl" style="display:none;" x="${x + width - size}" y="${y}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl" style="display:none;" x="${x + width - size}" y="${y + height - size}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl bbox_ctrl_large" ctrl="bbox00" style="display:none;" x="${x}" y="${y}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl bbox_ctrl_large" ctrl="bbox01" style="display:none;" x="${x}" y="${y + height - size}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl bbox_ctrl_large" ctrl="bbox10" style="display:none;" x="${x + width - size}" y="${y}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl bbox_ctrl_large" ctrl="bbox11" style="display:none;" x="${x + width - size}" y="${y + height - size}" width="${size}" height="${size}"/></g>
        <g><rect class="bbox_ctrl" style="display:none;" x="${x + width / 2 - 2}" y="${y + top}" width="${3}" height="${-top - 1}" /></g>
        <g><circle class="bbox_ctrl" style="display:none;" cx="${x + width / 2}" cy="${y + top}" r="${size / 2}"/></g>
        <g><circle class="bbox_ctrl bbox_ctrl_large" ctrl="bbox22" style="display:none;" cx="${x + width / 2}" cy="${y + top}" r="${size / 2}"/></g>
        <g transform="${transform}"><circle class="bbox_ctrl" ctrl="bbox33" style="display:none;" cx="${x + cty}" cy="${y + cty}" r="${size / 2}"/></g>
        <g transform="${transform}"><circle class="bbox_ctrl bbox_ctrl_large" ctrl="bbox33" style="display:none;" cx="${x + ctx}" cy="${y + cty}" r="${size / 2}"/></g>
    `);
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
    /*
    if (mat.center[0] === 0 && mat.center[1] === 0) {
        return calcCenter(polygon);
    }*/
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
