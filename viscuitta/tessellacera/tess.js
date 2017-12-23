'use strict';
let Tess = (function (console, document) {

    let symbols = [];
    let uses = {};
    let useHash = {};
    let svgdiv = null;
    return {
        init: init,
        getSymbols: function () { return symbols.join(''); },
        makePath: makePath,
        getUses: function (base) {
            if (typeof (base) === 'undefined') {
                base = '_';
            }
            console.dir(uses);
            return uses[base].join('');
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
        symbols.length = 0;
        for (let key in uses) {
            uses[key].length = 0;
            delete uses[key];
        }
        for (let key in useHash) {
            delete useHash[key];
        }
        if (!(document.querySelector('svg.tmp'))) {
            document.body.insertAdjacentHTML('beforeend','<svg class="tmp"></svg>')
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
        return `<path d="${pathStr}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" vectorEffect: "non-scaling-stroke"/>`;
    }
    function register(name, svgstr) {
        let tmp = document.querySelector('svg.tmp');
        tmp.innerHTML = svgstr;
        let bbox = tmp.querySelector('path').getBBox();
        tmp.innerHTML = '';
        let eps = 10;
        bbox.x += -eps;
        bbox.y += -eps;
        bbox.width += 2*eps;
        bbox.height += 2*eps; 
        symbols.push(`<symbol id="${name}" viewbox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">${svgstr}</symbol>`);
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