'use strict';
let Tess = (function (console, document, me) {

    let symbols = [];
    let uses = [];
    let useHash = {};
    return {
        init: init,
        getSymbols: function() { return symbols.join(''); },
        getUses: function() { return uses.join(''); },
        register: register,
        placeUse: placeUse
    };
    function init () {
        symbols.length = 0;
        uses.length = 0;
        for (let key in useHash) {
            delete useHash[key];
        }
    }
    function register(name, pathStrList) {
        let bbox = {};
        let pathStr = pathListMerge(pathStrList, bbox);
        let path = `<path d="${pathStr}" fill="none" stroke="#000000" stroke-width="2"/>`;
        symbols.push(`<symbol id="${name}" viewbox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">${path}</symbol>`);
        useHash[name] = `<use xlink:href="#${name}" width="${bbox.width}" height="${bbox.height}" x="${bbox.x}" y="${bbox.y}"/>`;
    }
    function placeUse(name, translate, rotate, scale) {
        if (typeof (translate) === 'undefined') {
            translate = [0, 0];
        }
        if (typeof (rotate) === 'undefined') {
            rotate = 0;
        }
        if (typeof (scale) === 'undefined') {
            scale = 1;
        }
        if (name in useHash) {
            uses.push(useHash[name].replace(/^<use /, `<use transform="translate(${translate[0]},${translate[1]})rotate(${rotate})scale(${scale})" `));
        }
    }
})(console, document, document.currentScript);