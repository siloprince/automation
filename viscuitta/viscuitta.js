
'use strict';
(function(document,window,console){
    let config = {
        'id': 'xxx',
        'stage': {
            'width': 300,
            'height':300
        },
        'iteration': {
            'dt': 1000,
            'scaleLimit': 0.1,
            'stepLimit': 10000,
            'shapeCount': true
        },
        'polygons': [
            '<polygon class=\'square\' points=\'0 0, 30 0, 30 30, 0 30\' fill=\'#aaaaaa\' stroke=\'#0000ff\'/>'
        ],
        'rules': [
            { 
                'pattern':[
                    '.square'
                ],
                'next':[
                    {
                        'polygon': 0,
                        'terminate': 1                 
                    },
                    {
                        'polygon': 0,
                        'dx': 30,
                        'dy': 0                   
                    },
                    {
                        'polygon': 0,
                        'dx': 0,
                        'dy': 30                       
                    }
                ]  
            }
        ]
    };
    let terminateHash = {};
    let stageHash = {};
    init();
    function polygonSVG(polygon,x, y, r, s, t, args) {
        let key = `${polygon}:${x}:${y}:${r}:${s}`;
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
        g.insertAdjacentHTML('beforeend',`<g x-polygon="${polygon}" transform="translate(${x},${y})rotate(${r})scale(${s},${s})">${polygonStr}</g>`);
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
                        let x = shape.s*(next.dx) + shape.x;
                        x = x%config.stage.width;
                        let y = shape.s*(next.dy) + shape.y;
                        y = y%config.stage.height; 
                        let r = (shape.r + next.dr)%360;
                        let s = shape.s * next.ds;
                        let t = 0;
                        if (!('terminate' in next)) {
                            t = 0;
                        } else {
                            t = next.terminate;
                        }
                        {
                            if (s > 1) {
                                t = 1;
                            }
                            if (s < -1) {
                                t = 1;
                            }
                            if ('scaleLimit' in config.iteration) {
                                if (Math.abs(s) < Math.abs(config.iteration.scaleLimit) ) {
                                    t = 1;
                                }
                            }
                        }         
                        polygonSVG(next.polygon, x, y, r, s, t, args);
                        count++;
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
                document.body.insertAdjacentHTML('beforeend', '<table><tr><td><svg></svg></td></tr></table>');
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
                polygonSVG(0,0,0,0,1,0,args);
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
        let dup = {};
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
            let s = 1;
            if (/scale\(([^,\)]+),([^,\)]+)\)/.test(transform)){
                s = RegExp.$1;
                s = parseFloat(s);
            }
            let p = parseFloat(polygon);
            ret.push({
                x: x
                , y: y
                , r: r
                , s: s
                , p: p
            });
        }
        return ret;
    }
})(document,window,console);