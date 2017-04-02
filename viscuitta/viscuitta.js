
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
                        if (!('dsx' in next)) {
                            next.dsx = 1;
                        }
                        if (!('dsy' in next)) {
                            next.dsy = 1;
                        }
                        
                        let sx = shape.sx * next.dsx;
                        let sy = shape.sy * next.dsy;
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
                let userConfig = JSON.parse(userConfigStr); 
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
            let transform = square.parentNode.getAttribute('transform').trim();
            let x = 0;
            let y = 0;
            if (/translate\(([^,\)]+),([^,\)]+)\)/.test(transform)){
                x = RegExp.$1;
                y = RegExp.$2;
                x = parseFloat(x);
                y = parseFloat(y);
            }       
            let r = 0;
            if (/rotate\(([^,\)]+)\)/.test(transform)){
                r = RegExp.$1;
                r = parseFloat(r);
            }
            let sx = 1;
            let sy = 1;
            if (/scale\(([^,\)]+),([^,\)]+)\)/.test(transform)){
                sx = RegExp.$1; 
                sy = RegExp.$2;
                sx = parseFloat(sx);
                sy = parseFloat(sy);
            }
            let p = parseFloat(polygon);
            ret.push({
                x: x
                , y: y
                , r: r
                , sx: sx
                , sy: sy
                , p: p
            });
        }
        return ret;
    }
})(document,window,console);