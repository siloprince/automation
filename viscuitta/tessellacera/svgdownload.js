'use strict';
(function (console, document, window, Blob) {

    document.addEventListener('DOMContentLoaded', downloadInit);
    return;

    function downloadInit() {
        let downloads = document.querySelectorAll('a.download');
        let content = getSvgContent();
        let blob = new Blob([content], { 'type': 'image/svg+xml' });
        let filename = getFileName();
        for (let di = 0; di < downloads.length; di++) {
            let download = downloads[di];
            download.href = '#';
            download.download = filename + getDateStr() + '.svg';
            download.addEventListener('click', click);
        }
        function getSvgContent() {
            let svgdiv = document.querySelector('div.svg');
            return svgdiv.innerHTML;
        }
        function click(ev) {
            ev.target.href = window.URL.createObjectURL(blob);
        }
        function getFileName() {
            let pathname = document.location.pathname;
            let name = '_';
            if (/([^\/]+)$/.exec(pathname)) {
                pathname = RegExp.$1;
                if (/^([^\?#.]+)/.exec(pathname)) {
                    name = RegExp.$1;
                }
            }
            return name;
        }
        function getDateStr() {
            let date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            return `${year}${pad(month)}${pad(day)}${pad(hours)}${pad(minutes)}${pad(seconds)}`;

            function pad(val) {
                if (val < 10) {
                    val = '0' + val;
                }
                return val;
            }
        }
    }
})(console, document, window, Blob);