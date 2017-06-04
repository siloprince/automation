'use strict';
(function (console) {
    let config = {
        max: 10,
        iteraita: {},
    };
    class Iteraita {
        constructor(name, argv) {
            config.iteraita[name] = this;
            this.argv = argv;
            this.calc = argv.concat([]);
            this.values = [];
            if (argv.length > 0) {
                this.value = argv[argv.legnth - 1];
            } else {
                this.value = 0;
            }
        }
        $(index) {
            if (index < 0) {
                return null;
            }
            if (index >= this.argv.length) {
                return null;
            }
            return this.argv[this.argv.length - 1 - index];
        }
        last() {
            return this.values[this.values.length - 1];
        }
        prev(index) {
            return this.values[this.values.length - 1 - index];
        }
        next() {
            this.value = this._func(this.calc);
            this.calc.shift();
            this.calc.push(this.value);
            this.values.push(this.value);
            return this.value;
        }
        set func(_func) {
            this._func = _func;
        }
        rule(_rule) {
            this._func = convToFunc(_rule);
            function convToFunc(str) {
                let conved = convertFormula(str);
                let opt = { lang: 'es6' };
                return 1;
            }
            function convertFormula(str) {
                if (str.length === 0) {
                    return '';
                } else {
                    // zen to han
                    for (var si = 0; si < str.length; si++) {
                        var code = str.charCodeAt(si);
                        var char = 0;
                        if (code === '　'.charCodeAt(0)) {
                            char = ' ';
                        } else if (code === '０'.charCodeAt(0)) {
                            char = '0';
                        } else if (code === '１'.charCodeAt(0)) {
                            char = '1';
                        } else if (code === '２'.charCodeAt(0)) {
                            char = '2';
                        } else if (code === '３'.charCodeAt(0)) {
                            char = '3';
                        } else if (code === '４'.charCodeAt(0)) {
                            char = '4';
                        } else if (code === '５'.charCodeAt(0)) {
                            char = '5';
                        } else if (code === '６'.charCodeAt(0)) {
                            char = '6';
                        } else if (code === '７'.charCodeAt(0)) {
                            char = '7';
                        } else if (code === '８'.charCodeAt(0)) {
                            char = '8';
                        } else if (code === '９'.charCodeAt(0)) {
                            char = '9';
                        } else if (code === '＋'.charCodeAt(0)) {
                            char = '+';
                        } else if (code === '＊'.charCodeAt(0)) {
                            char = '*';
                        } else if (code === '｀'.charCodeAt(0)) {
                            char = '`';
                        } else if (code === '"'.charCodeAt(0)) {
                            char = '"';
                        } else if (code === '.'.charCodeAt(0)) {
                            char = '.';
                        } else if (code === '，'.charCodeAt(0)) {
                            char = ',';
                        } else if (code === '（'.charCodeAt(0)) {
                            char = '(';
                        } else if (code === '）'.charCodeAt(0)) {
                            char = ')';
                        } else if (code === '＜'.charCodeAt(0)) {
                            char = '<';
                        } else if (code === '＝'.charCodeAt(0)) {
                            char = '=';
                        } else if (code === '＞'.charCodeAt(0)) {
                            char = '>';
                        } else if (code === '｛'.charCodeAt(0)) {
                            char = '{';
                        } else if (code === '｝'.charCodeAt(0)) {
                            char = '}';
                        } else if (code === '｜'.charCodeAt(0)) {
                            char = '|';
                        } else if (code === '？'.charCodeAt(0)) {
                            char = '?';
                        } else if (code === '＄'.charCodeAt(0)) {
                            char = '$';
                        } else if (code === '＆'.charCodeAt(0)) {
                            char = '&';
                        } else if (code === '％'.charCodeAt(0)) {
                            char = '%';
                        } else if (code === '＃'.charCodeAt(0)) {
                            char = '#';
                        } else if (code === '！'.charCodeAt(0)) {
                            char = '!';
                        } else if (code === '＾'.charCodeAt(0)) {
                            char = '^';
                        } else if (code === '＠'.charCodeAt(0)) {
                            char = '@';
                        } else if (code === ';'.charCodeAt(0)) {
                            char = ';';
                        } else if (code === '：'.charCodeAt(0)) {
                            char = ':';
                        } else if (code === '’'.charCodeAt(0)) {
                            char = '\'';
                        }
                        if (char) {
                            str = replaceAt(str, char, si);
                        }
                    }
                    // double quote to single quote
                    // zen - to han - 
                    var strArray = [];
                    if (str.indexOf('ー') > -1) {
                        var lastcode = 0;
                        var code = 0;
                        for (var si = 0; si < str.length; si++) {
                            lastcode = code;
                            code = str.charCodeAt(si);
                            if (code === 'ー'.charCodeAt(0)) {
                                if (lastcode < 128) {
                                    strArray.push('-');
                                }
                            }
                        }
                        str = strArray.join('');
                    }
                    return str;
                }
                function replaceAt(str, char, at) {
                    return str.substr(0, at) + char + str.substr(at + 1, str.length);
                }
            }
            function transformFormula(f, opt) {
                if (f.indexOf('|') > -1) {
                    var splitArray = f.split('|');
                    var valueArray = [];
                    var condArray = [];
                    valueArray.push(splitArray.shift());
                    if (splitArray[0].trim().indexOf('{') !== 0) {
                        if (splitArray.length === 1) {
                            condArray.push(splitArray[0]);
                        }
                    } else {
                        for (var si = 0; si < splitArray.length; si++) {
                            var detailArray = splitArray[si].split('}');
                            var condtmp = '';
                            var nextvalueflag = 0;
                            var nextvaluetmp = '';
                            detailArray[0] = detailArray[0].trim().slice(1);
                            for (var di = 0; di < detailArray.length; di++) {
                                if (detailArray[di].trim().lastIndexOf('{') === -1) {
                                    nextvalueflag++;
                                }
                                if (nextvalueflag === 0) {
                                    condtmp += detailArray[di] + '}';
                                } else if (nextvalueflag === 1) {
                                    condtmp += detailArray[di];
                                } else {
                                    if (di === detailArray.length - 1) {
                                        nextvaluetmp += detailArray[di];
                                    } else {
                                        nextvaluetmp += detailArray[di] + '}';
                                    }
                                }
                            }
                            condArray.push(condtmp.trim());
                            valueArray.push(nextvaluetmp);
                        }
                    }
                    if (opt.lang === 'es6') {
                        // 
                    } else {
                        opt.sideBad = 1;
                        var farray = ['iferror('];
                        for (var ci = 0; ci < condArray.length; ci++) {
                            farray.push('iferror(');
                        }
                        farray.push('(');
                        for (var ci = 0; ci < condArray.length; ci++) {
                            farray.push('N("__if__")+if(and(' + condArray[ci] + ',isnumber(' + valueArray[ci] + ')),N("__then__")+' + valueArray[ci] + ' ,1/0)),');
                        }
                        farray.push('N("__if__")+if(and(1,1/0,1))),"")');
                        f = farray.join('');
                    }
                }
                if (f.indexOf('`') > -1) {
                    if (opt.lang === 'es6') {
                    } else {
                        opt.sideBad = 1;

                        var left = '$4.0+if(""="$4",N("__param___")+len("$2"),0)';
                        var addr = 'regexreplace(address(row($1),column($1)-(' + left + '),4),"[0-9]+","")';
                        var itemLabel = 'indirect(' + addr + '&":"&' + addr + ')';
                        var rep = 'iferror(index(if("$1"="$1",' + itemLabel + ',$1),$4.0+N("__left__")-len("$2")+N("__prev__")-1-($4.0)+len("$2")+row()+N("__formula__")),1/0)';

                        f = f.replace(/([^=<>\|`'"\$;,{&\s\+\-\*\/\(]*)(`+)({([0-9--]+)}|([0-9--]*))/g, rep);
                    }
                }
                if (f.indexOf('\'') > -1) {
                    if (opt.lang === 'es6') {
                    } else {
                        var prev = 'if(""="$4",N("__param___")+len("$2"),1)';
                        var collabel = getColumnLabel(opt.column + 1);
                        var itemLabel = collabel + ':' + collabel;
                        // =iferror(index(電卓A,-1+N("__prev__")+row()+N("__formula__")),1/0) 
                        // =iferror(index(電卓,-2+N("__prev__")+row()+N("__formula__")),1/0)
                        var rep = 'iferror(index(if("$1"="",' + itemLabel + ',$1),-$4.0+N("__prev__")-(' + prev + ')+row()+N("__formula__")),1/0)';

                        f = f.replace(/([^=<>\|`'"\$;,{&\s\+\-\*\/\(]*)('+)({([0-9]+)}|([0-9]*))/g, rep);
                    }
                }
                if (f.indexOf('pack') > -1) {
                    if (opt.lang === 'es6') {
                    } else {
                        var target = 'offset($1,' + opt.frozenRows + '+N("__pack__"),0,' + (opt.maxRows - opt.frozenRows) + ',1)';
                        var subtarget = target.replace('+N("__pack__")', '');
                        var rep = 'iferror(index(filter(' + target + ',' + subtarget + '<>""),if(row()-' + (opt.frozenRows) + '>0,row()-' + (opt.frozenRows) + ',-1)+N("__formula__")),1/0)';
                        f = f.replace(/pack\s*\(\s*([^\s\)]+)\s*\)/g, rep);
                    }
                }
                if (f.indexOf('subseq') > -1) {
                    if (opt.lang === 'es6') {
                    } else {
                        var target = 'offset($1,' + opt.frozenRows + '+N("__subseq__"),0,' + (opt.maxRows - opt.frozenRows) + ',1)';
                        var subtarget = target.replace('+N("__subseq__")', '');
                        var start = 'match(index(filter(' + subtarget + ',' + subtarget + '<>""),1,1),' + subtarget + ',0)';
                        var end = 'match("_",arrayformula(if(offset(' + subtarget + ',' + start + '-1,0)="","_",offset(' + subtarget + ',' + start + '-1,0))),0)';
                        var rep = 'iferror(index(offset(' + target + ',' + start + '-1,0,' + end + ',1),if(row()-' + (opt.frozenRows) + '>0,row()-' + (opt.frozenRows) + ',-1)+N("__formula__")),1/0)';
                        f = f.replace(/subseq\s*\(\s*([^\s\)]+)\s*\)/g, rep);
                    }
                }
                if (f.indexOf('$') > -1) {
                    if (opt.lang === 'es6') {
                    } else {
                        var collabel = getColumnLabel(opt.column + 1);
                        var itemLabel = collabel + ':' + collabel;

                        //var rep = 'iferror(index(if("$1"="",' + itemLabel + ',$1),-$3.0+N("__argv__")+N("__prev__")-1+' + (frozenRows + 1) + '+N("__formula__")),1/0)';
                        var rep = 'iferror(index(if("$1"="",' + itemLabel + ',$1),-$3.0+N("__argv__")+if(index(if("$1"="",' + itemLabel + ',$1),-$3.0-1+' + (opt.frozenRows + 1) + ')="",1/0)+N("__prev__")-1+' + (opt.frozenRows + 1) + '+N("__formula__")),1/0)';

                        f = f.replace(/([^=><\|`'"\$;,{&\s\+\-\*\/\(]*)(\$+)([0-9]+)/g, rep);
                        if (f.indexOf('${') > -1) {
                            f = f.replace(/([^=><\|`'"\$;,{&\s\+\-\*\/\(]*)(\$+){([0-9]+)}/g, rep);
                        }
                    }
                }
                if (f.indexOf('head') > -1) {
                    if (opt.lang === 'es6') {
                    } else {
                        var rep = 'iferror(index($1,$2+N("__head__")+N("$1")-1+if("$2"="",1,0)+' + (opt.frozenRows + 1) + '+N("__formula__")),1/0)';
                        f = f.replace(/head\s*\(\s*([^\s\),]+)\s*,*((-|\+)*[0-9]*)\s*\)/g, rep);
                        if (itemName.length > 0) {
                            var headname = 'N("__head__")+N("' + itemName + '")';
                            if (f.indexOf(headname) > -1) {
                                f = f.replace(headname, 'N("__head__")+N("__prev__")');
                            }
                        }
                    }
                }
                if (f.indexOf('last') > -1) {
                    if (opt.lang === 'es6') {
                    } else {
                        var rep = 'iferror(index($1,-$3.0+N("__last__")+1-if("$3"="",1,0)+' + (opt.maxRows) + '+N("__formula__")),1/0)';
                        f = f.replace(/last\s*\(\s*([^\s\),]+)\s*,*(-|\+)*([0-9]*)\s*\)/g, rep);
                    }
                }
                return f;
            }
        }
    }

    new Iteraita('黄金比', [1]);
    new Iteraita('フィボナッチ', [0, 1]);
    let 黄金比 = config.iteraita['黄金比'];
    let フィボナッチ = config.iteraita['フィボナッチ'];

    new Iteraita('あ', [0]);
    let あ = config.iteraita['あ'];
    new Iteraita('い', [0]);
    let い = config.iteraita['い'];

    for (let i = 0; i < config.max; i++) {
        黄金比.func = function (argv) {
            return 1 + 1 / argv[0];
        };
        フィボナッチ.func = function (argv) {
            return argv[0] + argv[1];
        };
        console.log(黄金比.next());
        console.log(フィボナッチ.next());

        あ.func = function (argv) {
            return argv[0] + 1;
        }
        い.func = function (argv) {
            return あ.last() + 1;
        }
        console.log(あ.next());
        console.log(い.next());
    }
})(console);
