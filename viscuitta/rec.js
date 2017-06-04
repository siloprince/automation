'use strict';
(function (console) {
    let config = {
        constval: 4,
        max: 10,
        iteraita: {},
    };
    class Iteraita {
        constructor(name, argv) {
            config.iteraita[name] = this;
            this.name = convertItemName(name);
            this._func = null;
            this.argv = argv;
            this.calc = argv.concat([]);
            this.values = [];
            if (argv.length > 0) {
                this.value = argv[argv.legnth - 1];
            } else {
                this.value = 0;
            }
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
            if (index >= this.argv.length) {
                return null;
            }
            return this.argv[this.argv.length - 1 - index];
        }
        val() {
            return this.value;
        }
        last() {
            while (this.values.length < config.max) {
                this.values.push(this.next());
            }
            return this.values[this.values.length - 1];
        }
        prev(index) {
            let idx = this.values.length - 1 - index;
            if (idx >= 0) {
                return this.values[idx];
            } else {
                return this.$(-idx - 1);
            }
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
        rule(str) {
            let conved = convertFormula(str);
            let varied = varyFormula(conved, this.name);
            let opt = { lang: 'es6', itemName: this.name };
            let transformed = transformFormula(varied, opt);
            eval('this._func = function (argv) { return (' + transformed + '); }');
            return;

            function varyFormula(str, name) {
                var vary = -1;
                var skipHash = {};
                var variable = [];
                var formula = [];
                for (var si = 0; si < str.length; si++) {
                    var code = str.charCodeAt(si);
                    var char = str.substr(si, 1);
                    // no lowercase
                    if (!(
                        ('A'.charCodeAt(0) <= code && code <= 'Z'.charCodeAt(0))
                        || (128 <= code)
                        || (vary > 0 && code === '_'.charCodeAt(0))
                    )) {
                        if (vary === -1) {
                            formula.push(char);
                            vary = -1;
                        } else {
                            var vari = variable[variable.length - 1].join('');
                            if (!(vari in config.iteraita)) {
                                throw ('unknown variable:' + vari + 'in ' + name + '  @ ' + str);
                            }
                            if (
                                code === '\''.charCodeAt(0)
                                || code === '`'.charCodeAt(0)
                                || code === '!'.charCodeAt(0)
                                || code === '#'.charCodeAt(0)
                                || code === '$'.charCodeAt(0)
                                || code === '.'.charCodeAt(0)
                                || code === ')'.charCodeAt(0)
                            ) {
                                formula.push(vari);
                            } else {
                                formula.push(vari + '.val()');
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
            let stmtArray = statements.split('@');
            var decl;
            this.decls = [];
            this.rules = [];
            this.argvs = [];
            for (let si = 0; si < stmtArray.length; si++) {
                let stmt = stmtArray[si].trim();
                let lines = stmt.split('\n');
                decl = lines.pop().trim();
                if (si === 0) {
                    if (lines.length !== 0) {
                        throw ('invalid name:' + decl);
                    }
                    this.decls.push(decl);
                } else if (si !== stmtArray.length - 1) {
                    if (!checkDecl(decl)) {
                        throw ('invalid name:' + decl);
                    }
                    this.decls.push(decl);
                }
                let rest = lines.join();
                let sideopt = { side: false };
                let formulaArray = splitToFormulas(rest, sideopt);
                let rule = formulaArray.shift();
                // TODO: check dependencies by use of varyFormula
                let argv = formulaArray;
                this.rules.push(rule);
                this.argvs.push(argv);
            }
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
                        || (vary > 0 && code === '_'.charCodeAt(0))
                    )) {
                        return false;
                    }
                }
                return true;
            }
            function varyFormula(str, name) {
                var vary = -1;
                var skipHash = {};
                var variable = [];
                var formula = [];
                for (var si = 0; si < str.length; si++) {
                    var code = str.charCodeAt(si);
                    var char = str.substr(si, 1);
                    // no lowercase
                    if (!(
                        ('A'.charCodeAt(0) <= code && code <= 'Z'.charCodeAt(0))
                        || (128 <= code)
                        || (vary > 0 && code === '_'.charCodeAt(0))
                    )) {
                        if (vary === -1) {
                            formula.push(char);
                            vary = -1;
                        } else {
                            var vari = variable[variable.length - 1].join('');
                            if (!(vari in config.iteraita)) {
                                throw ('unknown variable:' + vari + 'in ' + name + '  @ ' + str);
                            }
                            if (
                                code === '\''.charCodeAt(0)
                                || code === '`'.charCodeAt(0)
                                || code === '!'.charCodeAt(0)
                                || code === '#'.charCodeAt(0)
                                || code === '$'.charCodeAt(0)
                                || code === '.'.charCodeAt(0)
                                || code === ')'.charCodeAt(0)
                            ) {
                                formula.push(vari);
                            } else {
                                formula.push(vari + '.val()');
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
                return formula.join('');
            }
        }
        run() {
            for (let di = 0; di < this.decls.length; di++) {
                new Iteraita(this.decls[di], this.argvs[di]);
            }
        }
    }

    let rentaku = `
    黄金比 @ 1 + 1/黄金比' [1]
    フィボナッチ @ フィボナッチ' + フィボナッチ'' [0][1]
    あ @ あ' + 1 [0]
    い @ last(あ) +1
    う @ あ + 2
    `;
    let ren = new Rentaku(rentaku);
    ren.run();

    new Iteraita('黄金比', [1]);
    new Iteraita('フィボナッチ', [0, 1]);
    let 黄金比 = config.iteraita['黄金比'];
    let フィボナッチ = config.iteraita['フィボナッチ'];

    new Iteraita('あ', [0]);
    let あ = config.iteraita['あ'];
    new Iteraita('い', [0]);
    let い = config.iteraita['い'];
    new Iteraita('う', [0]);
    let う = config.iteraita['う'];
    try {
        for (let i = 0; i < config.max; i++) {
            黄金比.func = function (argv) {
                return 1 + 1 / argv[0];
            };
            フィボナッチ.func = function (argv) {
                return argv[0] + argv[1];
            };
            //console.log(黄金比.next());
            //console.log(フィボナッチ.next());
            /*
            あ.func = function (argv) {
                return argv[0] + 1;
            };
            */
            あ.rule(" あ' + 1 ");
            う.rule(" あ + 2 ");
            /*
            い.func = function (argv) {
                return あ.last() + 1;
            };
            */
            console.log('あ:' + あ.next());
            console.log('う:' + う.next());
        }

        for (let i = 0; i < config.max; i++) {
            い.rule("last(あ)+1");
            console.log('い:' + い.next());
        }
    } catch (ex) {
        console.log(ex);
    }
})(console);
