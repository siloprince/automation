'use strict';
let Tess = (function (console, document) {

    let uses = {};
    let useHash = {};
    let svgdiv = null;
    return {
        init: init,
        makePath: makePath,
        getUses: function (base) {
            if (typeof (base) === 'undefined') {
                base = '_';
            }
            console.dir(uses);
            return uses[base].join('');
        },
        getUseFromHash: function (id) {
            return useHash[id];
        },
        register: register,
        placeUse: placeUse,
        svg: function (me, svgstr) {
            if (!svgdiv) {
                svgdiv = document.createElement('div');
                svgdiv.className = 'svg';
                me.parentElement.insertBefore(svgdiv, me.nextSibling);
            }
            svgdiv.innerHTML = svgstr;
        }
    };
    function init() {
        for (let key in uses) {
            uses[key].length = 0;
            delete uses[key];
        }
        for (let key in useHash) {
            delete useHash[key];
        }
        if (!(document.querySelector('svg.symbols'))) {
            document.body.insertAdjacentHTML('beforeend','<svg class="symbols"></svg>');
        } else {
            document.querySelector('svg.symbols').innerHTML = '';
        }
        if (!(document.querySelector('svg.tmp'))) {
            document.body.insertAdjacentHTML('beforeend','<svg class="tmp"></svg>');
        } else {
            document.querySelector('svg.tmp').innerHTML = '';
        }
    }
    function makePath(pathStrList,stroke,width,fill) {
        if (typeof(fill)==='undefined') {
            fill = 'none';
        }
        if (typeof(stroke)==='undefined') {
            stroke = '#000000';
        }
        if (typeof(width)==='undefined') {
            width = '2';
        }
        let pathStr = pathListMerge(pathStrList);
        return `<path d="${pathStr}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" vectorEffect="non-scaling-stroke"/>`;
    }
    function register(name, svgstr) {
        let symbols = document.querySelector('svg.symbols');
        let tmp = document.querySelector('svg.tmp');
        tmp.innerHTML = '<g class="bbox">'+svgstr+'</g>';
        
        let bbox = tmp.querySelector('g.bbox').getBBox();
        /*
        let children = tmp.childNodes;
        let bbox = {
            x: null,
            y: null,
            mx: null,
            my: null
        };
        for (let ci=0;ci<children.length;ci++) {
            let bb = children[ci].getBBox();
            if (bbox.x===null) {
                bbox.x = bb.x;
            }
            if (bbox.y===null) {
                bbox.y = bb.y;
            }
            let mx = bb.width+bb.x;
            if (bbox.mx===null) {
                bbox.mx = mx;
            }
            let my = bb.width+bb.x;
            if (bbox.my===null) {
                bbox.my = my;
            }
            if (bbox.x > bb.x ) {
                bbox.x = bb.x;
            }
            if (bbox.y > bb.y ) {
                bbox.y = bb.y;
            }
            if (bbox.mx < mx ) {
                bbox.mx = mx;
            }
            if (bbox.my < my ) {
                bbox.my = my;
            }
        }
        bbox.width = bbox.mx-bbox.x;
        bbox.height = bbox.my-bbox.y;
        */
        console.log(bbox);
        tmp.innerHTML = '';
        let eps = 10;
        bbox.x += -eps;
        bbox.y += -eps;
        bbox.width += 2*eps;
        bbox.height += 2*eps; 
        symbols.insertAdjacentHTML('beforeend',`<symbol id="${name}" viewbox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">${svgstr}</symbol>`);
        useHash[name] = `<use xlink:href="#${name}" width="${bbox.width}" height="${bbox.height}" x="${bbox.x}" y="${bbox.y}"/>`;
    }
    function placeUse(name, translate, rotate, scale, base) {
        if (typeof (translate) === 'undefined') {
            translate = [0, 0];
        }
        if (typeof (rotate) === 'undefined') {
            rotate = 0;
        }
        if (typeof (scale) === 'undefined') {
            scale = 1;
        }
        if (typeof (base) === 'undefined') {
            base = '_';
        }
        if (name in useHash) {
            if (!(base in uses)) {
                uses[base] = [];
            }
            uses[base].push(useHash[name].replace(/^<use /, `<use transform="translate(${translate[0]},${translate[1]})rotate(${rotate})scale(${scale})" `));
        }
    }
})(console, document);