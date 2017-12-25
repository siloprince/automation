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
            return uses[base].join('');
        },
        getUseFromHash: function (id) {
            return useHash[id];
        },
        register: register,
        placeUse: placeUse,
        substitute: substitute,
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
            document.body.insertAdjacentHTML('beforeend', '<svg class="symbols"></svg>');
        } else {
            document.querySelector('svg.symbols').innerHTML = '';
        }
        if (!(document.querySelector('svg.tmp'))) {
            document.body.insertAdjacentHTML('beforeend', '<svg class="tmp"></svg>');
        } else {
            document.querySelector('svg.tmp').innerHTML = '';
        }
    }
    function makePath(pathStrList, stroke, width, fill, opacity) {
        if (typeof (fill) === 'undefined') {
            fill = 'none';
        }
        if (typeof (stroke) === 'undefined') {
            stroke = '#000000';
        }
        if (typeof (width) === 'undefined') {
            width = '2';
        }
        if (typeof (opacity) === 'undefined') {
            opacity = '1';
        }
        let pathStr = pathListMerge(pathStrList);
        return `<path d="${pathStr}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" fill-opacity="${opacity}" vectorEffect="non-scaling-stroke"/>`;
    }
    function register(name, svgstr) {
        let symbols = document.querySelector('svg.symbols');
        let tmp = document.querySelector('svg.tmp');
        tmp.innerHTML = '<g class="bbox">' + svgstr + '</g>';

        let bbox = tmp.querySelector('g.bbox').getBBox();

        tmp.innerHTML = '';
        let eps = 0;
        bbox.x += -eps;
        bbox.y += -eps;
        bbox.width += 2 * eps;
        bbox.height += 2 * eps;
        symbols.insertAdjacentHTML('beforeend', `<symbol id="${name}" viewbox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">${svgstr}</symbol>`);
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
            scale = [1, 1];
        }
        if (typeof (base) === 'undefined') {
            base = '_';
        }
        if (name in useHash) {
            if (!(base in uses)) {
                uses[base] = [];
            }
            uses[base].push(useHash[name].replace(/^<use /, `<use transform="translate(${translate[0]},${translate[1]})rotate(${rotate})scale(${scale[0]},${scale[1]})" `));
        }
    }
    function substitute(size, name, transformed, ex) {
        let last_name;
        for (let si = 0; si < size; si++) {
            let level = 1 + si;
            let _name = name + '_' + level;
            if (si === 0) {
                Tess.register(_name, Tess.makePath(transformed));
                Tess.placeUse(_name, [0, 0], 0, [1, 1], _name);
            } else {
                expand({ level: level, len: 100, name: last_name, name2: _name, ex: ex });
                Tess.register(_name, Tess.getUses(_name));
            }
            last_name = _name;
        }
        return last_name;

        function expand(opt, _end) {
            if (!('x' in opt)) {
                opt.x = 0;
            }
            if (!('y' in opt)) {
                opt.y = 0;
            }
            if (!('dx' in opt)) {
                opt.dx = 0;
            }
            if (!('dy' in opt)) {
                opt.dy = 0;
            }
            if (!('rot' in opt)) {
                opt.rot = 0;
            }
            if (!('dr' in opt)) {
                opt.dr = 0;
            }

            let scale = Math.pow(2, opt.level - 2);
            let len = opt.len * opt.scale;
            let x = opt.x + len * opt.dx;
            let y = opt.y + len * opt.dy;
            let rot = opt.rot + opt.dr;
            if (_end) {
                Tess.placeUse(opt.name, [x, y], rot, [1, 1], opt.name2);
                return;
            }
            let _opt = dupOpt(opt, { x: x, y: y, rot: rot, scale: scale });
            let end = true;

            for (let ei = 0; ei < opt.ex.length; ei++) {
                expand(dupOpt(_opt, opt.ex[ei]), end);
            }
        }
        function dupOpt(_opt, update) {
            let opt = JSON.parse(JSON.stringify(_opt));
            for (let key in update) {
                opt[key] = update[key];
            }
            return opt;
        }

    }
})(console, document);