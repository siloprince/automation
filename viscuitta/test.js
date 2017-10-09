
'use strict';
(function (document, window, console) {
    let g_angle = Math.PI / 6;
    let g_ac = Math.cos(g_angle);
    let g_as = Math.sin(g_angle);
    let g_ac1 = Math.cos(g_angle * 2);
    let g_as1 = Math.sin(g_angle * 2);
    let g_ac2 = Math.cos(g_angle * 3);
    let g_as2 = Math.sin(g_angle * 3);
    let g_scale = Math.sin(g_angle / 2) / Math.cos(g_angle / 2);
    let g_unit = 180 / 6;
    let g_len = 320;

    let g_main = 1;

    let g_opac = 0;
    let g_trans = 0;
    if (g_opac === 0) {
        g_trans = 1;
    } else {
        g_trans = 0;
    }   
    let config = {
        "id": "xxx",
        "stage": {
            "width": 300,
            "height": 300
        },
        "iteration": {
            "dt": 2000,
            "scaleLimit": 0.1,
            "stepLimit": 10000,
            "shapeCount": false
        },
        "polygons": [
            `<g class='r0' transform="translate(${(g_len * (1 + g_ac))/2},${(g_len * g_as)/2})"><g class='rr'><g transform="translate(${-(g_len * (1 + g_ac))/2},${-(g_len * g_as)/2})">
            <g class='base hide'>
            <polygon fill="#ffffff" stroke-width="10" points='0 0, ${g_len} 0, ${g_len * (1 + g_ac)} ${g_len * g_as},${g_len * g_ac} ${g_len * g_as}' stroke='#00165f' stroke-linejoin="round"></polygon>
            <polygon fill="#00165f" points='${(0 + g_len) / 2} ${(0 + 0) / 2},${(g_len + g_len * (1 + g_ac)) / 2} ${(0 + g_len * g_as) / 2},${(g_len * (1 + g_ac) + g_len * g_ac) / 2} ${(g_len * g_as + g_len * g_as) / 2},${(g_len * g_ac + 0) / 2} ${(g_len * g_as + 0) / 2}' ></polygon>
            </g>
            <g transform="translate(${-g_len/2},${-g_len})">
            <image class='img0 hide' href="./image/0/30.png"/>
            <image class='img1 hide' href="./image/1/30.png"/>
            <image class='img2 hide' href="./image/2/30.png"/>
            <image class='img3 hide' href="./image/3/30.png"/>
            <image class='img4 hide' href="./image/4/30.png"/>
            <image class='img5 hide' href="./image/5/30.png"/>
            <image class='img6 hide' href="./image/6/30.png"/>
            <image class='img0a hide' href="./image/0/30-2.png"/>
            <image class='img1a hide' href="./image/1/30-2.png"/>
            <image class='img2a hide' href="./image/2/30-2.png"/>
            <image class='img3a hide' href="./image/3/30-2.png"/>
            <image class='img4a hide' href="./image/4/30-2.png"/>
            <image class='img5a hide' href="./image/5/30-2.png"/>
            <image class='img6a hide' href="./image/6/30-2.png"/>
            </g>
            </g></g></g>`
            ,
            `<g class='r1' transform="translate(${(g_len * (1 + g_ac1))/2},${(g_len * g_as1)/2})"><g class='rr'><g transform="translate(${-(g_len * (1 + g_ac1))/2},${-(g_len * g_as1)/2})">
            <g class='base hide'>
            <polygon fill="#ffffff" stroke-width="10" points='0 0, ${g_len} 0, ${g_len * (1 + g_ac1)} ${g_len * g_as1},${g_len * g_ac1} ${g_len * g_as1}' stroke='#00165f' stroke-linejoin="round"></polygon>
            <polygon fill="#00165f" points='${(0 + g_len) / 2} ${(0 + 0) / 2},${(g_len + g_len * (1 + g_ac1)) / 2} ${(0 + g_len * g_as1) / 2},${(g_len * (1 + g_ac1) + g_len * g_ac1) / 2} ${(g_len * g_as1 + g_len * g_as1) / 2},${(g_len * g_ac1 + 0) / 2} ${(g_len * g_as1 + 0) / 2}' ></polygon>
            </g>
            <g transform="translate(${-g_len/2},${-g_len/2})">
            <image class='img0 hide' href="./image/0/60.png"/>
            <image class='img1 hide' href="./image/1/60.png"/>
            <image class='img2 hide' href="./image/2/60.png"/>
            <image class='img3 hide' href="./image/3/60.png"/>
            <image class='img4 hide' href="./image/4/60.png"/>
            <image class='img5 hide' href="./image/5/60.png"/>
            <image class='img6 hide' href="./image/6/60.png"/>
            <image class='img0a hide' href="./image/0/60-2.png"/>
            <image class='img1a hide' href="./image/1/60-2.png"/>
            <image class='img2a hide' href="./image/2/60-2.png"/>
            <image class='img3a hide' href="./image/3/60-2.png"/>
            <image class='img4a hide' href="./image/4/60-2.png"/>
            <image class='img5a hide' href="./image/5/60-2.png"/>
            <image class='img6a hide' href="./image/6/60-2.png"/>
            </g>
            </g></g></g>`
            ,
            `<g class='r2' transform="translate(${g_len/2},${g_len/2})"><g class='rr'><g transform="translate(${-g_len/2},${-g_len/2})">
            <g class='base hide'>
             <polygon fill="#ffffff" stroke-width="10" points='0 0, ${g_len} 0, ${g_len * (1 + g_ac2)} ${g_len * g_as2},${g_len * g_ac2} ${g_len * g_as2}' stroke='#00165f' stroke-linejoin="round"></polygon>
             <polygon fill="#00165f" points='${(0 + g_len) / 2} ${(0 + 0) / 2},${(g_len + g_len * (1 + g_ac2)) / 2} ${(0 + g_len * g_as2) / 2},${(g_len * (1 + g_ac2) + g_len * g_ac2) / 2} ${(g_len * g_as2 + g_len * g_as2) / 2},${(g_len * g_ac2 + 0) / 2} ${(g_len * g_as2 + 0) / 2}' ></polygon>
             </g>
             <g transform="translate(${-g_len/2},${-g_len/2})">
            <image class='img0 hide' href="./image/0/90.png"/>
            <image class='img1 hide' href="./image/1/90.png"/>
            <image class='img2 hide' href="./image/2/90.png"/>
            <image class='img3 hide' href="./image/3/90.png"/>
            <image class='img4 hide' href="./image/4/90.png"/>
            <image class='img5 hide' href="./image/5/90.png"/>
            <image class='img6 hide' href="./image/6/90.png"/>
            <image class='img0a hide' href="./image/0/90-2.png"/>
            <image class='img1a hide' href="./image/1/90-2.png"/>
            <image class='img2a hide' href="./image/2/90-2.png"/>
            <image class='img3a hide' href="./image/3/90-2.png"/>
            <image class='img4a hide' href="./image/4/90-2.png"/>
            <image class='img5a hide' href="./image/5/90-2.png"/>
            <image class='img6a hide' href="./image/6/90-2.png"/>
             </g>
             </g></g></g>`
            ,
        ],
        "rules": [
        ]
    };
    let param = {
        zoom: false,
        ruleIndex: 0,
        currentStep: 0,
        userConfigStr: JSON.stringify(config),
        xy: [
            [150, 500+g_len*(1-1/2)],
            [800, 500+g_len*(1-Math.sqrt(3)/2)],
            [1500, 500]
        ],
        focus: [
            [150-250+g_len*(1+Math.cos(Math.PI/3))/2, 500-150+g_len*(1-1/2)/2],
            [800, 500+g_len*(1-Math.sqrt(3)/2)],
            [1500, 500]
        ]
    };
    let stageHash = {};
    init();
    function polygonSVG(polygon, x, y, r, sx, sy, t, args) {

        let g = args.stage;
        let polygonStr = config.polygons[polygon];
        let className = '';
        if (param.stepLimit===1) {
            className = 'class="move move'+polygon+'"';
        }
        g.insertAdjacentHTML('beforeend', `<g ${className} x-polygon="${polygon}" transform="translate(${x},${y})rotate(${r})scale(${sx},${sy})">${polygonStr}</g>`);
        
    }
    function clear(args) {
        let stage = args.stage;
        stageHash = {};
        stage.innerHTML = '';
    }
    function last() {
        return (param.ruleIndex-1+config.rules.length)%config.rules.length;
    }
    function incr() {
        param.ruleIndex = (param.ruleIndex+1+config.rules.length)%config.rules.length;
    }
    function rules(step, args) {
        let patternShapes = {};
        param.ruleIndex = (param.ruleIndex+config.rules.length)%config.rules.length;
        let rr = param.ruleIndex;
        for (let ri = 0; ri < config.rules[rr].length; ri++) {
            let rule = config.rules[rr][ri];
            if (! ('pattern' in rule)) {
                continue;
            }
            console.log(rule);
            let pattern = rule.pattern;
            for (let pi = 0; pi < pattern.length; pi++) {
                let shapes = getPolygons(pattern[pi], { noDup: true });
                if (!(pattern[pi] in patternShapes)) {
                    patternShapes[pattern[pi]] = shapes;
                }
            }
        }
        clear(args);
        let count = 0;
        let scale = [g_scale, g_scale, g_scale];
        for (let ri = 0; ri < config.rules[rr].length; ri++) {
            let rule = config.rules[rr][ri];    
            if (! ('pattern' in rule)) {
                if ('scale' in rule) {
                    scale = rule.scale;
                }
                if (param.stepLimit < 0) {
                    param.stepLimit = Math.abs(param.stepLimit);
                } else if ('stepLimit' in rule) {
                    param.stepLimit = rule.stepLimit;
                }
                continue;
            }
            let pattern = rule.pattern;
            for (let pi = 0; pi < pattern.length; pi++) {
                let shapes = patternShapes[pattern[pi]];
                for (let si = 0; si < shapes.length; si++) {
                    let shape = shapes[si];
                    let nexts = rule.next;
                    for (let ni = 0; ni < nexts.length; ni++) {
                        for (let nj = 0; nj < nexts[ni].length; nj++) {
                            let dxy = getPos(nexts[ni][nj],scale[ni]);
                            let next = {
                                'polygon': ni,
                                'dx': dxy[0],
                                'dy': dxy[1],
                                'dr': nexts[ni][nj][0] * g_unit,
                                'ds' : scale[ni]
                            };
                            let sx = shape.sx * next.ds;
                            let sy = shape.sy * next.ds;
                            let t = 0;
                            if (!('terminate' in next)) {
                                t = 0;
                            } else {
                                t = next.terminate;
                            }
                            {
                                if (sx > 1) {
                                    t = 1;
                                }
                                if (sx < -1) {
                                    t = 1;
                                }
                                if (sy > 1) {
                                    t = 1;
                                }
                                if (sy < -1) {
                                    t = 1;
                                }
                                if ('scaleLimit' in config.iteration) {
                                    if (Math.abs(sx) < Math.abs(config.iteration.scaleLimit)) {
                                        t = 1;
                                    }
                                    if (Math.abs(sy) < Math.abs(config.iteration.scaleLimit)) {
                                        t = 1;
                                    }
                                }
                            }
                            let r = (shape.r - next.dr) % 360;
                            let theta = r * Math.PI / 180;
                            let ct = Math.cos(theta);
                            let st = Math.sin(theta);
                            let nx = next.dx * ct - next.dy * st;
                            let ny = next.dx * st + next.dy * ct;
                            // TODO: sx,sy
                            let x = shape.sx * (nx) + shape.x;
                            let y = shape.sy * (ny) + shape.y;
                            polygonSVG(next.polygon, x, y, r, sx, sy, t, args);
                            if (t === 0) {
                                count++;
                            }
                            if ('objectLimit' in config.iteration) {
                                if (count >= config.iteration.objectLimit) {
                                    console.warn('exceed: config.iteration.objectLimit:' + config.iteration.objectLimit);
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
        if ('shapeCount' in config.iteration && config.iteration.shapeCount) {
            console.warn('shapeCount:' + count);
        }
    }
    function showImage() {
        let imgs_last = document.querySelectorAll('image.img'+last());
        for (let ii=0;ii<imgs_last.length;ii++){
            imgs_last[ii].classList.add('hide');
        }
        let imgs = document.querySelectorAll('image.img'+param.ruleIndex);
        for (let ii=0;ii<imgs.length;ii++){
            imgs[ii].classList.remove('hide');
        }
    }
    function init() {
        param.userConfigStr = document.currentScript.textContent.trim();
        updateConfig();
        document.addEventListener('DOMContentLoaded',
            function () {

                addButton('start', function () {
                    clear(args);
                    addSeed(args);
                    param.stepLimit = 1;
                    //main(0, args);
                    showImage();
                    incr();
                });
                /*
                addButton('start', function () {
                    clear(args);
                    addSeed(args);
                    param.stepLimit = parseInt(document.querySelector('input#stepLimit').value, 10);
                    main(0, args);
                });
                document.body.insertAdjacentHTML('beforeend', '<input id="stepLimit" size="5" value="1">');
                let stepLimit = document.querySelector('input#stepLimit').value;
                addButton('reset', function () {
                    orgClick(args);
                });
                addButton('move', function () {
                    if (param.stepLimit===1) {
                        let moves0 = document.querySelectorAll('g.move0');
                        for (let mi=0;mi<moves0.length;mi++) {
                            moves0[mi].classList.toggle('init0');
                        } 
                        let moves1 = document.querySelectorAll('g.move1');
                        for (let mi=0;mi<moves1.length;mi++) {
                            moves1[mi].classList.toggle('init1');
                        } 
                        let moves2 = document.querySelectorAll('g.move2');
                        for (let mi=0;mi<moves2.length;mi++) {
                            moves2[mi].classList.toggle('init2');
                        } 
                    }
                });
                addButton('zoom', function () {
                    param.zoom = ! param.zoom;
                    
                    let rrs = document.querySelectorAll('g.rr')
                    for (let ri=0;ri<rrs.length;ri++) {
                        rrs[ri].classList.toggle('each');
                    }
                });
                addButton('next', function () {
                    param.ruleIndex++;
                    orgClick(args);
                });
                */
                //http://cubic-bezier.com/
                document.body.insertAdjacentHTML('beforeend', `<style type="text/css"><!--
g.move {
    transition-property: transform;
    transition-duration: 2500ms;
    transition-timing-function:cubic-bezier(.51,0,.55,.9);
}
g.init0 {
    transform: translate(${param.xy[0][0]}px,${param.xy[0][1]}px)rotate(0)scale(1,1);
}
g.init1 {
    transform: translate(${param.xy[1][0]}px,${param.xy[1][1]}px)rotate(0)scale(1,1);
}
g.init2 {
    transform: translate(${param.xy[2][0]}px,${param.xy[2][1]}px)rotate(0)scale(1,1);
}
g.zoom {
    transition-property: transform;
    transition-duration: 2800ms;
    transition-timing-function:linear;
}
g.zooms {
    transition-property: transform;
    transition-duration: 2800ms;
    transition-timing-function:ease-in;
}
g.rr {
    transition-property: transform;
    transition-duration: 2800ms;
    transition-timing-function:ease-in;
}
g.each {
    transform: scale(0.4,0.4);
}
g.focus0 {
    transform: translate(${-param.focus[0][0]}px,${-param.focus[0][1]}px);
}
g.focus0s {
    transform: rotate(0)scale(3,3);
}
.hide {
    display: none;
}
                --></style>`);
                document.body.insertAdjacentHTML('beforeend', '<table border="1"><tr><td><svg fill="#ffffff"></svg></td></tr></table>');
                let svg = document.querySelector('svg');
                svg.setAttribute('width', config.stage.width);
                svg.setAttribute('height', config.stage.height);
                svg.innerHTML = '<g id="stages" class="zooms"><g id="stage" class="zoom"></g></g>';
                let args = {
                    dt: config.iteration.dt
                    , stage: document.querySelector('#stage')
                };
                // TODO: move to config
                addSeed(args);
                param.stepLimit = -1;
                main(0, args);
                //addSeed(args);

            }, false);
    }
    function addButton (title, func) {
        document.body.insertAdjacentHTML('beforeend', `<button id="${title}">${title}</button>`);
        document.querySelector(`button#${title}`).addEventListener('click', func);
    }
    function orgClick(args) {
        updateConfig();
        clear(args);
        param.stepLimit = -1;
        addSeed(args);
        main(0, args);
    }
    function addSeed(args) {
        let tx=0;
        let ty=0;
        if (param.zoom) {
            document.querySelector('g#stage').setAttribute('transform',`translate(0,0)`);
        }
        polygonSVG(0, tx+param.xy[0][0], ty+param.xy[0][1], 0, 1, 1, 0, args);
        if (param.zoom===false) {
            polygonSVG(1, param.xy[1][0], param.xy[1][1], 0, 1, 1, 0, args);
            polygonSVG(2, param.xy[2][0], param.xy[2][1], 0, 1, 1, 0, args);
        }
    }
    function updateConfig() {
        let userConfigStr = param.userConfigStr;
        let userConfig = eval('(function() { return ' + userConfigStr + '})()');
        for (let ck in config) {
            if (ck in userConfig) {
                config[ck] = JSON.parse(JSON.stringify(userConfig[ck]));
            }
        }
    }
    function getPos(_abc, scale) {
        var c0 = Math.cos(_abc[0] * g_angle);
        var s0 = Math.sin(_abc[0] * g_angle);
        var c1 = Math.cos(_abc[0] * g_angle - g_angle);
        var s1 = Math.sin(_abc[0] * g_angle - g_angle);
        var c2 = Math.cos(_abc[0] * g_angle - g_angle * 2);
        var s2 = Math.sin(_abc[0] * g_angle - g_angle * 2);
        var c3 = Math.cos(_abc[0] * g_angle - g_angle * 3);
        var s3 = Math.sin(_abc[0] * g_angle - g_angle * 3);
        var c4 = Math.cos(_abc[0] * g_angle - g_angle * 4);
        var s4 = Math.sin(_abc[0] * g_angle - g_angle * 4);
        var c5 = Math.cos(_abc[0] * g_angle - g_angle * 5);
        var s5 = Math.sin(_abc[0] * g_angle - g_angle * 5);
        let theta = (_abc[0] * -g_angle);

        let x = (
            (_abc[1] * c0 + _abc[2] * c1 + _abc[3] * c2 + _abc[4] * c3 + _abc[5] * c4 + _abc[6] * c5)
        ) * g_len * scale;

        let y = (
            (_abc[1] * s0 + _abc[2] * s1 + _abc[3] * s2 + _abc[4] * s3 + _abc[5] * s4 + _abc[6] * s5)
        ) * g_len * scale;
        return [
            x, y
        ];
    }
    function main(step, args) {
        param.currentStep = step;
        if (step >= param.stepLimit) {
            console.warn('exceed: param.stepLimit: ' + param.stepLimit);
            return;
        }
        rules(step, args);
        let nextMain = (function (c, a) {
            return function () { main(c + 1, a); };
        })(step, args);

        window.setTimeout(nextMain, args.dt);
    }
    function getPolygons(match, opt) {
        let ret = [];
        let squares = document.querySelectorAll(`g#stage ${match}`);
        for (let si = 0; si < squares.length; si++) {
            let square = squares[si];
            let polygon = square.parentNode.getAttribute('x-polygon').trim();
            let p = parseFloat(polygon);
            let mat = decomposeMatrix(square.parentNode.getCTM());
            ret.push({
                x: mat.translate[0]
                , y: mat.translate[1]
                , r: mat.rotate
                , sx: mat.scale[0]
                , sy: mat.scale[1]
                , p: p
            });
        }
        return ret;
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
})(document, window, console);