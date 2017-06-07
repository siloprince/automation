'use strict';
(function (document, console) {
    let config = {
        constval: 4,
        max: 5,
        // TODO : config to be migrated to class Rentaku
        iteraita: {},
        depend: {},
    };
    class Iteraita {
        constructor(name) {
            config.iteraita[name] = this;
            this.name = convertItemName(name);
            this._func = null;
            this._rule = null;
            this._argv = null;
            this.calc = [];
            this._values = [];
            return;

            function convertItemName(str) {
                // TODO: support more bad characters
                str = str.toUpperCase();
                var head = str.charCodeAt(0);
                if (str.length === 1) {
                    // C and R is not available
                    if ('A'.charCodeAt(0) <= head && head < 'Z'.charCodeAt(0)) {
                        str = '英' + str;
                        return str;
                    }
                }
                if (str.indexOf('０') > -1) {
                    str = str.replace(/０/g, '0');
                }
                if (str.indexOf('１') > -1) {
                    str = str.replace(/１/g, '1');
                }
                if (str.indexOf('２') > -1) {
                    str = str.replace(/２/g, '2');
                }
                if (str.indexOf('３') > -1) {
                    str = str.replace(/３/g, '3');
                }
                if (str.indexOf('４') > -1) {
                    str = str.replace(/４/g, '4');
                }
                if (str.indexOf('５') > -1) {
                    str = str.replace(/５/g, '5');
                }
                if (str.indexOf('６') > -1) {
                    str = str.replace(/６/g, '6');
                }
                if (str.indexOf('７') > -1) {
                    str = str.replace(/７/g, '7');
                }
                if (str.indexOf('８') > -1) {
                    str = str.replace(/８/g, '8');
                }
                if (str.indexOf('９') > -1) {
                    str = str.replace(/９/g, '9');
                }
                if (/[_\s<>=~!#'"%&;:,\(\)\|\.\\\^\+\-\*\/\?\$　＜＞＝〜！＃’”％＆；：，（）｜．＼＾＋＊／？＄]/.test(str)) {
                    str = str.replace(/[\s<>=~!#'"%&;:,\(\)\|\.\\\^\+\-\*\/\?\$　＜＞＝〜！＃’”％＆；：，（）｜．＼＾＋＊／？＄]/g, '＿');
                }
                head = str.charCodeAt(0);
                var last = str.charCodeAt(str.length - 1);
                if ('A'.charCodeAt(0) <= head && head < 'Z'.charCodeAt(0) && '0'.charCodeAt(0) <= last && last < '9'.charCodeAt(0) && str.indexOf('_') === -1) {
                    var sarray = [];
                    var numflag = 0;
                    for (var si = 0; si < str.length; si++) {
                        var sv = str.charCodeAt(si);
                        if ('A'.charCodeAt(0) <= sv && sv < 'Z'.charCodeAt(0)) {
                            if (numflag) {
                                numflag = 0;
                                break;
                            }
                            sarray.push(str[si]);
                        } else if ('0'.charCodeAt(0) <= sv && sv < '9'.charCodeAt(0)) {
                            if (numflag === 0) {
                                sarray.push('_');
                                numflag = 1;
                            }
                            sarray.push(str[si]);
                        } else {
                            numflag = 0;
                            break;
                        }
                    }
                    if (numflag) {
                        str = sarray.join('');
                    }
                }
                if ('0'.charCodeAt(0) <= head && head < '9'.charCodeAt(0)) {
                    str = '数' + str;
                    return str;
                }
                return str;
            }
        }
        $(index) {
            if (index < 0) {
                return null;
            }
            if (index >= this._argv.length) {
                return null;
            }
            return this._argv[this._argv.length - 1 - index];
        }
        get value() {
            return this._value;
        }
        get values() {
            return this._values;
        }
        get argv() {
            return this._argv;
        }
        last() {
            while (this._values.length < config.max) {
                this._values.push(this.next());
            }
            return this._values[this._values.length - 1];
        }
        prev(index) {
            let idx = this._values.length - 1 - index;
            if (idx >= 0) {
                return this._values[idx];
            } else {
                return this.$(-idx - 1);
            }
        }
        next() {
            this._value = this._func(this.calc);
            this.calc.shift();
            this.calc.push(this._value);
            this._values.push(this._value);
            return this._value;
        }
        set func(_func) {
            this._func = _func;
        }
        set argv(_argv) {
            this._argv = _argv;
            for (let ai = 0; ai < this._argv.length; ai++) {
                this.calc.push(this._argv[ai]);
            }
            if (this._argv.length > 0) {
                this._value = this._argv[this._argv.legnth - 1];
            } else {
                this._value = 0;
            }
        }
        get rule() {
            return this._rule;
        }
        set rule(str) {
            let conved = convertFormula(str);
            this._rule = conved;
            let varied = varyFormula(conved, this.name);
            let opt = { lang: 'es6', itemName: this.name };
            let transformed = transformFormula(varied, opt);
            eval('this._func = function (argv) { return (' + varyAgain(transformed,this.name) + '); }');
            return;

            function varyAgain(str,name) {
                var vary = -1;
                var skipHash = {};
                var variable = [];
                var currentVariIndex = -1;
                var formula = [];

                for (var si = 0; si < str.length; si++) {
                    var code = str.charCodeAt(si);
                    var char = str.substr(si, 1);
                    // no lowercase
                    if (code === ' '.charCodeAt(0) || code === '\t'.charCodeAt(0)) {
                        // nop
                    } else if (!(
                        ('A'.charCodeAt(0) <= code && code <= 'Z'.charCodeAt(0))
                        || (128 <= code)
                        || (vary >= 0 && 
                           ( 
                                '0'.charCodeAt(0) <= code && code <= '9'.charCodeAt(0)
                            ||  code === '_'.charCodeAt(0)
                           )
                        )
                    )) {
                        if (vary === -1) {
                            formula.push(char);
                            vary = -1;
                        } else {
                            skipHash = {};
                            currentVariIndex = variable.length - 1;
                            var vari = variable[currentVariIndex].join('');
                            if (!(vari in config.iteraita)) {
                                throw ('unknown variable:' + vari + 'in ' + name + '  @ ' + str);
                            }
                            formula.push('config.iteraita["' + vari + '"]');
                            formula.push(char);
                            vary = -1;
                        }
                    } else {
                        var match = false;
                        for (var ik in config.iteraita) {
                            if (!(ik in skipHash) && ik.length > vary) {
                                if (ik.charCodeAt(vary + 1) !== code) {
                                    
                                    skipHash[ik] = true;
                                    continue;
                                } else {
                                    match = true;
                                }
                            }
                        }
                        if (match) {
                            if (vary === -1) {
                                variable.push([]);
                            }
                            variable[variable.length - 1].push(char);
                            vary++;
                        } else {
                            variable[variable.length - 1].push(char);
                            var vari = variable[variable.length - 1].join('');
                            throw ('unknown variable:' + vari + ' in ' + name + ' @ ' + str);
                        }
                    }
                }
                if (currentVariIndex === (variable.length - 1) - 1) {
                    currentVariIndex = variable.length - 1;
                    var vari = variable[currentVariIndex].join('');
                    if (!(vari in config.iteraita)) {
                        throw ('unknown variable:' + vari + 'in ' + name + '  @ ' + str);
                    }
                    formula.push('config.iteraita["' + vari + '"]');
                }
                return formula.join('');
            }
            function varyFormula(str, name) {
                var vary = -1;
                var skipHash = {};
                var variable = [];
                var currentVariIndex = -1;
                var formula = [];

                for (var si = 0; si < str.length; si++) {
                    var code = str.charCodeAt(si);
                    var char = str.substr(si, 1);
                    // no lowercase
                    if (code === ' '.charCodeAt(0) || code === '\t'.charCodeAt(0)) {
                        // nop
                    } else if (!(
                        ('A'.charCodeAt(0) <= code && code <= 'Z'.charCodeAt(0))
                        || (128 <= code)
                        || (vary >= 0 && 
                           ( 
                                '0'.charCodeAt(0) <= code && code <= '9'.charCodeAt(0)
                            ||  code === '_'.charCodeAt(0)
                           )
                        )
                    )) {
                        if (vary === -1) {
                            formula.push(char);
                            vary = -1;
                        } else {
                            skipHash = {};
                            currentVariIndex = variable.length - 1;
                            var vari = variable[currentVariIndex].join('');
                            if (!(vari in config.iteraita)) {
                                throw ('unknown variable:' +char+' '+vary+' '+ vari + 'in ' + name + '  @ ' + str);
                            }
                            if (name !== vari) {
                                if (!(name in config.depend)) {
                                    config.depend[name] = {};
                                }
                                if (!(vari in config.depend[name])) {
                                    config.depend[name][vari] = 0;
                                }
                            }
                            if (
                                code === '\''.charCodeAt(0)
                                || code === '`'.charCodeAt(0)
                                || code === '!'.charCodeAt(0)
                                || code === '$'.charCodeAt(0)
                                || code === '.'.charCodeAt(0)
                            ) {
                                formula.push(vari);
                            } else if (
                                code === ')'.charCodeAt(0)
                                || code === ','.charCodeAt(0)
                                || code === '#'.charCodeAt(0)
                            ) {
                                if (name !== vari) {
                                    if (str.indexOf('last(' + vari + ')') > -1) {

                                        config.depend[name][vari] = Math.max(config.max, config.depend[name][vari]);

                                    }
                                    // TODO: to be optimized
                                    if (str.indexOf('last(' + vari + ',') > -1) {

                                        config.depend[name][vari] = Math.max(config.max, config.depend[name][vari]);

                                    }
                                    // TODO: to be optimized
                                    if (str.indexOf(vari + '#') > -1) {

                                        config.depend[name][vari] = Math.max(config.max, config.depend[name][vari]);

                                    }
                                }
                                formula.push(vari);
                            } else {
                                formula.push(vari + '.value');
                            }
                            formula.push(char);
                            vary = -1;
                        }
                    } else {
                        var match = false;
                        for (var ik in config.iteraita) {
                            if (!(ik in skipHash) && ik.length > vary) {
                                if (ik.charCodeAt(vary + 1) !== code) {
                                    skipHash[ik] = true;
                                    continue;
                                } else {
                                    match = true;
                                }
                            }
                        }
                        if (match) {
                            if (vary === -1) {
                                variable.push([]);
                            }
                            variable[variable.length - 1].push(char);
                            vary++;
                        } else {
                            variable[variable.length - 1].push(char);
                            var vari = variable[variable.length - 1].join('');
                            throw ('unknown variable:' + vari + ' in ' + name + ' @ ' + str);
                        }
                    }
                }
                if (currentVariIndex === (variable.length - 1) - 1) {
                    currentVariIndex = variable.length - 1;
                    var vari = variable[currentVariIndex].join('');
                    if (!(vari in config.iteraita)) {
                        throw ('unknown variable:' + vari + 'in ' + name + '  @ ' + str);
                    }
                    formula.push(vari + '.value');

                    if (name !== vari) {
                        if (!(name in config.depend)) {

                            config.depend[name] = {};
                        }
                        if (!(vari in config.depend[name])) {

                            config.depend[name][vari] = 0;
                        }
                    }
                }
                return formula.join('');
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
                        let ifstmt = ['(function(){'];
                        // TODO
                        // randmize
                        for (let ci = 0; ci < condArray.length; ci++) {
                            ifstmt.push('if(' + condArray[ci] + ') { return ' + valueArray[ci] + '}');
                        }
                        ifstmt.push(' return null; })();');
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
                    var rep;
                    if (opt.lang === 'es6') {
                        // TODO
                        rep = '';
                    } else {
                        opt.sideBad = 1;
                        var left = '$4.0+if(""="$4",N("__param___")+len("$2"),0)';
                        var addr = 'regexreplace(address(row($1),column($1)-(' + left + '),4),"[0-9]+","")';
                        var itemLabel = 'indirect(' + addr + '&":"&' + addr + ')';
                        rep = 'iferror(index(if("$1"="$1",' + itemLabel + ',$1),$4.0+N("__left__")-len("$2")+N("__prev__")-1-($4.0)+len("$2")+row()+N("__formula__")),1/0)';
                    }
                    f = f.replace(/([^=<>\|`'"\$;,{&\s\+\-\*\/\(]*)(`+)({([0-9--]+)}|([0-9--]*))/g, rep);
                }
                if (f.indexOf('\'') > -1) {
                    var rep;
                    if (opt.lang === 'es6') {
                        rep = 'this.prev(((""==="$4")?"$2".length:1)-1)';
                    } else {
                        var prev = 'if(""="$4",N("__param___")+len("$2"),1)';
                        var collabel = getColumnLabel(opt.column + 1);
                        var itemLabel = collabel + ':' + collabel;
                        // =iferror(index(電卓A,-1+N("__prev__")+row()+N("__formula__")),1/0) 
                        // =iferror(index(電卓,-2+N("__prev__")+row()+N("__formula__")),1/0)
                        rep = 'iferror(index(if("$1"="",' + itemLabel + ',$1),-$4.0+N("__prev__")-(' + prev + ')+row()+N("__formula__")),1/0)';
                    }
                    f = f.replace(/([^=<>\|`'"\$;,{&\s\+\-\*\/\(]*)('+)({([0-9]+)}|([0-9]*))/g, rep);
                }
                if (f.indexOf('pack') > -1) {
                    var rep;
                    if (opt.lang === 'es6') {
                        rep = '$1.pack()';
                    } else {
                        var target = 'offset($1,' + opt.frozenRows + '+N("__pack__"),0,' + (opt.maxRows - opt.frozenRows) + ',1)';
                        var subtarget = target.replace('+N("__pack__")', '');
                        rep = 'iferror(index(filter(' + target + ',' + subtarget + '<>""),if(row()-' + (opt.frozenRows) + '>0,row()-' + (opt.frozenRows) + ',-1)+N("__formula__")),1/0)';
                    }
                    f = f.replace(/pack\s*\(\s*([^\s\)]+)\s*\)/g, rep);
                }
                if (f.indexOf('subseq') > -1) {
                    var rep;
                    if (opt.lang === 'es6') {
                        rep = '$1.subseq()';
                    } else {
                        var target = 'offset($1,' + opt.frozenRows + '+N("__subseq__"),0,' + (opt.maxRows - opt.frozenRows) + ',1)';
                        var subtarget = target.replace('+N("__subseq__")', '');
                        var start = 'match(index(filter(' + subtarget + ',' + subtarget + '<>""),1,1),' + subtarget + ',0)';
                        var end = 'match("_",arrayformula(if(offset(' + subtarget + ',' + start + '-1,0)="","_",offset(' + subtarget + ',' + start + '-1,0))),0)';
                        rep = 'iferror(index(offset(' + target + ',' + start + '-1,0,' + end + ',1),if(row()-' + (opt.frozenRows) + '>0,row()-' + (opt.frozenRows) + ',-1)+N("__formula__")),1/0)';
                    }
                    f = f.replace(/subseq\s*\(\s*([^\s\)]+)\s*\)/g, rep);
                }
                if (f.indexOf('$') > -1) {
                    var rep;
                    if (opt.lang === 'es6') {
                        rep = '$1.$($3)';
                    } else {
                        var collabel = getColumnLabel(opt.column + 1);
                        var itemLabel = collabel + ':' + collabel;
                        rep = 'iferror(index(if("$1"="",' + itemLabel + ',$1),-$3.0+N("__argv__")+if(index(if("$1"="",' + itemLabel + ',$1),-$3.0-1+' + (opt.frozenRows + 1) + ')="",1/0)+N("__prev__")-1+' + (opt.frozenRows + 1) + '+N("__formula__")),1/0)';
                    }
                    f = f.replace(/([^=><\|`'"\$;,{&\s\+\-\*\/\(]*)(\$+)([0-9]+)/g, rep);
                    if (f.indexOf('${') > -1) {
                        f = f.replace(/([^=><\|`'"\$;,{&\s\+\-\*\/\(]*)(\$+){([0-9]+)}/g, rep);
                    }
                }
                if (f.indexOf('head') > -1) {
                    var rep;
                    if (opt.lang === 'es6') {
                        rep = '$1.head($2)';
                    } else {
                        rep = 'iferror(index($1,$2+N("__head__")+N("$1")-1+if("$2"="",1,0)+' + (opt.frozenRows + 1) + '+N("__formula__")),1/0)';
                    }
                    f = f.replace(/head\s*\(\s*([^\s\),]+)\s*,*((-|\+)*[0-9]*)\s*\)/g, rep);
                    if (opt.lang === 'es6') {
                        // nop
                    } else {
                        if (opt.itemName.length > 0) {
                            var headname = 'N("__head__")+N("' + opt.itemName + '")';
                            if (f.indexOf(headname) > -1) {
                                f = f.replace(headname, 'N("__head__")+N("__prev__")');
                            }
                        }
                    }
                }
                if (f.indexOf('last') > -1) {
                    var rep;
                    if (opt.lang === 'es6') {
                        rep = '$1.last($2)';
                    } else {
                        rep = 'iferror(index($1,-$3.0+N("__last__")+1-if("$3"="",1,0)+' + (opt.maxRows) + '+N("__formula__")),1/0)';
                    }
                    f = f.replace(/last\s*\(\s*([^\s\),]+)\s*,*(-|\+)*([0-9]*)\s*\)/g, rep);
                }
                return f;
            }
        }
    }
    class Rentaku {
        constructor(statements, max, constval) {
            if (max) {
                config.max = max;
            }
            if (constval) {
                config.constval = constval;
            }
            config.iteraita = {};
            config.depend = {};
            let stmtArray = statements.split('@');
            var decl;
            this._decls = [];
            this.rules = [];
            this.argvs = [];
            for (let si = 0; si < stmtArray.length; si++) {
                let stmt = stmtArray[si].trim();
                let lines = stmt.split('\n');
                if (si !== stmtArray.length - 1) {
                    decl = lines.pop().trim();
                    if (si === 0) {
                        if (lines.length !== 0) {
                            throw ('invalid name:' + decl);
                        }
                        this._decls.push(decl);
                        continue;
                    } else if (si !== stmtArray.length - 1) {
                        if (!checkDecl(decl)) {
                            throw ('unknown name:' + decl);
                        }
                        this._decls.push(decl);
                    }
                }
                let rest = lines.join();
                let sideopt = { side: false };
                let formulaArray = splitToFormulas(rest, sideopt);
                let rule = formulaArray.shift();
                this.rules.push(rule);
                let argv = [];
                for (let fi = 0; fi < formulaArray.length; fi++) {
                    argv.push(eval(formulaArray[fi]));
                }
                this.argvs.push(argv);
            }
            for (let di = 0; di < this._decls.length; di++) {
                let iter = new Iteraita(this._decls[di], this.argvs[di]);
                iter.argv = this.argvs[di];
            }
            for (let di = 0; di < this._decls.length; di++) {
                let decl = this._decls[di];
                let iter = config.iteraita[decl];
                iter.rule = this.rules[di];
            }
            this.starts = {};
            this.setStart(this._decls, this.starts);
            return;

            function splitToFormulas(orgf, sideopt) {
                var formulaArray = [];
                if (orgf.indexOf('[') > -1) {
                    sideopt.side = 1;
                    var form = '';
                    var splitArray = orgf.split(']');
                    splitArray.pop();
                    for (var si = 0; si < config.constval; si++) {
                        var sj = splitArray.length - 1 - si;
                        if (sj >= 0) {
                            if (sj === 0) {
                                form = splitArray[sj].slice(0, splitArray[sj].indexOf('[')).trim();
                            }
                            var val = splitArray[sj].slice(splitArray[sj].indexOf('[') + 1);
                            formulaArray.unshift(val.trim());
                        } else {
                            formulaArray.unshift('');
                        }
                    }
                    if (form === '') {
                        form = splitArray[0].slice(0, splitArray[0].indexOf('[')).trim();
                    }
                    formulaArray.unshift(form);
                } else {
                    formulaArray.push(orgf);
                }
                return formulaArray;
            }
            function checkDecl(str) {
                for (var si = 0; si < str.length; si++) {
                    var vary = si;
                    var code = str.charCodeAt(si);
                    // no lowercase
                    if (!(
                        ('A'.charCodeAt(0) <= code && code <= 'Z'.charCodeAt(0))
                        || (128 <= code)
                        || (vary >= 0 && 
                           ( 
                                '0'.charCodeAt(0) <= code && code <= '9'.charCodeAt(0)
                            ||  code === '_'.charCodeAt(0)
                           )
                        )
                    )) {
                        return false;
                    }
                }
                return true;
            }
        }
        run(_max) {
            if (_max) {
                config.max = _max;
                for (let di = 0; di < this._decls.length; di++) {
                    let decl = this._decls[di];
                    let iter = config.iteraita[decl];
                    iter.rule = this.rules[di];
                }
                this.setStart(this._decls, this.starts);
            }
            let max = 0;
            for (let sk in this.starts) {
                max = Math.max(max, this.starts[sk]);
            }
            max += config.max;
            console.log(max);
            console.log(config.depend);
            console.log(this.starts);
            for (let i = 0; i < max + config.max; i++) {
                for (let di = 0; di < this._decls.length; di++) {
                    let decl = this._decls[di];
                    let iter = config.iteraita[decl];
                    if (this.starts[decl] <= i && i <= this.starts[decl] + config.max - 1) {
                        iter.next();
                    }
                }
            }
        }
        setStart(decls, starts) {
            // clear
            for (let di = 0; di < decls.length; di++) {
                let decl = decls[di];
                if (decl in starts) {
                    delete starts[decl];
                }
            }
            for (let di = 0; di < decls.length; di++) {
                let decl = decls[di];
                if (!(decl in config.depend)) {
                    starts[decl] = 0;
                }
            }
            setStartRepeat(0, decls, starts);
            return;

            function setStartRepeat(depth, decls, starts) {
                if (depth > decls.length) {
                    throw ('dependency loop detected.' + depth + ' ' + decls.length);
                }
                let more = false;
                for (let decl in config.depend) {
                    let tmp = -1;
                    for (let dep in config.depend[decl]) {
                        if (dep in starts) {
                            tmp = Math.max(config.depend[decl][dep] + starts[dep], tmp);
                        }
                    }
                    if (tmp !== -1) {
                        if (!(decl in starts)) {
                            starts[decl] = 0;
                        }
                        starts[decl] += tmp;
                    } else {
                        more = true;
                    }
                }
                if (more) {
                    setStartRepeat(depth + 1, decls, starts);
                }
            }
        }
        get decls() {
            return this._decls;
        }
    }
    config.rentaku = `
    黄金比 @ 1 + 1/黄金比' [1]
    フィボナッチ @ フィボナッチ' + フィボナッチ'' [0][1]
    あ @ あ' + 1 [0]
    い @ last(あ) +1
    う @ あ + 2
    `;
    if (document) {
        let script = document.currentScript;
        let nowtime = new Date().getTime();
        script.insertAdjacentHTML('afterend', `<textarea id="ta${nowtime}"></textarea>`);
        let textarea = document.querySelector(`textarea#ta${nowtime}`);
        let limit = config.max;
        textarea.insertAdjacentHTML('afterend', `<span style="font-size:9pt;"> iteration limit: <input id="ip${nowtime}"input type="number" min="1" max="1000" step="1" style="width:40px;" value="${limit}"/></span>`);
        let input = document.querySelector(`input#ip${nowtime}`);
        input.insertAdjacentHTML('afterend', `<table id="tb${nowtime}" border="1"></table>`);
        let table = document.querySelector(`table#tb${nowtime}`);
        table.setAttribute('style', 'font-size:9pt;');
        textarea.setAttribute('rows', 15);
        textarea.setAttribute('cols', 80);
        textarea.value = config.rentaku;

        render(table, textarea.value);
        textarea.addEventListener('keyup', function (e) {
            if (e.key === 'Enter' || e.key === 'Escape') {
                render(table, e.target.value);
            }
        }, false);
        textarea.addEventListener('mouseout', function (e) {
            render(table, e.target.value);
        }, false);
        input.addEventListener('change', function (e) {
            render(table, textarea.value, e.target.value);
        }, false);
        return;

        function render(table, value, max) {
            if (!value) {
                value = config.rentaku;
            }
            if (!max) {
                max = config.max;
            }
            let ren = new Rentaku(value);
            ren.run(max);
            let decls = ren.decls;
            table.innerHTML = '<thead><tr></tr></thead><tbody></tbody>';
            let theadTr = table.querySelector('thead tr');
            let tbody = table.querySelector('tbody');
            let theadThStyle = 'style="background-color:#444499;color:#ffffff;"';
            for (let di = 0; di < decls.length; di++) {
                theadTr.insertAdjacentHTML('beforeend', `<th ${theadThStyle}>${decls[di]}</th>`);
            }
            let ruleTdStyle = 'style="background-color:#ffffcc;height:16pt;vertical-align:top;text-align: left;word-wrap:break-word;max-width:100pt;"';
            {
                tbody.insertAdjacentHTML('beforeend', `<tr></tr>`);
                let tbodyTr = tbody.querySelector('tr:last-child');
                for (let di = 0; di < decls.length; di++) {
                    let decl = decls[di];
                    let iteraita = config.iteraita[decl];
                    let cell = '';
                    if (iteraita.rule) {
                        cell = iteraita.rule;
                    }
                    tbodyTr.insertAdjacentHTML('beforeend', `<td ${ruleTdStyle}>${cell}</td>`);
                }
            }
            let graphThStyle = 'style="background-color:#aa99ff;height:30pt;"';
            {
                tbody.insertAdjacentHTML('beforeend', `<tr></tr>`);
                let tbodyTr = tbody.querySelector('tr:last-child');
                for (let di = 0; di < decls.length; di++) {
                    tbodyTr.insertAdjacentHTML('beforeend', `<td ${graphThStyle}></td>`);
                }
            }
            let argvTdStyle = 'style="background-color:#ccffcc;height:16pt;text-align: right;"';
            for (let ci = 0; ci < config.constval; ci++) {
                tbody.insertAdjacentHTML('beforeend', `<tr></tr>`);
                let tbodyTr = tbody.querySelector('tr:last-child');
                for (let di = 0; di < decls.length; di++) {
                    let decl = decls[di];
                    let iteraita = config.iteraita[decl];
                    let cell = '';
                    if (iteraita.argv && ci < iteraita.argv.length && typeof (iteraita.argv[ci]) !== 'undefined') {
                        cell = iteraita.argv[ci];
                    }
                    tbodyTr.insertAdjacentHTML('beforeend', `<td ${argvTdStyle}>${cell}</td>`);
                }
            }
            for (let mi = 0; mi < config.max; mi++) {
                tbody.insertAdjacentHTML('beforeend', `<tr></tr>`);
                let tbodyTr = tbody.querySelector('tr:last-child');
                for (let di = 0; di < decls.length; di++) {
                    let decl = decls[di];
                    let iteraita = config.iteraita[decl];
                    let cell = iteraita.values[mi];
                    tbodyTr.insertAdjacentHTML('beforeend', `<td style="text-align: right;">${cell}</td>`);
                }
            }
        }
    } else {
        let rentaku = `
あ @ 11
い @	last(あ)
う @ い
`;
        let rentaku2 = `
あ2 @ あ2' + 1 [0]
い @ last(あ2) +1
う @ last(い) + 2
え @ last(う) + 2
`;
//try {
        let ren = new Rentaku(rentaku2);
        ren.run();
        for (let di = 0; di < ren.decls.length; di++) {
            let decl = ren.decls[di];
            let iter = config.iteraita[decl];
            console.log(decl + ': ' + iter.values);
        }
//} catch(e){
//        console.log(e);
        //console.log(config.iteraita);
//}
        // TODO: benchmark
        // side support
        // conditional support
        // live on github.com
    }
})(typeof (document) !== 'undefined' ? document : null, console);
