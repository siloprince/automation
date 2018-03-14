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
    function makePath(pathStrList, opt) {
        if (!opt) {
            opt = {};
        }
        if (!('fill' in opt)) {
            opt.fill = 'none';
        }
        if (!('stroke' in opt)) {
            opt.stroke = '#000000';
        }
        if (!('width' in opt)) {
            opt.width = '2';
        }
        if (!('opacity' in opt)) {
            opt.opacity = '1';
        }
        let pathStr = pathListMerge(pathStrList)+' Z';
        return `<path d="${pathStr}" fill="${opt.fill}" stroke="${opt.stroke}" stroke-width="${opt.width}" fill-opacity="${opt.opacity}" vectorEffect="non-scaling-stroke"/>`;
    }

    function add(name, svgstr) {
        useHash[name] = `<g class="new" >${svgstr}</g>`;
    }
    function register(name, svgstr) {
        let symbols = document.querySelector('svg.symbols');
        symbols.insertAdjacentHTML('beforeend', `<defs><g id="${name}">${svgstr}</g></defs>`);
        useHash[name] = `<use class="new" xlink:href="#${name}"/>`;
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
        let ctx, cty, cr, csx, csy, ccx, ccy;
        let ptx, pty, pr, psx, psy, pcx, pcy;
        let xform, pform;
        if (typeof (transform) === 'undefined') {
            transform = {
                center: [0, 0],
                translate: [0, 0],
                rotate: 0,
                scale: [1, 1]
            };
        }
        if (!('transform' in transform)) {
            if (!('center' in transform)) {
                ccx = 0;
                ccy = 0;
            } else {
                ccx = transform.center[0];
                ccy = transform.center[1];
            }
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
            if (!('center' in transform)) {
                pcx = 0;
                pcy = 0;
            } else {
                pcx = transform.center[0];
                pcy = transform.center[1];
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
            if (!('center' in transform.transform)) {
                ccx = 0;
                ccy = 0;
            } else {
                ccx = transform.transform.center[0];
                ccy = transform.transform.center[1];
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
            pform = `transform="translate(${ptx},${pty})translate(${pcx},${pcy})rotate(${pr})scale(${psx},${psy})translate(${-pcx},${-pcy})" `;
            usestr = `<g ${pform}>` + usestr + '</g>';
        }
        xform = `transform="translate(${ctx},${cty})translate(${ccx},${ccy})rotate(${cr})scale(${csx},${csy})translate(${-ccx},${-ccy})" `;
        usestr = usestr.replace(/class="new"/, `class="done" ${xform}`);
        if (!(base in uses)) {
            uses[base] = [];
        }
        uses[base].push(usestr);

    }
    function substitute(size, name, svgstr, ex, xy, factor) {
        let last_name;
        for (let si = 0; si < size; si++) {
            let level = 1 + si;
            let _name = name + '_' + level;
            if (si === 0) {
                Tess.register(_name, svgstr);
                Tess.place(_name, {translate: [0, 0], rotate: 0, scale: [1, 1]}, _name);
            } else {
                let opt = { level: level, xy: xy, name: last_name, name2: _name, ex: ex, factor: factor };
                for (let ei = 0; ei < ex.length; ei++) {
                    expand(dupOpt(opt, ex[ei]));
                }
                add(_name, Tess.getUses(_name));
            }
            last_name = _name;
        }
        return last_name;

        function expand(opt) {
            if (!('x' in opt)) {
                opt.x = 0;
            }
            if (!('y' in opt)) {
                opt.y = 0;
            }
            if (!('dsx' in opt)) {
                opt.dsx = 1;
            }
            if (opt.dsx>=1) {
                opt.dsx = 1;
            } else {
                opt.dsx = -1;
            }
            if (!('dsy' in opt)) {
                opt.dsy = 1;
            }
            if (opt.dsy>=1) {
                opt.dsy = 1;
            } else {
                opt.dsy = -1;
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
            let ss = Math.pow(opt.factor,opt.level-1);
            let scale = Math.pow(opt.factor, opt.level - 2);

            let xlen = opt.xy[0] * scale;
            let ylen = opt.xy[1] * scale;
            let x = opt.x + xlen * opt.dx/ss;
            let y = opt.y + ylen * opt.dy/ss;
            let rot = opt.rot + opt.dr;
            Tess.place(opt.name, {translate:[x, y], rotate:rot, scale:[opt.dsx/opt.factor, opt.dsy/opt.factor]}, opt.name2);

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