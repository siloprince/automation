
'use strict';
(function(document,window,console){
    let config = {
        "id": "xxx",
        "stage": {
            "width": 300,
            "height":300
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
                "pattern":[
                    ".square"
                ],
                "next":[
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
    let terminateHash = {};
    let stageHash = {};
    init();
    function polygonSVG(polygon,x, y, r, sx, sy, t, args) {
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
            terminateHash[key]=true;
        } else {
            g = args.stage;
            stageHash[key]=true;
        }
        let polygonStr = config.polygons[polygon];
        g.insertAdjacentHTML('beforeend',`<g x-polygon="${polygon}" transform="translate(${x},${y})rotate(${r})scale(${sx},${sy})">${polygonStr}</g>`);
    }   
    function clear(args) {
        let stage = args.stage;
        stageHash = {};
        stage.innerHTML = '';
    }
    function rules(args) {
        let patternShapes = {};
        for (let ri=0;ri<config.rules.length;ri++) {
            let rule = config.rules[ri];
            let pattern = rule.pattern;
            for (let pi=0;pi<pattern.length;pi++) {
                let shapes = getPolygons(pattern[pi],{ noDup: true });
                if (!(pattern[pi] in patternShapes)) {
                    patternShapes[pattern[pi]] = shapes;
                }
            }
        }
        clear(args);
        let count=0;
        for (let ri=0;ri<config.rules.length;ri++) {
            let rule = config.rules[ri];
            let pattern = rule.pattern;
            for (let pi=0;pi<pattern.length;pi++) { 
                let shapes = patternShapes[pattern[pi]];       
                for (let si = 0; si < shapes.length; si++) {
                    let shape = shapes[si];
                    let nexts = rule.next;
                    for (let ni=0;ni<nexts.length;ni++) {
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
                        /*
                        next.dx *= next.ds;
                        next.dy *= next.ds;
                        */
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
                                if (Math.abs(sx) < Math.abs(config.iteration.scaleLimit) ) {
                                    t = 1;
                                }
                                if (Math.abs(sy) < Math.abs(config.iteration.scaleLimit) ) {
                                    t = 1;
                                }
                            }
                        }
                        let r = (shape.r - next.dr)%360;
                        let theta = r*Math.PI/180;
                        let ct = Math.cos(theta);
                        let st = Math.sin(theta);
                        let nx = next.dx*ct - next.dy*st;
                        let ny = next.dx*st + next.dy*ct;
                        // TODO: sx,sy
                        let x = shape.sx*(nx) + shape.x;
                        x = (x+config.stage.width)%config.stage.width;
                        let y = shape.sy*(ny) + shape.y;
                        y = (y+config.stage.height)%config.stage.height; 
                        polygonSVG(next.polygon, x, y, r, sx, sy, t, args);
                        if (t===0) {
                            count++;
                        }
                        if ('objectLimit' in config.iteration) {
                            if (count >= config.iteration.objectLimit ) {
                                console.warn('exceed: config.iteration.objectLimit:'+config.iteration.objectLimit);
                                return;
                            }
                        }                     
                    }
                }
            }
        }
        if ('shapeCount' in config.iteration && config.iteration.shapeCount) {
            console.warn('shapeCount:'+count);
        }
    }
    function init() {
        updateConfig();
        document.addEventListener('DOMContentLoaded',
            function () {
                document.body.insertAdjacentHTML('beforeend', '<table border="1"><tr><td><svg></svg></td></tr></table>');
                let svg = document.querySelector('svg');
                svg.setAttribute('width', config.stage.width);
                svg.setAttribute('height', config.stage.height);
                svg.innerHTML = '<g id="terminate"></g><g id="stage"></g>';
                let count = 0;
                let args = {
                    dt: config.iteration.dt
                    , stage: document.querySelector('#stage')
                    , terminate: document.querySelector('#terminate')
                };
                // TODO: move to config
                polygonSVG(0,config.stage.width/4,config.stage.height/4,0,1,1,0,args);
                main(count, args);
            }, false);
    }
    function updateConfig () {
        let userConfigStr = document.currentScript.textContent.trim();
        try {
            if (/^\s*{/.test(userConfigStr) && /}\s*$/.test(userConfigStr)) {
                //let userConfig = JSON.parse(userConfigStr); 
                let userConfig = eval('(function() { return ' + userConfigStr + '})()');
                for (let ck in config) {
                    if ( ck in userConfig) {
                        config[ck] = JSON.parse(JSON.stringify(userConfig[ck]));
                    }
                }                     
            }
        } catch (ex) {
            // NOP
            console.log(ex);
        }
    }
    function main(count, args) {
        if (count=== config.iteration.stepLimit) {
            console.warn('exceed: config.iteration.stepLimit: '+config.iteration.stepLimit);
            return;
        }
        rules(args);
        let nextMain = (function (c, a) {
            return function () { main(c + 1, a);};
        })(count, args);
 
        window.setTimeout(nextMain, args.dt);
    }
    function getPolygons(match,opt) {
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
        if (isNaN(cx)){
            cx =0;
            cy =0;
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
})(document,window,console);