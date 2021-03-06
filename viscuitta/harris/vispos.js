
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
                document.body.insertAdjacentHTML('beforeend', '<input id="stepLimit" size="5" value="2">');
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
    function addSeed(args) {
        let div = 6;
        if (typeof g_main !== 'undefined') {
            polygonSVG(g_main, config.stage.width / div, config.stage.height / div, 0, 1, 1, 0, args);
        } else {
            polygonSVG(0, config.stage.width / div, config.stage.height / div, 0, 1, 1, 0, args);
        }
    }
    function updateConfig() {
        let userConfigStr = param.userConfigStr;
        //try {
        if (/^\s*{/.test(userConfigStr) && /}\s*$/.test(userConfigStr)) {
            //let userConfig = JSON.parse(userConfigStr); 
            //var g_z = [-0, -1, 180];
            var g_z = [param.xmove, param.ymove, (param.rotate + 720) % 360];
            console.error(param.xmove + ' ' + param.ymove + ' ' + param.rotate + ' ');
            try {
                var g_A = getPos(g_a);
                var g_B = getPos(g_b);
                var g_C = getPos(g_c);
                var g_D = getPos(g_d);
                var g_E = getPos(g_e);
                var g_F = getPos(g_f);
                var g_G = getPos(g_g);
                var g_H = getPos(g_h);
                var g_I = getPos(g_i);

                var g_J = getPos(g_j);
                var g_K = getPos(g_k);
                var g_L = getPos(g_l);
                var g_M = getPos(g_m);
                var g_N = getPos(g_n);
                var g_O = getPos(g_o);
                var g_P = getPos(g_p);
                var g_Q = getPos(g_q);
                var g_R = getPos(g_r);
                var g_S = getPos(g_s);
                var g_T = getPos(g_t);
                var g_U = getPos(g_u);
                var g_V = getPos(g_v);
                var g_W = getPos(g_w);
                var g_X = getPos(g_x);
                var g_Y = getPos(g_y);
            } catch (ex) {

            }
            try {
                var g_A1 = getPos(g_a1);
                var g_B1 = getPos(g_b1);
                var g_C1 = getPos(g_c1);
                var g_D1 = getPos(g_d1);
                var g_E1 = getPos(g_e1);
                var g_F1 = getPos(g_f1);
                var g_G1 = getPos(g_g1);
                var g_H1 = getPos(g_h1);
                var g_I1 = getPos(g_i1);
                var g_J1 = getPos(g_j1);
                var g_K1 = getPos(g_k1);
                var g_L1 = getPos(g_l1);
                var g_M1 = getPos(g_m1);
                var g_N1 = getPos(g_n1);
                var g_O1 = getPos(g_o1);
            } catch (ex) {

            }
            try {
                var g_A2 = getPos(g_a2);
                var g_B2 = getPos(g_b2);
                var g_C2 = getPos(g_c2);
                var g_D2 = getPos(g_d2);
                var g_E2 = getPos(g_e2);
                var g_F2 = getPos(g_f2);
                var g_G2 = getPos(g_g2);
                var g_H2 = getPos(g_h2);
                var g_I2 = getPos(g_i2);
                var g_J2 = getPos(g_j2);
                var g_K2 = getPos(g_k2);
                var g_L2 = getPos(g_l2);
                var g_M2 = getPos(g_m2);
                var g_N2 = getPos(g_n2);
                var g_O2 = getPos(g_o2);
                var g_P2 = getPos(g_p2);
                var g_Q2 = getPos(g_q2);
            } catch (ex) {

            }
            let userConfig = eval('(function() { return ' + userConfigStr + '})()');
            for (let ck in config) {
                if (ck in userConfig) {
                    config[ck] = JSON.parse(JSON.stringify(userConfig[ck]));
                }
            }
            param.array = [
                {
                    "pattern": [
                        ".r0"
                    ],
                    "next": [
                        [], [], []
                    ]
                }, {
                    "pattern": [
                        ".r1"
                    ],
                    "next": [
                        [], [], []
                    ]
                }, {
                    "pattern": [
                        ".r2"
                    ],
                    "next": [
                        [], [], []
                    ]
                }
            ];
            param.rindex = 0;
            let idx = 0;
            try {
                var g_A = getLog(g_a, idx++);
                var g_B = getLog(g_b, idx++);
                var g_C = getLog(g_c, idx++);
                var g_D = getLog(g_d, idx++);
                var g_E = getLog(g_e, idx++);
                var g_F = getLog(g_f, idx++);
                var g_G = getLog(g_g, idx++);
                var g_H = getLog(g_h, idx++);
                var g_I = getLog(g_i, idx++);

                var g_J = getLog(g_j, idx++);
                var g_K = getLog(g_k, idx++);
                var g_L = getLog(g_l, idx++);
                var g_M = getLog(g_m, idx++);
                var g_N = getLog(g_n, idx++);
                var g_O = getLog(g_o, idx++);
                var g_P = getLog(g_p, idx++);
                var g_Q = getLog(g_q, idx++);
                var g_R = getLog(g_r, idx++);
                var g_S = getLog(g_s, idx++);
                var g_T = getLog(g_t, idx++);
                var g_U = getLog(g_u, idx++);
                var g_V = getLog(g_v, idx++);
                var g_W = getLog(g_w, idx++);
                var g_X = getLog(g_x, idx++);
                var g_Y = getLog(g_y, idx++);
            } catch (ex) {

            }
            param.rindex = 1;
            let idx1 = 0;
            try {
                var g_A1 = getLog(g_a1, idx1++);
                var g_B1 = getLog(g_b1, idx1++);
                var g_C1 = getLog(g_c1, idx1++);
                var g_D1 = getLog(g_d1, idx1++);
                var g_E1 = getLog(g_e1, idx1++);
                var g_F1 = getLog(g_f1, idx1++);
                var g_G1 = getLog(g_g1, idx1++);
                var g_H1 = getLog(g_h1, idx1++);
                var g_I1 = getLog(g_i1, idx1++);
                var g_J1 = getLog(g_j1, idx1++);
                var g_K1 = getLog(g_k1, idx1++);
                var g_L1 = getLog(g_l1, idx1++);
                var g_M1 = getLog(g_m1, idx1++);
                var g_N1 = getLog(g_n1, idx1++);
                var g_O1 = getLog(g_o1, idx1++);
            } catch (ex) {

            }
            param.rindex = 2;
            let idx2 = 0;
            try {
                var g_A2 = getLog(g_a2, idx2++);
                var g_B2 = getLog(g_b2, idx2++);
                var g_C2 = getLog(g_c2, idx2++);
                var g_D2 = getLog(g_d2, idx2++);
                var g_E2 = getLog(g_e2, idx2++);
                var g_F2 = getLog(g_f2, idx2++);
                var g_G2 = getLog(g_g2, idx2++);
                var g_H2 = getLog(g_h2, idx2++);
                var g_I2 = getLog(g_i2, idx2++);
                var g_J2 = getLog(g_j2, idx2++);
                var g_K2 = getLog(g_k2, idx2++);
                var g_L2 = getLog(g_l2, idx2++);
                var g_M2 = getLog(g_m2, idx2++);
                var g_N2 = getLog(g_n2, idx2++);
                var g_O2 = getLog(g_o2, idx2++);
                var g_P2 = getLog(g_p2, idx2++);
                var g_Q2 = getLog(g_q2, idx2++);
            } catch (ex) {

            }
            console.log(JSON.stringify(param.array));
        }
        //} catch (ex) {
        //    console.error(ex);
        //}
    }
    function getLog(abc, idx) {
        param.array[param.rindex].next[config.rules[param.rindex].next[idx].polygon].push(abc);
    }
    function getPos(_abc) {
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
        ) * g_len * g_scale;

        let y = (
            (_abc[1] * s0 + _abc[2] * s1 + _abc[3] * s2 + _abc[4] * s3 + _abc[5] * s4 + _abc[6] * s5)
        ) * g_len * g_scale;
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