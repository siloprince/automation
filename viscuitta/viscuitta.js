
'use strict';
(function(document,window,console){
    let config = {
        "id": "xxx",
        "stage": {
            "width": 300,
            "height":300
        },
        "iteration": {
            "delta": 1000,
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
                        "polygon": 0                 
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
    init();
    function polygonSVG(polygon,x, y, r, s, args) {
        let stage = args.stage;
        let polygonStr = config.polygons[polygon];
        stage.insertAdjacentHTML('beforeend',`<g transform="translate(${x},${y})rotate(${r})scale(${s},${s})">${polygonStr}</g>`);
    }   
    function clear(args) {
        let stage = args.stage;
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
                        let x = shape.x;
                        if ('dx' in next) {
                            x = (shape.x + next.dx)%config.stage.width;
                        }
                        let y = shape.y;
                        if ('dy' in next) {
                            y = (shape.y + next.dy)%config.stage.height;
                        }
                        let r = shape.r;
                        if ('dr' in next) {
                            r = (shape.r + next.dr)%360;
                        }
                        let s = shape.s;
                        if ('ds' in next) {
                            s = (shape.s * next.ds);
                            if (s > 1) {
                                continue;
                            }
                            if (s < -1) {
                                continue;
                            }
                            if ('scaleLimit' in config.iteration) {
                                if (Math.abs(s) < Math.abs(config.iteration.scaleLimit) ) {
                                    continue;
                                }
                            }
                        }     
                        console.log(x+' '+y+' '+r+' '+s);            
                        polygonSVG(next.polygon, x, y, r, s, args);
                        count++;
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
                svg.innerHTML = '<g id="stage"></g>';
                let count = 0;
                let args = {
                    delta: config.iteration.delta
                    , stage: document.querySelector('#stage')
                };
                polygonSVG(0,0,0,0,1,args);
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
 
        window.setTimeout(nextMain, args.delta);
    }
    function getPolygons(match,opt) {
        let ret = [];
        let dup = {};
        let squares = document.querySelectorAll(`polygon${match}`);
        for (let si = 0; si < squares.length; si++) {
            let square = squares[si];
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
            let uniq = `${x}:${y}:${r}:${s}`;
            if (('noDup' in opt) && uniq in dup) {
                continue;
            }
            dup[uniq] = true;
            ret.push({
                x: x
                , y: y
                , r: r
                , s: s
            });
        }
        return ret;
    }
})(document,window,console);