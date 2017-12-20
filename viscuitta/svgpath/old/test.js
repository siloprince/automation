
(function() {
    let svgpath = require('./svgpath');

let transformed = svgpath('M0 0 100 0')
                    .scale(0.5)
                    .translate(100,200)
                    .rel()
                    .round(1)
                    .toString();

console.log(transformed);
console.log();
})();