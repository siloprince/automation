
'use strict';
(function (document, window, console) {
    let config = {
        "id": "xxx",
        "stage": {
            "width": 300,
            "height": 300
        },
        "iteration": {
            "dt": 1000,
            "scaleLimit": 0.1,
            "stepLimit": 10000,
            "shapeCount": true
        },
        "polygons": [
            "<polygon class='square' points='0 0, 30 0, 30 30, 0 30' fill='#aaaaaa' stroke='#0000ff'/>"
        ],
        "rules": [
            {
                "pattern": [
                    ".square"
                ],
                "next": [
                    {
                        "polygon": 0,
                        "terminate": 1
                    },
                    {
                        "polygon": 0,
                        "dx": 30,
                        "dy": 0
                    },
                    {
                        "polygon": 0,
                        "dx": 0,
                        "dy": 30
                    }
                ]
            }
        ]
    };
    let param = {
        xmove: 0,
        ymove: 0,
        rotate: 0,
        userConfigStr: JSON.stringify(config)
    };
    let terminateHash = {};
    let stageHash = {};
    init();
    function polygonSVG(polygon, x, y, r, sx, sy, t, args) {
        let key = `${polygon}:${x}:${y}:${r}:${sx}:${sy}`;
        if (key in terminateHash) {
            return;
        }
        if (key in stageHash) {
            return;
        }
        let g;
        if (t) {
            g = args.terminate;
            terminateHash[key] = true;
        } else {
            g = args.stage;
            stageHash[key] = true;
        }
        let polygonStr = config.polygons[polygon];
        let fill = '#ff0000';

        g.insertAdjacentHTML('beforeend', `<g fill="${fill}" x-polygon="${polygon}" transform="translate(${x},${y})rotate(${r})scale(${sx},${sy})">${polygonStr}</g>`);
    }
    function clear(args) {
        let stage = args.stage;
        stageHash = {};
        stage.innerHTML = '';
    }
    function rules(step, args) {
        let patternShapes = {};
        for (let ri = 0; ri < config.rules.length; ri++) {
            let rule = config.rules[ri];
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
        for (let ri = 0; ri < config.rules.length; ri++) {
            let rule = config.rules[ri];
            let pattern = rule.pattern;
            for (let pi = 0; pi < pattern.length; pi++) {
                let shapes = patternShapes[pattern[pi]];
                for (let si = 0; si < shapes.length; si++) {
                    let shape = shapes[si];
                    let nexts = rule.next;
                    for (let ni = 0; ni < nexts.length; ni++) {
                        let next = nexts[ni];
                        if (!('dx' in next)) {
                            next.dx = 0;
                        }
                        if (!('dy' in next)) {
                            next.dy = 0;
                        }
                        if (!('dr' in next)) {
                            next.dr = 0;
                        }
                        if (!('ds' in next)) {
                            next.ds = 1;
                        }

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
                        x = (x + config.stage.width) % config.stage.width;
                        let y = shape.sy * (ny) + shape.y;
                        y = (y + config.stage.height) % config.stage.height;
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
        if ('shapeCount' in config.iteration && config.iteration.shapeCount) {
            console.warn('shapeCount:' + count);
        }
    }
    function init() {
        param.userConfigStr = document.currentScript.textContent.trim();
        updateConfig();
        document.addEventListener('DOMContentLoaded',
            function () {
                document.body.insertAdjacentHTML('beforeend', '<button id="start">start</button>');
                let startButton = document.querySelector('button#start');
                document.body.insertAdjacentHTML('beforeend', '<input id="stepLimit" size="5" value="7">');
                let stepLimit = document.querySelector('input#stepLimit').value;
                document.body.insertAdjacentHTML('beforeend', '<button id="org">org</button>');
                let orgButton = document.querySelector('button#org');
                document.body.insertAdjacentHTML('beforeend', '<button id="reset">reset</button>');
                let resetButton = document.querySelector('button#reset');
                document.body.insertAdjacentHTML('beforeend', '<button id="less">less</button>');
                let lessButton = document.querySelector('button#less');
                document.body.insertAdjacentHTML('beforeend', '<input id="angle" size="5" value="0">');
                let angleValue = document.querySelector('input#angle').value;
                document.body.insertAdjacentHTML('beforeend', '<button id="more">more</button>');
                let moreButton = document.querySelector('button#more');
                document.body.insertAdjacentHTML('beforeend', '<button id="left">left</button>');
                let leftButton = document.querySelector('button#left');
                document.body.insertAdjacentHTML('beforeend', '<button id="right">right</button>');
                let rightButton = document.querySelector('button#right');
                document.body.insertAdjacentHTML('beforeend', '<button id="down">down</button>');
                let downButton = document.querySelector('button#down');
                document.body.insertAdjacentHTML('beforeend', '<button id="top">top</button>');
                let topButton = document.querySelector('button#top');
                document.body.insertAdjacentHTML('beforeend', '<table border="1"><tr><td><svg></svg></td></tr></table>');
                let svg = document.querySelector('svg');
                svg.setAttribute('width', config.stage.width);
                svg.setAttribute('height', config.stage.height);
                svg.innerHTML = '<g id="terminate"></g><g id="stage"></g>';
                let args = {
                    dt: config.iteration.dt
                    , stage: document.querySelector('#stage')
                    , terminate: document.querySelector('#terminate')
                };
                // TODO: move to config
                addSeed(args);
                param.stepLimit = 1;
                main(0, args);
                addSeed(args);

                startButton.addEventListener('click', function () {
                    clear(args);
                    addSeed(args);   
                    param.stepLimit = parseInt(document.querySelector('input#stepLimit').value, 10);
                    main(0, args);
                });
                orgButton.addEventListener('click', function () {
                    orgClick(args);
                });
                resetButton.addEventListener('click', function () {
                    param.rotate = 0;
                    param.xmove = 0;
                    param.ymove = 0;
                    orgClick(args);
                });
                lessButton.addEventListener('click', function () {
                    param.rotate += parseInt(document.querySelector('input#angle').value, 10);
                    param.xmove = 0;
                    param.ymove = 0;
                    orgClick(args);
                });
                moreButton.addEventListener('click', function () {
                    param.rotate -= parseInt(document.querySelector('input#angle').value, 10);
                    param.xmove = 0;
                    param.ymove = 0;
                    orgClick(args);
                });
                leftButton.addEventListener('click', function () {
                    param.xmove -= 1;
                    orgClick(args);
                });
                rightButton.addEventListener('click', function () {
                    param.xmove += 1;
                    orgClick(args);
                });
                downButton.addEventListener('click', function () {
                    param.ymove -= 1;
                    orgClick(args);
                });
                topButton.addEventListener('click', function () {
                    param.ymove += 1;
                    orgClick(args);
                });

                param.rotate = 0;
                param.xmove = 0;
                param.ymove = 0;
            }, false);
    }
    function orgClick(args) {
        updateConfig();
        clear(args);
        param.stepLimit = 1;
        addSeed(args);   
        main(0, args);
        addSeed(args);   
    }
    function addSeed (args) {
        if (typeof g_main !== 'undefined') {
            polygonSVG(g_main, config.stage.width / 6, config.stage.height / 6, 0, 1, 1, 0, args);
        } else {
            polygonSVG(0, config.stage.width / 6, config.stage.height / 6, 0, 1, 1, 0, args);            
        }
    }
    function updateConfig() {
        let userConfigStr = param.userConfigStr;
        try {
            if (/^\s*{/.test(userConfigStr) && /}\s*$/.test(userConfigStr)) {
                //let userConfig = JSON.parse(userConfigStr); 
                //var g_z = [-0, -1, 180];
                var g_z = [param.xmove,param.ymove,(param.rotate+720)%360];
                console.error(param.xmove+' '+param.ymove+' '+param.rotate+' ');
                try {
                    var g_A = getPos(g_z, g_a, g_angle, g_len,g_scale);
                    var g_B = getPos(g_z, g_b, g_angle, g_len,g_scale);
                    var g_C = getPos(g_z, g_c, g_angle, g_len,g_scale);
                    var g_D = getPos(g_z, g_d, g_angle, g_len,g_scale);
                    var g_E = getPos(g_z, g_e, g_angle, g_len,g_scale);
                    var g_F = getPos(g_z, g_f, g_angle, g_len,g_scale);
                    var g_G = getPos(g_z, g_g, g_angle, g_len,g_scale);
                    var g_H = getPos(g_z, g_h, g_angle, g_len,g_scale);
                    var g_I = getPos(g_z, g_i, g_angle, g_len,g_scale);
                } catch (ex) {

                }
                try {
                    var g_A1 = getPos(g_z, g_a1, g_angle1, g_len,g_scale);
                    var g_B1 = getPos(g_z, g_b1, g_angle1, g_len,g_scale);
                    var g_C1 = getPos(g_z, g_c1, g_angle1, g_len,g_scale);
                    var g_D1 = getPos(g_z, g_d1, g_angle1, g_len,g_scale);
                    var g_E1 = getPos(g_z, g_e1, g_angle1, g_len,g_scale);
                    var g_F1 = getPos(g_z, g_f1, g_angle1, g_len,g_scale);
                    var g_G1 = getPos(g_z, g_g1, g_angle1, g_len,g_scale);
                    var g_H1 = getPos(g_z, g_h1, g_angle1, g_len,g_scale);
                    var g_I1 = getPos(g_z, g_i1, g_angle1, g_len,g_scale);
                    var g_J1 = getPos(g_z, g_j1, g_angle1, g_len,g_scale);
                    var g_K1 = getPos(g_z, g_k1, g_angle1, g_len,g_scale);
                    var g_L1 = getPos(g_z, g_l1, g_angle1, g_len,g_scale);
                    var g_M1 = getPos(g_z, g_m1, g_angle1, g_len,g_scale);
                    var g_N1 = getPos(g_z, g_n1, g_angle1, g_len,g_scale);
                    var g_O1 = getPos(g_z, g_o1, g_angle1, g_len,g_scale);
                } catch (ex) {

                }
                try {
                    var g_A2 = getPos(g_z, g_a2, g_angle2, g_len,g_scale);
                    var g_B2 = getPos(g_z, g_b2, g_angle2, g_len,g_scale);
                    var g_C2 = getPos(g_z, g_c2, g_angle2, g_len,g_scale);
                    var g_D2 = getPos(g_z, g_d2, g_angle2, g_len,g_scale);
                    var g_E2 = getPos(g_z, g_e2, g_angle2, g_len,g_scale);
                    var g_F2 = getPos(g_z, g_f2, g_angle2, g_len,g_scale);
                    var g_G2 = getPos(g_z, g_g2, g_angle2, g_len,g_scale);
                    var g_H2 = getPos(g_z, g_h2, g_angle2, g_len,g_scale);
                    var g_I2 = getPos(g_z, g_i2, g_angle2, g_len,g_scale);
                    var g_J2 = getPos(g_z, g_j2, g_angle2, g_len,g_scale);
                    var g_K2 = getPos(g_z, g_k2, g_angle2, g_len,g_scale);
                    var g_L2 = getPos(g_z, g_l2, g_angle2, g_len,g_scale);
                    var g_M2 = getPos(g_z, g_m2, g_angle2, g_len,g_scale);
                    var g_N2 = getPos(g_z, g_n2, g_angle2, g_len,g_scale);
                    var g_O2 = getPos(g_z, g_o2, g_angle2, g_len,g_scale);
                    var g_P2 = getPos(g_z, g_p2, g_angle2, g_len,g_scale);
                    var g_Q2 = getPos(g_z, g_q2, g_angle2, g_len,g_scale);
                } catch (ex) {

                }
                let userConfig = eval('(function() { return ' + userConfigStr + '})()');
                for (let ck in config) {
                    if (ck in userConfig) {
                        config[ck] = JSON.parse(JSON.stringify(userConfig[ck]));
                    }
                }
            }
        } catch (ex) {
            console.error(ex);
        }
    }
    function getPos(_z, _abc, _angle, len, scale) {
        var c0 = Math.cos(0);
        var s0 = Math.sin(0);
        var c1 = Math.cos(_angle);
        var s1 = Math.sin(_angle);
        let theta = (_abc[2]) * Math.PI / 180;
        let x = (_z[0] * Math.cos(theta) + _z[1] * Math.cos(theta + _angle)) * len + (_abc[1] * c1 + _abc[0] * c0) * len * scale;
        let y = (_z[0] * Math.sin(theta) + _z[1] * Math.sin(theta + _angle)) * len + (_abc[1] * s1 + _abc[0] * s0) * len * scale;
        return [
            x, y
        ];
    }
    function main(step, args) {
        if (step >= param.stepLimit) {
            console.warn('exceed: param.stepLimit: ' + param.stepLimit);
            return;
        }
        console.warn(step);
        rules(step, args);
        let nextMain = (function (c, a) {
            return function () { main(c + 1, a); };
        })(step, args);

        window.setTimeout(nextMain, args.dt);
    }
    function getPolygons(match, opt) {
        let ret = [];
        let squares = document.querySelectorAll(`g#stage polygon${match}`);
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