
'use strict';
(function(document,window,console){
    let config = {
        "id": "xxx",
        "stage": {
            "width": 1000,
            "height":1000
        },
        "iteration": {
            "delta": 1000
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
    function polygonSVG(polygon,x, y, args) {
        let stage = args.stage;
        let polygonStr = config.polygons[polygon];
        stage.insertAdjacentHTML('beforeend',`<g transform="translate(${x},${y})">${polygonStr}</g>`);
    }    
    function rules(args) {
        for (let ri=0;ri<config.rules.length;ri++) {
            let rule = config.rules[ri];
            let pattern = rule.pattern;
            console.dir(rule);
            console.log(pattern)
            for (let pi=0;pi<pattern.length;pi++) {
                let shapes = getPolygons(pattern[pi],{ noDup: true });
                for (let si = 0; si < shapes.length; si++) {
                    let shape = shapes[si];
                    let nexts = rule.next;
                    for (let ni=0;ni<nexts.length;ni++) {
                        console.log(ni);
                        let next = nexts[ni];
                        let x = 0;
                        if ('dx' in next) {
                            x = shape.x + next.dx;
                        }
                        let y = 0;
                        if ('dy' in next) {
                            y = shape.y + next.dy;
                        }
                        polygonSVG(next.polygon, x, y, args);
                    }
                }
            }
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
                polygonSVG(0,0,0,args);
                //rectSVG(0, 0, args);
                main(count, args);
            }, false);
    }
    function updateConfig () {
        let userConfigStr = document.currentScript.textContent.trim();
        try {
            if (/^\s*{/.test(userConfigStr) && /}\s*$/.test(userConfigStr)) {
                let userConfig = JSON.parse(userConfigStr);
                // TODO: merge
                if ('id' in userConfig) {
                    config.id = userConfig.id;
                }
                if ('stage' in userConfig) {
                    if ('width' in userConfig.stage) {
                        config.stage.width = userConfig.stage.width;
                    }
                    if ('height' in userConfig.stage) {
                        config.stage.height = userConfig.stage.height;
                    }
                } 
                if ('iteration' in userConfig) {
                    if ('delta' in userConfig.iteration) {
                        config.iteration.delta = userConfig.iteration.delta;
                    }
                }                               
            }
        } catch (ex) {
            // NOP
        }
        console.dir(config);
    }
    function main(count, args) {
        console.log(count);
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
            if (/translate\(\s*(-*[0-9]*\.*[0-9]+)\s*,(\s*(-*[0-9]*\.*[0-9]+)\s*)\)/.test(transform)){
                x = RegExp.$1;
                y = RegExp.$2;
                x = parseInt(x,10);
                y = parseInt(y,10);
            }
            let uniq = `${x}:${y}`;
            if (('noDup' in opt) && uniq in dup) {
                continue;
            }
            dup[uniq] = true;
            ret.push({
                x: x
                , y: y
            });
        }
        return ret;
    }
})(document,window,console);