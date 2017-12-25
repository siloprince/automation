'use strict';
const Update = (function(console,document){
    document.addEventListener('DOMContentLoaded',function(){
        let updates = document.querySelectorAll('.update');
        for (let ui=0;ui<updates.length;ui++) {
            let tagName = updates[ui].tagName;
            let eventName = null;
            if (/^INPUT$/i.test(tagName)) {
                eventName = 'change';
            } else if (/^SVG$/i.test(tagName)) {
                eventName = 'mouseup';
            }
            if (eventName) {
                updates[ui].addEventListener(eventName, update);
            }
        } 
        update();
    });
    return {
        update: (function(param) {})
    };
    function update () {
        Tess.init();
        Update.update(getParam());
    }
    function getParam () {
        let param = {};
        let updates = document.querySelectorAll('.update');
        for (let ui=0;ui<updates.length;ui++) {
            let update = updates[ui];
            let tagName = update.tagName;
            if (/^INPUT$/i.test(tagName)) {
                param[update.id] = parseFloat(update.value);
            }
        }
        return param;
    }
})(console,document);