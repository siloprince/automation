
'use strict';
const Draw = (function (console, document) {
    // https://codepen.io/kwst/pen/vgGgqN?editors=1000

    document.addEventListener('DOMContentLoaded', drawInit);

    return {
        getData: function (name) {
            return document.querySelector(`svg#${name} path#curve_${name}`).getAttribute('d');
        }
    };
    function drawInit() {
        const containerList = document.querySelectorAll('svg.draw');
        const offset = 40;


        let isDrawing = false;
        let drawingPoints;
        let drawingPath;
        const defaultPathStyle = {
            strokeWidth: "1.5px",
            stroke: "#000",
            fill: "none",
            vectorEffect: "non-scaling-stroke",
        };

        for (let ci = 0; ci < containerList.length; ci++) {
            let container = containerList[ci];
            mousedown(container);
            mousemove(container, 100, 50);
            mouseup(container);
            container.addEventListener('mousedown', function (e) {
                mousedown(container);
            });

            container.addEventListener('mousemove', function (e) {
                let dim = container.getBoundingClientRect();
                let x = e.clientX - dim.left;
                let y = e.clientY - dim.top;
                mousemove(container, x, y);
            });

            container.addEventListener('mouseup', function (e) {
                mouseup(container);
            });
        }


        function clear(container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            let cx = parseInt(container.getAttribute('width'), 10) - offset;
            let cy = parseInt(container.getAttribute('height'), 10) / 2;
            let style = window.getComputedStyle(container, null);
            let color = style.borderColor;
            container.insertAdjacentHTML('beforeend', `<circle r="10" cx="${offset}" cy="${cy}" fill="${color}" />`);
            container.insertAdjacentHTML('beforeend', `<circle r="10" cx="${cx}" cy="${cy}" fill="${color}" />`);

        }
        function mousedown(container) {
            clear(container);
            isDrawing = true;
            let cy = parseInt(container.getAttribute('height'), 10) / 2;
            drawingPoints = [{ x: offset, y: cy }];
        }
        function mousemove(container, x, y) {
            if (isDrawing) {
                drawingPoints.push({ x: x, y: y });
                if (drawingPath) {
                    container.removeChild(drawingPath);
                }
                drawingPath = createPathWithBezier(drawingPoints, x, y);
                Object.assign(drawingPath.style, defaultPathStyle);
                container.appendChild(drawingPath);
            }
        }
        function mouseup(container) {
            isDrawing = false;
            if (!drawingPath) {
                return;
            }
            let cx = parseInt(container.getAttribute('width'), 10) - offset;
            let cy = parseInt(container.getAttribute('height'), 10) / 2;
            drawingPoints.push({ x: cx, y: cy });
            container.removeChild(drawingPath);
            drawingPath = null;
            drawingPoints = simplify(drawingPoints, parseFloat(8), true);
            let path;
            path = createPathWithBezier(drawingPoints, cx, cy);
            Object.assign(path.style, defaultPathStyle);
            let scale = 100 / (cx - offset);
            let pathData = path.getAttribute('d');
            let pathModData = SvgPath(pathData).translate(-offset, -cy).scale(scale).translate(-50, 0);
            path.setAttribute('d', pathModData.toString());
            path.id = `curve_${container.id}`
            let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttributeNS(null, 'transform', `translate(${offset},${cy})scale(${1 / scale},1)translate(50,0)`);
            g.appendChild(path);
            container.appendChild(g);
        }
        function createPathWithBezier(points, cx, cy) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const cubics = catmullRom2bezier(points);
            let attribute = `M${points[0].x}, ${points[0].y}`;
            for (let i = 0; i < cubics.length; i++) {
                attribute += `C${cubics[i][0]},${cubics[i][1]} ${cubics[i][2]},${cubics[i][3]} ${cubics[i][4]},${cubics[i][5]}`;
                if (cubics[i][2] === cx && cubics[i][3] === cy && cubics[i][4] === cx && cubics[i][5] === cy) {
                    break;
                }
            }
            path.setAttributeNS(null, 'd', attribute);
            return path;
        }

        function catmullRom2bezier(pts) {
            var cubics = [];
            for (var i = 0, iLen = pts.length; i < iLen; i++) {
                var p = [
                    pts[i - 1],
                    pts[i],
                    pts[i + 1],
                    pts[i + 2]
                ];
                if (i === 0) {
                    p[0] = {
                        x: pts[0].x,
                        y: pts[0].y
                    }
                }
                if (i === iLen - 2) {
                    p[3] = {
                        x: pts[iLen - 2].x,
                        y: pts[iLen - 2].y
                    };
                }
                if (i === iLen - 1) {
                    p[2] = {
                        x: pts[iLen - 1].x,
                        y: pts[iLen - 1].y
                    };
                    p[3] = {
                        x: pts[iLen - 1].x,
                        y: pts[iLen - 1].y
                    };
                }
                const val = 6;
                cubics.push([
                    (-p[0].x + val * p[1].x + p[2].x) / val,
                    (-p[0].y + val * p[1].y + p[2].y) / val,
                    (p[1].x + val * p[2].x - p[3].x) / val,
                    (p[1].y + val * p[2].y - p[3].y) / val,
                    p[2].x,
                    p[2].y
                ]);
            }
            return cubics;
        }


        // to suit your point format, run search/replace for '.x' and '.y';
        // for 3D version, see 3d branch (configurability would draw significant performance overhead)

        // square distance between 2 points
        function getSqDist(p1, p2) {

            var dx = p1.x - p2.x,
                dy = p1.y - p2.y;

            return dx * dx + dy * dy;
        }

        // square distance from a point to a segment
        function getSqSegDist(p, p1, p2) {

            var x = p1.x,
                y = p1.y,
                dx = p2.x - x,
                dy = p2.y - y;

            if (dx !== 0 || dy !== 0) {

                var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

                if (t > 1) {
                    x = p2.x;
                    y = p2.y;

                } else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }

            dx = p.x - x;
            dy = p.y - y;

            return dx * dx + dy * dy;
        }
        // rest of the code doesn't care about point format

        // basic distance-based simplification
        function simplifyRadialDist(points, sqTolerance) {

            var prevPoint = points[0],
                newPoints = [prevPoint],
                point;

            for (var i = 1, len = points.length; i < len; i++) {
                point = points[i];

                if (getSqDist(point, prevPoint) > sqTolerance) {
                    newPoints.push(point);
                    prevPoint = point;
                }
            }

            if (prevPoint !== point) newPoints.push(point);

            return newPoints;
        }

        function simplifyDPStep(points, first, last, sqTolerance, simplified) {
            var maxSqDist = sqTolerance,
                index;

            for (var i = first + 1; i < last; i++) {
                var sqDist = getSqSegDist(points[i], points[first], points[last]);

                if (sqDist > maxSqDist) {
                    index = i;
                    maxSqDist = sqDist;
                }
            }

            if (maxSqDist > sqTolerance) {
                if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
                simplified.push(points[index]);
                if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
            }
        }

        // simplification using Ramer-Douglas-Peucker algorithm
        function simplifyDouglasPeucker(points, sqTolerance) {
            var last = points.length - 1;

            var simplified = [points[0]];
            simplifyDPStep(points, 0, last, sqTolerance, simplified);
            simplified.push(points[last]);

            return simplified;
        }

        // both algorithms combined for awesome performance
        function simplify(points, tolerance, highestQuality) {

            if (points.length <= 2) return points;

            var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

            points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
            points = simplifyDouglasPeucker(points, sqTolerance);

            return points;
        }

        // export as AMD module / Node module / browser or worker variable
        if (typeof define === 'function' && define.amd) define(function () { return simplify; });
        else if (typeof module !== 'undefined') module.exports = simplify;
        else if (typeof self !== 'undefined') self.simplify = simplify;
        else window.simplify = simplify;
    }

})(console, document);