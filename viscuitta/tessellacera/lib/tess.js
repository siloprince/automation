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
        place: place,
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
    function place(name, transform, base) {
        if (!(name in useHash)) {
            return;
        }
        let usestr = useHash[name];
        if (typeof (base) === 'undefined') {
            base = '_';
        }
        // TODO: transform to be recursive
        let ctx, cty, cr, csx, csy;
        let ptx, pty, pr, psx, psy;
        let xform, pform;
        if (typeof (transform) === 'undefined') {
            trasform = {
                translate: [0, 0],
                rotate: 0,
                scale: [1, 1]
            };
        }
        if (!('transform' in transform)) {
            if (!('translate' in transform)) {
                ctx = 0;
                cty = 0;
            } else {
                ctx = transform.translate[0];
                cty = transform.translate[1];
            }
            if (!('rotate' in transform)) {
                cr = 0;
            } else {
                cr = transform.rotate;
            }
            if (!('scale' in transform)) {
                csx = 1;
                csy = 1;
            } else {
                csx = transform.scale[0];
                csy = transform.scale[1];
            }
        } else {
            if (!('translate' in transform)) {
                ptx = 0;
                pty = 0;
            } else {
                ptx = transform.translate[0];
                pty = transform.translate[1];
            }
            if (!('rotate' in transform)) {
                pr = 0;
            } else {
                pr = transform.rotate;
            }
            if (!('scale' in transform)) {
                psx = 1;
                psy = 1;
            } else {
                psx = transform.scale[0];
                psy = transform.scale[1];
            }
            if (!('translate' in transform.transform)) {
                ctx = 0;
                cty = 0;
            } else {
                ctx = transform.transform.translate[0];
                cty = transform.transform.translate[1];
            }
            if (!('rotate' in transform.transform)) {
                cr = 0;
            } else {
                cr = transform.transform.rotate;
            }
            if (!('scale' in transform.transform)) {
                csx = 1;
                csy = 1;
            } else {
                csx = transform.transform.scale[0];
                csy = transform.transform.scale[1];
            }
            let pform = `transform="translate(${ptx},${pty})rotate(${pr})scale(${psx},${psy})" `;
            usestr = `<g ${pform}>` + usestr + '</g>';
        }
        xform = `transform="translate(${ctx},${cty})rotate(${cr})scale(${csx},${csy})" `;
        usestr = usestr.replace(/<use /, `<use ${xform}`);
        if (!(base in uses)) {
            uses[base] = [];
        }
        uses[base].push(usestr);

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
    function substitute(size, name, svgstr, ex, xy, factor) {
        let last_name;
        for (let si = 0; si < size; si++) {
            let level = 1 + si;
            let _name = name + '_' + level;
            if (si === 0) {
                Tess.register(_name, svgstr);
                Tess.placeUse(_name, [0, 0], 0, [1, 1], _name);
            } else {
                expand({ level: level, xy: xy, name: last_name, name2: _name, ex: ex, factor: factor });
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
            if (!('factor' in opt)) {
                opt.factor = 2;
            }

            let scale = Math.pow(opt.factor, opt.level - 2);
            let xlen = opt.xy[0] * opt.scale;
            let ylen = opt.xy[1] * opt.scale;
            let x = opt.x + xlen * opt.dx;
            let y = opt.y + ylen * opt.dy;
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