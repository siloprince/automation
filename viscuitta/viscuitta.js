
'use strict';
(function(document,window,console){
    let config = {
        id: 'test'
        , stage: {
            width: 1000
            , height: 1000
        }
        , iteration: {
            delta: 2000
        }
    };
    init();
    function rectSVG(x, y, args) {
        let stage = args.stage;
        stage.insertAdjacentHTML('beforeend',
            `<rect class="square" x="${x}" y="${y}" width="30" height="30" fill="#ffaaaa" stroke="#0000ff">`
        );
    }
    function rule(args) {
        let squares = getSquares({ noDup: true });
        for (let si = 0; si < squares.length; si++) {
            let square = squares[si];
            let x0 = square.x + square.width;
            let y0 = square.y;
            rectSVG(x0, y0, args);
            let x1 = square.x;
            let y1 = square.y + square.height;
            rectSVG(x1, y1, args);
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
                rectSVG(0, 0, args);
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
        rule(args);
        let nextMain = (function (c, a) {
            return function () { main(c + 1, a);};
        })(count, args);
        window.setTimeout(nextMain, args.delta);
    }

    function getSquares(opt) {
        let ret = [];
        let dup = {};
        let squares = document.querySelectorAll('rect.square');
        for (let si = 0; si < squares.length; si++) {
            let square = squares[si];
            let x = parseInt(square.getAttribute('x'), 10);
            let y = parseInt(square.getAttribute('y'), 10);
            let width = parseInt(square.getAttribute('width'), 10);
            let height = parseInt(square.getAttribute('height'), 10);
            let uniq = `${x}:${y}:${width}:${height}`;
            if (('noDup' in opt) && uniq in dup) {
                continue;
            }
            dup[uniq] = true;
            ret.push({
                id: square.id
                , x: x
                , y: y
                , width: width
                , height: height
                , uniq: uniq
            });
        }
        return ret;
    }
})(document,window,console);