'use strict';
let Tess = (function (console, document) {

    let symbols = [];
    let uses = {};
    let useHashHash = {};
    let svgdiv = null;
    return {
        init: init,
        getSymbols: function() { return symbols.join(''); },
        getUses: function(base) { 
            if (typeof(base)==='undefined'){
                base = '_';
            }
            console.dir(uses);
            return uses[base].join(''); 
        },
        register: register,
        placeUse: placeUse,
        svg: function (me, svgstr) {
            if (!svgdiv) {
                svgdiv = document.createElement('div');
                svgdiv.className = 'svg';
                me.parentElement.insertBefore(svgdiv, me.nextSibling);
            }
            svgdiv.innerHTML = svgstr;
        }
    };
    function init () {
        symbols.length = 0;
        for (let key in uses) {
            uses[key].length=0;
            delete uses[key];
        }
        for (let key in useHashHash) {
            for (let key2 in useHashHash[key]) {
                delete useHashHash[key][key2];
            }
            delete useHashHash[key];
        }
    }

    function register(name, pathStrList,base) {
        if (typeof(base) === 'undefined') {
            base = '_';
        }
        if (!(base in useHashHash)){
            useHashHash[base] = {};
        }
        let bbox = {};
        let pathStr = pathListMerge(pathStrList, bbox);
        let path = `<path d="${pathStr}" fill="none" stroke="#000000" stroke-width="2"/>`;
        symbols.push(`<symbol id="${name}" viewbox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}">${path}</symbol>`);
        useHashHash[base][name] = `<use xlink:href="#${name}" width="${bbox.width}" height="${bbox.height}" x="${bbox.x}" y="${bbox.y}"/>`;
    }
    function placeUse(name, translate, rotate, scale,base) {
        if (typeof (translate) === 'undefined') {
            translate = [0, 0];
        }
        if (typeof (rotate) === 'undefined') {
            rotate = 0;
        }
        if (typeof (scale) === 'undefined') {
            scale = 1;
        }
        if (typeof(base) === 'undefined') {
            base = '_';
        }
        if (name in useHashHash[base]) {
            if (!(base in uses)) {
                uses[base] = [];
            }
            uses[base].push(useHashHash[base][name].replace(/^<use /, `<use transform="translate(${translate[0]},${translate[1]})rotate(${rotate})scale(${scale})" `));
        }
    }
})(console, document);