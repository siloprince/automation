'use strict';
(function (document, window, console) {
    let config = {
        "width": 1200,
        "height": 1200,
        "shapes": [
            {
                angles: [30, 150, 30, 150],
                lengthes: [100, 100, 100, 100]
            }/*,
             { 
                angles: [30,150,30,150],
                lengthes: [100,100,100,100]
            },
            { 
                angles: [90,90,90,90],
                lengthes: [100,100,100,100]
            },
            { 
                angles: [60,60,60],
                lengthes: [100,100,100]
            },*/
        ]
    };
    updateConfig();
    let contentList = [];

    let polygonList = [];
    for (let si = 0; si < config.shapes.length; si++) {
        let pointList = [];
        let org = [1, 0];
        let xy = [0, 0];
        for (var ai = 0; ai < config.shapes[si].angles.length; ai++) {
            var angle = config.shapes[si].angles[ai];
            var length = config.shapes[si].lengthes[ai];
            let XY = nextPoint(xy, org, angle, length);
            pointList.push(XY.join(' '));
            org = xy.concat([]);
            xy = XY.concat([]);
        }
        polygonList.push(`<polygon class="touchSensor" points="${pointList.join(',')}" transform="translate(0,0)translate(0,0)rotate(0)scale(1,1)translate(0,0)"/>`);
    }
    contentList.push(polygonList.join(''));

    let html = `<svg width="${config.width}" height="${config.height}">${contentList.join('')}</svg>`;
    document.currentScript.insertAdjacentHTML('afterend', html);

    let svg = document.currentScript.nextSibling;
    let polygons = svg.querySelectorAll('polygon.touchSensor');
    for (let pi = 0; pi < polygons.length; pi++) {
        let center = calcCenter(polygons[pi]);
        setCenter(polygons[pi], center);
        polygons[pi].addEventListener('click', function (ev) {
            let target = ev.target;
            let degree = getRotate(target);
            degree += 10;
            setRotate(target, degree);
        }, false);
        // TODO : support drag
    }
    // TODO : more conv functions
    function setCenter(polygon, xy) {
        polygon.transform.baseVal.getItem(1).setTranslate(xy[0],xy[1]);
        polygon.transform.baseVal.getItem(4).setTranslate(-xy[0],-xy[1]);
    }
    function setScale(polygon, xy) {
        polygon.transform.baseVal.getItem(3).setScale(xy[0],xy[1]);
    }
    function setRotate(polygon, degree) {
        polygon.transform.baseVal.getItem(2).setRotate(degree,0,0);
    }
    function getCenter(polygon) {
        let mat = decomposeMatrix(polygon.getCTM());
        return mat.center;
    }
    function getScale(polygon) {
        let mat = decomposeMatrix(polygon.getCTM());
        return mat.scale;
    }
    function getRotate(polygon) {
        let mat = decomposeMatrix(polygon.getCTM());
        return mat.rotate;
    }

    function decomposeMatrix(matrix) {
        // @see https://gist.github.com/2052247

        // calculate delta transform point
        let px = deltaTransformPoint(matrix, { x: 0, y: 1 });
        let py = deltaTransformPoint(matrix, { x: 1, y: 0 });

        // calculate skew
        let skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
        let skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

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
            center: [px, py]
            // rotation is the same as skew x
        };
        function deltaTransformPoint(matrix, point) {

            let dx = point.x * matrix.a + point.y * matrix.c + 0;
            let dy = point.x * matrix.b + point.y * matrix.d + 0;
            return { x: dx, y: dy };
        }
    }
    function negate(xy) {
        return [-xy[0], -xy[1]];
    }
    function calcCenter(polygon) {
        let pointsStr = polygon.getAttribute('points');
        let pointList = pointsStr.split(',');
        let sumx = 0;
        let sumy = 0;
        for (let pi = 0; pi < pointList.length; pi++) {
            let xy = pointList[pi].split(/\s+/);
            sumx += parseFloat(xy[0]);
            sumy += parseFloat(xy[1]);
        }
        return [sumx / pointList.length, sumy / pointList.length];
    }
    function nextPoint(src, dest, degree, scale) {
        let radian = (degree / 180) * Math.PI;
        let dir = [dest[0] - src[0], dest[1] - src[1]];
        let cr = Math.cos(radian);
        let sr = Math.sin(radian);
        let x = dir[0] * cr - dir[1] * sr;
        let y = dir[0] * sr + dir[1] * cr;
        let norm = Math.sqrt(x * x + y * y);
        return [
            src[0] + x * scale / norm,
            src[1] + y * scale / norm
        ];
    }
    function updateConfig() {
        let jsonStr = document.currentScript.textContent.trim();
        if (jsonStr.length > 0) {
            let tmp = JSON.parse(jsonStr);
            for (var tk in tmp) {
                config[tk] = tmp[tk];
            }
        }
    }
})(document, window, console);