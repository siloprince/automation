'use strict';
(function (document, console) {
    let config = {
        constval: 4,
        max: 4,
        // TODO : config to be migrated to class Rentaku
        iteraita: {},
        instances: {},
        rentaku: {
            decls: [],
            rules: [],
            argvs: [],
            tmp: 0,
            hash: {},
            init: {}
        },
        depend: {},
    };
    class Instance {
        constructor(iteraita) {
            this.iteraita = iteraita;
            this._index = config.instances[this.iteraita.name].length;
            this._rule = null;
            this._argv = null;
            this.calc = [];
            this._values = [];
            return;
        }
        get index() {
            return this._index;
        }
        get name() {
            return this.iteraita.name;
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
        get values() {
            return this._values;
        }
        last() {
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
            let func = this.iteraita.func;
            this._value = func(this,this.calc, this._values.length, this.index, this.name);
            this.calc.shift();
            this.calc.push(this._value);
            this._values.push(this._value);
            return this._value;
        }
        get argv() {
            return this._argv;
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
    }
    class Iteraita {
        constructor(name, argc) {
            config.iteraita[name] = this;
            this._name = convertItemName(name, this);
            this._func = null;
            this._rule = null;
            this._argv = null;
            this.argc = argc;
            this.calc = [];
            this._values = [];
            return;

            function convertItemName(str, self) {
                // TODO: support more bad characters
                str = self.convertZenToHan(str).trim();
                str = str.toUpperCase();
                if (/[~\-\+\*\/<>=!#'"%&;:,\(\)\|\.\\\^\?`{}@\$]/.test(str)) {
                    str = str.replace(/[~\-\+\*\/<>=!#'"%&;:,\(\)\|\.\\\^\?`{}@\$]/g, '＿');
                }
                var head = str.charCodeAt(0);
                var last = str.charCodeAt(str.length - 1);
                if (
                    'A'.charCodeAt(0) <= head
                    && head < 'Z'.charCodeAt(0)
                    && '0'.charCodeAt(0) <= last
                    && last < '9'.charCodeAt(0)
                    && str.indexOf('_') === -1
                ) {
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
        new(argv) {
            let len = 0;
            for (let ai = 0; ai < argv.length; ai++) {
                if (typeof (argv[ai]) !== 'undefined') {
                    len++;
                }
            }
            if (len !== this.argc) {
                throw 'the following number of length of argv is required:' + this.argc + ' ' + len;
            }
            if (!(this._name in config.instances)) {
                config.instances[this._name] = [];
            }
            let ret = new Instance(this, argv);
            config.instances[this._name].push(ret);
            ret.argv = argv;
            return ret;
        }
        get name() {
            return this._name;
        }
        get argv() {
            return this._argv;
        }
        get func() {
            return this._func;
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
        getBaseFunctions() {
            let mod = function (x, y) { return x % y; };
            let and = function () {
                let args = Array.prototype.slice.call(arguments, 0);
                let ret = true;
                for (let ai = 0; ai < args.length; ai++) {
                    ret = ret && args[ai];
                }
                return ret;
            };
            let or = function () {
                let args = Array.prototype.slice.call(arguments, 0);
                let ret = false;
                for (let ai = 0; ai < args.length; ai++) {
                    ret = ret || args[ai];
                }
                return ret;
            };
            return {
                mod: mod,
                and: and,
                or: or
            };
        }
        convertPostProcess(str, name, side) {
            let varied = varyFormula(str, name, side);
            let opt = { lang: 'es6', itemName: name };
            let transformed = transformFormula(varied, opt);
            let again = varyAgain(transformed, name);
            return again.replace(/\(\./g,'\(self.');

            function varyAgain(str, name) {
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
                        // no wsp
                    } else if (!(
                        ('A'.charCodeAt(0) <= code && code <= 'Z'.charCodeAt(0))
                        || code === '_'.charCodeAt(0)
                        || (128 <= code)
                        || (vary >= 0 &&
                            (
                                '0'.charCodeAt(0) <= code && code <= '9'.charCodeAt(0)
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
                                throw ('unknown variable:' + vari + ' in ' + name + '  @ ' + str);
                            }
                            // TODO: [0] varyAgain
                            formula.push('config.instances["' + vari + '"][0]');
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
                        if (vary === -1) {
                            variable.push([]);
                        }
                        if (match) {
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
                        throw ('unknown variable:' + vari + ' in ' + name + '  @ ' + str);
                    }
                    // TODO: [0] varyAgain
                    formula.push('config.instances["' + vari + '"][0]');
                }
                let ret = formula.join('');
                return ret;
            }
            function varyFormula(str, name, side) {
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
                        || code === '_'.charCodeAt(0)
                        || (128 <= code)
                        || (vary >= 0 &&
                            (
                                '0'.charCodeAt(0) <= code && code <= '9'.charCodeAt(0)
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
                                throw ('unknown variable:' + char + ' ' + vary + ' ' + vari + ' in ' + name + '  @ ' + str);
                            }
                            if (name !== vari) {
                                if (!(name in config.depend)) {
                                    config.depend[name] = {};
                                }
                                if (!(vari in config.depend[name])) {
                                    if (!side) {
                                        config.depend[name][vari] = 0;
                                    }
                                }
                            }
                            let pushed = false;
                            if (
                                code === '\''.charCodeAt(0)
                                || code === '`'.charCodeAt(0)
                                || code === '!'.charCodeAt(0)
                                || code === '$'.charCodeAt(0)
                                || code === '.'.charCodeAt(0)
                            ) {
                                formula.push(vari);
                                pushed = true;
                            } else if (
                                code === '#'.charCodeAt(0)
                            ) {
                                formula.push(vari);
                                pushed = true;
                            } else if (
                                code === ')'.charCodeAt(0)
                            ) {
                                if (name !== vari) {
                                    if (str.indexOf('last(' + vari + ')') > -1) {
                                        formula.push(vari);
                                        pushed = true;
                                    }
                                }

                            }
                            if (!pushed) {
                                if (
                                    code === ')'.charCodeAt(0) &&
                                    str.indexOf('last(' + vari + ')') > -1
                                ) {
                                    formula.push(vari);
                                    pushed = true;
                                } else {
                                    if (!(name in config.rentaku.init)) {
                                        formula.push(vari + '.values[idx]');
                                    } else {
                                        formula.push(vari);
                                    }
                                }
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
                        if (vary === -1) {
                            variable.push([]);
                        }
                        if (match) {
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
                        throw ('unknown variable:' + vari + ' in ' + name + '  @ ' + str);
                    }
                    if (!(name in config.rentaku.init)) {
                        formula.push(vari + '.values[idx]');
                    } else {
                        formula.push(vari);
                    }
                    if (name !== vari) {
                        if (!(name in config.depend)) {

                            config.depend[name] = {};
                        }
                        if (!(vari in config.depend[name])) {
                            if (!side) {
                                config.depend[name][vari] = 0;
                            }
                        }
                    }
                }
                let ret = formula.join('');
                return ret;
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
                            ifstmt.push('if(' + condArray[ci].replace(/([^<=>])=([^=]*)/g, '$1===$2') + ') { return(' + valueArray[ci] + ')}');
                        }
                        ifstmt.push(' return(null); })()');
                        f = ifstmt.join('');
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
                        rep = `($1.name===name?argv[argv.length-(""==="$4"?"$2".length:1)]:$1.prev((""==="$4")?"$2".length:0))`;
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
                        rep = '($1.$($3))';
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
        update(rule, argv, decl) {
            this.rule = rule;
            let base = this.getBaseFunctions();
            let mod = base.mod;
            let and = base.and;
            let or = base.or;
            let side = true;
            let updated = [];
            for (let ai = 0; ai < argv.length; ai++) {
                // ignore nested []
                if (argv[ai].indexOf('[') > -1) {
                    let valstr = '0';
                    updated.push(valstr);
                    continue;
                }
                let conved = this.convertZenToHan(argv[ai]);
                let str = this.convertPostProcess(conved, decl, true);
                if (str.indexOf('config.instances') > -1) {
                    let _decl = '_' + config.rentaku.tmp;
                    let _iter = new Iteraita(_decl, 0);
                    config.rentaku.tmp++;
                    config.rentaku.decls.push(_decl);
                    if (!(decl in config.rentaku.hash)) {
                        config.rentaku.hash[decl] = {};
                    }
                    config.rentaku.hash[decl][ai] = _decl;
                    config.rentaku.rules.push(argv[ai]);
                    config.rentaku.argvs.push([]);
                    config.depend[decl][_decl] = config.max;
                }

                updated.push(str);
            }
            if (!(decl in config.rentaku.init)) {
                config.rentaku.init[decl] = true;
                this.argv = updated;
            }
        }
        set rule(str) {
            let conved = this.convertZenToHan(str);
            this._rule = conved;
            let side = false;
            let post = this.convertPostProcess(conved, this._name, side);
            let base = this.getBaseFunctions();
            let mod = base.mod;
            let and = base.and;
            let or = base.or;
            eval('this._func = function (self,argv,idx,id,name) { return (' + post + '); }');
            return;
        }
        convertZenToHan(str) {
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
                    } else if (code === 'Ａ'.charCodeAt(0)) {
                        char = 'A';
                    } else if (code === 'Ｂ'.charCodeAt(0)) {
                        char = 'B';
                    } else if (code === 'Ｃ'.charCodeAt(0)) {
                        char = 'C';
                    } else if (code === 'Ｄ'.charCodeAt(0)) {
                        char = 'D';
                    } else if (code === 'Ｅ'.charCodeAt(0)) {
                        char = 'E';
                    } else if (code === 'Ｆ'.charCodeAt(0)) {
                        char = 'F';
                    } else if (code === 'Ｇ'.charCodeAt(0)) {
                        char = 'G';
                    } else if (code === 'Ｈ'.charCodeAt(0)) {
                        char = 'H';
                    } else if (code === 'Ｉ'.charCodeAt(0)) {
                        char = 'I';
                    } else if (code === 'Ｊ'.charCodeAt(0)) {
                        char = 'J';
                    } else if (code === 'Ｋ'.charCodeAt(0)) {
                        char = 'K';
                    } else if (code === 'Ｌ'.charCodeAt(0)) {
                        char = 'L';
                    } else if (code === 'Ｍ'.charCodeAt(0)) {
                        char = 'M';
                    } else if (code === 'Ｎ'.charCodeAt(0)) {
                        char = 'N';
                    } else if (code === 'Ｏ'.charCodeAt(0)) {
                        char = 'O';
                    } else if (code === 'Ｐ'.charCodeAt(0)) {
                        char = 'P';
                    } else if (code === 'Ｑ'.charCodeAt(0)) {
                        char = 'Q';
                    } else if (code === 'Ｒ'.charCodeAt(0)) {
                        char = 'R';
                    } else if (code === 'Ｓ'.charCodeAt(0)) {
                        char = 'S';
                    } else if (code === 'Ｔ'.charCodeAt(0)) {
                        char = 'T';
                    } else if (code === 'Ｕ'.charCodeAt(0)) {
                        char = 'U';
                    } else if (code === 'Ｖ'.charCodeAt(0)) {
                        char = 'V';
                    } else if (code === 'Ｗ'.charCodeAt(0)) {
                        char = 'W';
                    } else if (code === 'Ｘ'.charCodeAt(0)) {
                        char = 'X';
                    } else if (code === 'Ｙ'.charCodeAt(0)) {
                        char = 'Y';
                    } else if (code === 'Ｚ'.charCodeAt(0)) {
                        char = 'Z';
                    } else if (code === 'ａ'.charCodeAt(0)) {
                        char = 'a';
                    } else if (code === 'ｂ'.charCodeAt(0)) {
                        char = 'b';
                    } else if (code === 'ｃ'.charCodeAt(0)) {
                        char = 'c';
                    } else if (code === 'ｄ'.charCodeAt(0)) {
                        char = 'd';
                    } else if (code === 'ｅ'.charCodeAt(0)) {
                        char = 'e';
                    } else if (code === 'ｆ'.charCodeAt(0)) {
                        char = 'f';
                    } else if (code === 'ｇ'.charCodeAt(0)) {
                        char = 'g';
                    } else if (code === 'ｈ'.charCodeAt(0)) {
                        char = 'h';
                    } else if (code === 'ｉ'.charCodeAt(0)) {
                        char = 'i';
                    } else if (code === 'ｊ'.charCodeAt(0)) {
                        char = 'j';
                    } else if (code === 'ｋ'.charCodeAt(0)) {
                        char = 'k';
                    } else if (code === 'ｌ'.charCodeAt(0)) {
                        char = 'l';
                    } else if (code === 'ｍ'.charCodeAt(0)) {
                        char = 'm';
                    } else if (code === 'ｎ'.charCodeAt(0)) {
                        char = 'n';
                    } else if (code === 'ｏ'.charCodeAt(0)) {
                        char = 'o';
                    } else if (code === 'ｐ'.charCodeAt(0)) {
                        char = 'p';
                    } else if (code === 'ｑ'.charCodeAt(0)) {
                        char = 'q';
                    } else if (code === 'ｒ'.charCodeAt(0)) {
                        char = 'r';
                    } else if (code === 'ｓ'.charCodeAt(0)) {
                        char = 's';
                    } else if (code === 'ｔ'.charCodeAt(0)) {
                        char = 't';
                    } else if (code === 'ｕ'.charCodeAt(0)) {
                        char = 'u';
                    } else if (code === 'ｖ'.charCodeAt(0)) {
                        char = 'v';
                    } else if (code === 'ｗ'.charCodeAt(0)) {
                        char = 'w';
                    } else if (code === 'ｘ'.charCodeAt(0)) {
                        char = 'x';
                    } else if (code === 'ｙ'.charCodeAt(0)) {
                        char = 'y';
                    } else if (code === 'ｚ'.charCodeAt(0)) {
                        char = 'z';
                    } else if (code === '＋'.charCodeAt(0)) {
                        char = '+';
                    } else if (code === '＊'.charCodeAt(0)) {
                        char = '*';
                    } else if (code === '／'.charCodeAt(0)) {
                        char = '/';
                    } else if (code === '＜'.charCodeAt(0)) {
                        char = '<';
                    } else if (code === '＝'.charCodeAt(0)) {
                        char = '=';
                    } else if (code === '＞'.charCodeAt(0)) {
                        char = '>';
                    } else if (code === '！'.charCodeAt(0)) {
                        char = '!';
                    } else if (code === '＃'.charCodeAt(0)) {
                        char = '#';
                    } else if (code === '’'.charCodeAt(0)) {
                        char = '\'';
                    } else if (code === '"'.charCodeAt(0)) {
                        char = '"';
                    } else if (code === '÷'.charCodeAt(0)) {
                        char = '%';
                    } else if (code === '％'.charCodeAt(0)) {
                        char = '%';
                    } else if (code === '＆'.charCodeAt(0)) {
                        char = '&';
                    } else if (code === ';'.charCodeAt(0)) {
                        char = ';';
                    } else if (code === '：'.charCodeAt(0)) {
                        char = ':';
                    } else if (code === '，'.charCodeAt(0)) {
                        char = ',';
                    } else if (code === '（'.charCodeAt(0)) {
                        char = '(';
                    } else if (code === '）'.charCodeAt(0)) {
                        char = ')';
                    } else if (code === '｜'.charCodeAt(0)) {
                        char = '|';
                    } else if (code === '.'.charCodeAt(0)) {
                        char = '.';
                    } else if (code === '＼'.charCodeAt(0)) {
                        char = '\\';
                    } else if (code === '＾'.charCodeAt(0)) {
                        char = '^';
                    } else if (code === '？'.charCodeAt(0)) {
                        char = '?';
                    } else if (code === '｀'.charCodeAt(0)) {
                        char = '`';
                    } else if (code === '｛'.charCodeAt(0)) {
                        char = '{';
                    } else if (code === '｝'.charCodeAt(0)) {
                        char = '}';
                    } else if (code === '＠'.charCodeAt(0)) {
                        char = '@';
                    } else if (code === '＄'.charCodeAt(0)) {
                        char = '$';
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
                        var char = str.substr(si, 1);
                        if (code === 'ー'.charCodeAt(0)) {
                            if (lastcode < 128) {
                                strArray.push('-');
                            } else {
                                strArray.push(char);
                            }
                        } else {
                            strArray.push(char);
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
            config.instances = {};
            config.depend = {};
            let stmtArray = statements.split('@');
            var decl;
            for (let si = 0; si < stmtArray.length; si++) {
                let stmt = stmtArray[si].trim();
                let lines = stmt.split('\n');
                if (si !== stmtArray.length - 1) {
                    decl = lines.pop().trim();
                    if (si === 0) {
                        if (lines.length !== 0) {
                            throw ('invalid name:' + decl);
                        }
                        config.rentaku.decls.push(decl);
                        continue;
                    } else if (si !== stmtArray.length - 1) {
                        if (!checkDecl(decl)) {
                            throw ('unknown name:' + decl);
                        }
                        config.rentaku.decls.push(decl);
                    }
                }
                let rest = lines.join();
                let sideopt = { side: false };
                let formulaArray = splitToFormulas(rest, sideopt);
                let rule = formulaArray.shift();
                config.rentaku.rules.push(rule);
                let argv = [];

                for (let fi = 0; fi < formulaArray.length; fi++) {
                    argv.push(formulaArray[fi]);
                }
                config.rentaku.argvs.push(argv);
            }
            for (let di = 0; di < config.rentaku.decls.length; di++) {
                let argc = 0;
                for (let ai = 0; ai < config.rentaku.argvs[di].length; ai++) {
                    if (config.rentaku.argvs[di][ai] !== '') {
                        argc++;
                    }
                }
                new Iteraita(config.rentaku.decls[di], argc);
            }
            for (let di = 0; di < config.rentaku.decls.length; di++) {
                let decl = config.rentaku.decls[di];
                let iter = config.iteraita[decl];
                iter.update(config.rentaku.rules[di], config.rentaku.argvs[di], decl, true);
            }
            this.starts = {};
            this.checked = {};
            this.setStart(config.rentaku.decls, this.starts, this.checked);
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
                                || code === '_'.charCodeAt(0)
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
                config.depend = {};
                config.max = _max;
                for (let di = 0; di < config.rentaku.decls.length; di++) {
                    let decl = config.rentaku.decls[di];
                    let iter = config.iteraita[decl];
                    iter.update(config.rentaku.rules[di], config.rentaku.argvs[di], decl, false);
                }
                this.setStart(config.rentaku.decls, this.starts, this.checked);
            }
            let max = 0;
            for (let sk in this.starts) {
                max = Math.max(max, this.starts[sk]);
            }
            // main loop
            max += config.max;
            for (let i = 0; i < max + config.max; i++) {
                for (let di = 0; di < config.rentaku.decls.length; di++) {
                    let decl = config.rentaku.decls[di];
                    let iter = config.iteraita[decl];
                    let argv = iter.argv;
                    if (this.starts[decl] <= i && i <= this.starts[decl] + config.max - 1) {
                        if (this.starts[decl] === i) {
                            let sideArray = [];
                            let minSides = config.max + 1;
                            for (let ai = 0; ai < argv.length; ai++) {
                                if (decl in config.rentaku.hash && ai in config.rentaku.hash[decl]) {
                                    let _decl = config.rentaku.hash[decl][ai];
                                    // TODO: [0] run
                                    //console.log(config.instances);
                                    //console.log(_decl + ' @ ' + decl);
                                    let tmp = config.instances[_decl][0].values;
                                    minSides = Math.min(minSides, tmp.length);
                                    sideArray.push(tmp);
                                } else {
                                    sideArray.push([eval(argv[ai])]);
                                }
                            }
                            if (minSides === config.max + 1) {
                                minSides = 1;
                            }
                            for (let mi = 0; mi < minSides; mi++) {
                                let tmpargv = [];
                                for (let ai = 0; ai < argv.length; ai++) {
                                    if (sideArray[ai].length === 1) {
                                        tmpargv.push((sideArray[ai][0]));
                                    } else {
                                        tmpargv.push((sideArray[ai][mi]));
                                    }
                                }
                                let inst = iter.new(tmpargv);
                            }
                        }
                        for (let ii = 0; ii < config.instances[decl].length; ii++) {
                            let inst = config.instances[decl][ii];
                            inst.next();
                        }
                    }
                }
            }
        }
        setStart(decls, starts, checked) {
            // clear
            for (let di = 0; di < decls.length; di++) {
                let decl = decls[di];
                if (decl in starts) {
                    delete starts[decl];
                }
                if (decl in checked) {
                    delete checked[decl];
                }
            }
            for (let di = 0; di < decls.length; di++) {
                let decl = decls[di];
                if (!(decl in config.depend)) {
                    starts[decl] = 0;
                }
            }
            let tmp={};
            for (let di = 0; di < decls.length; di++) {
                let outs = [];
                let decl = decls[di];
                setStartRepeat(0, decls.length, [decl], starts, [0], outs);
                let maxout = 0;
                for (let oi = 0; oi < outs.length; oi++) {
                    maxout = Math.max(maxout, outs[oi]);
                }
                tmp[decl]=maxout;
            }
            for (let decl in tmp){
                starts[decl]=tmp[decl];
            }
            return;

            function setStartRepeat(depth, maxdepth, decls, starts, ins, outs) {
                if (decls.length === 0) {
                    return;
                }
                if (depth > maxdepth) {
                    throw 'loop detected:'+depth;
                }
                for (let di = 0; di < decls.length; di++) {
                    let nextins = [];
                    let decl = decls[di];
                    let array = [];
                    for (let dk in config.depend[decl]) {
                        if (dk in starts) {
                            outs.push(ins[di] + config.depend[decl][dk]);
                        } else {
                            array.push(dk);
                            nextins.push(ins[di] + config.depend[decl][dk]);
                        }
                    }
                    setStartRepeat(depth + 1,maxdepth, array, starts, nextins, outs);
                }
            }

        }
        get decls() {
            return config.rentaku.decls;
        }
    }
    config.data0 = `
    黄金比 @ 1 + 1/黄金比' [1]
    フィボナッチ @ フィボナッチ' + フィボナッチ'' [0][1]
    あ @ あ' + 1 [0]
    い @ last(あ) +1
    う @ あ + 2
    `;
    config.data = `
		
自然数	 @ 自然数'+1	[0]
パイの素_A @ 6*パイの素_A' +  (2*自然数-1)*(2*自然数-1)*パイの素_A'' [1] [3]
パイの素_B @ 6*パイの素_B' +  (2*自然数-1)*(2*自然数-1)*パイの素_B'' [0] [1]
パイ @ パイの素_A/パイの素_B	
辺数 @ 11	
外角 @ 2* last(パイ)/辺数
コサインの素 @ - コサインの素' * 外角*外角 / (2*自然数 * (2*自然数-1)) [1]
コサイン @ コサイン' + コサインの素 [1]
サインの素 @ - サインの素' * 外角*外角 / (2*自然数 * (2*自然数+1)) [last(外角)]
サイン @ サイン' + サインの素 [last(外角)]
コサインN倍角 @ 2*last(コサイン)*コサインN倍角' - コサインN倍角''  [last(コサイン)] [1]
サインN倍角 @ 2*last(コサイン)*サインN倍角' - サインN倍角'' [-last(サイン)] [0]
XX @ XX' + 1 [サインN倍角]
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
        textarea.value = config.data;

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
            ren.run();
            let decls = ren.decls;
            table.innerHTML = '<thead><tr></tr></thead><tbody></tbody>';
            let theadTr = table.querySelector('thead tr');
            let tbody = table.querySelector('tbody');
            let ed = ' contenteditable="true" ';
            let theadThStyle = 'style="background-color:#444499;color:#ffffff;"';
            for (let di = 0; di < decls.length; di++) {
                let decl = decls[di];
                let instances = config.instances[decl];

                for (let ii = 0; ii < instances.length; ii++) {
                    theadTr.insertAdjacentHTML('beforeend', `<th ${theadThStyle} ${ed}>${decl}</th>`);
                }
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
                    let instances = config.instances[decl];
                    for (let ii = 0; ii < instances.length; ii++) {
                        tbodyTr.insertAdjacentHTML('beforeend', `<td ${ruleTdStyle} ${ed}>${cell}</td>`);
                    }
                }
            }
            let graphThStyle = 'style="background-color:#aa99ff;height:30pt;"';
            {
                tbody.insertAdjacentHTML('beforeend', `<tr></tr>`);
                let tbodyTr = tbody.querySelector('tr:last-child');
                for (let di = 0; di < decls.length; di++) {
                    let decl = decls[di];
                    let instances = config.instances[decl];
                    for (let ii = 0; ii < instances.length; ii++) {
                        tbodyTr.insertAdjacentHTML('beforeend', `<td ${graphThStyle}></td>`);
                    }
                }
            }
            let argvTdStyle = 'style="background-color:#ccffcc;height:16pt;text-align: right;"';
            for (let ci = 0; ci < config.constval; ci++) {
                tbody.insertAdjacentHTML('beforeend', `<tr></tr>`);
                let tbodyTr = tbody.querySelector('tr:last-child');
                for (let di = 0; di < decls.length; di++) {
                    let decl = decls[di];
                    let instances = config.instances[decl];
                    for (let ii = 0; ii < instances.length; ii++) {
                        let instance = instances[ii];
                        let cell = '';
                        if (instance.argv && ci < instance.argv.length && typeof (instance.argv[ci]) !== 'undefined') {
                            cell = instance.argv[ci];
                        }
                        tbodyTr.insertAdjacentHTML('beforeend', `<td ${argvTdStyle} ${ed}>${cell}</td>`);
                    }
                }
            }
            for (let mi = 0; mi < config.max; mi++) {
                tbody.insertAdjacentHTML('beforeend', `<tr></tr>`);
                let tbodyTr = tbody.querySelector('tr:last-child');
                for (let di = 0; di < decls.length; di++) {
                    let decl = decls[di];
                    let instances = config.instances[decl];
                    for (let ii = 0; ii < instances.length; ii++) {
                        let instance = instances[ii];
                        let cell = instance.values[mi];
                        tbodyTr.insertAdjacentHTML('beforeend', `<td style="text-align: right;">${cell}</td>`);
                    }
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
あー2 @ あー2' + 1 [0]
い @ last(あー2) +1
う @ last(い) + 2
え @ last(う) + 2
`;
        let rentaku4 = `
  辺数 @ 		11
  自然数 @		自然数' + 1 [0]
  パイの素A @  	6*パイの素A' +  (2*自然数-1)*(2*自然数-1)* パイの素A'' [1][3]
  パイの素B @  	6*パイの素B' +  (2*自然数-1)*(2*自然数-1)* パイの素B'' [0][1]
  パイ @ 		パイの素A /パイの素B
  入力_角度 @ 	90/辺数
  角度変換 @ 	入力_角度*last(パイ)/180
  負タンの素A @	(2*自然数-1)/角度変換 * 負タンの素A' - 負タンの素A'' [1][0]
  負タンの素B @	(2*自然数-1)/角度変換 * 負タンの素B' - 負タンの素B''	[0][1]
  負タン @ 	負タンの素A/負タンの素B
  コサイン自乗 @ 1/(1+last(負タン)*last(負タン))
  コサイン自乗ルート2の素 @ 2* コサイン自乗ルート2の素' + (コサイン自乗-1)*コサイン自乗ルート2の素'' [0][1]
  コサイン @ コサイン自乗ルート2の素 *(1-2*(mod(角度変換/last(パイ),2)-mod(mod(角度変換/last(パイ),2),1)))
  コサインN倍角 @	2*last(コサイン)*コサインN倍角' - コサインN倍角''　[last(コサイン)]　[1]
`;

        let rentakuN = `
  辺数 @ 		11
  自然数 @	   ' + 1 [0]
  パイの素A @  6* ' +  (2*自然数-1)*(2*自然数-1)* '' [1][3]
  パイの素B @  6* ' +  (2*自然数-1)*(2*自然数-1)* '' [0][1]
  パイ @ 		パイの素A /パイの素B
  入力角度 @   90/辺数
  角度変換 @   入力角度* パイ! /180
  負タンの素A @	(2*自然数-1)/角度変換 * ' - '' [1][0]
  負タンの素B @	(2*自然数-1)/角度変換 * ' - ''	[0][1]
  負タン @ 	負タンの素A/負タンの素B
  コサイン自乗 @ 1/(1+ 負タン! * 負タン! )
  コサイン自乗ルート2の素 @ 2* ' + (コサイン自乗-1)* '' [0][1]
  コサイン @ コサイン自乗ルート2の素 *(1-2*((角度変換/パイ! mod 2)-((角度変換/パイ! mod 2) mod 1)))
`;
        let rentakuM = `
  辺数 @ 	    11
  自然数 @	    ' + 1 [0]
  パイの素 @  6' +  (2自然数-1) (2自然数-1) '' [0][1]
  パイ @ 		_パイの素[1][3] / _パイの素[][]
  入力角度 @ 	90/辺数
  角度変換 @ 	入力角度 パイ! /180
  負タンの素 @   (2自然数-1)/角度変換 (') - ''	[0][1]
  負タン @ 	_負タンの素[1][0]/ _負タンの素[][]
  コサイン自乗 @ 1/(1+ 負タン! 負タン! )
  コサイン自乗ルート2の素 @ 2 ' + (コサイン自乗-1) '' [0][1]
  コサイン @ コサイン自乗ルート2の素 (1-2((角度変換/パイ! mod 2)-((角度変換/パイ! mod 2) mod 1)))
`;
        let rentakuL = `
 コサイン @ $コサイン {
  辺数 @ 	 $0  [$0]  /* 辺数 @ 	 $0 でも可 */
  自然数 @	    ' + 1 [0]
  パイの素 @  6' +  (2自然数-1) (2自然数-1) '' [0][1]
  パイ @ 		_パイの素[1][3] / _パイの素[][]
  入力角度 @ 	90/辺数
  角度変換 @ 	入力角度 パイ! /180
  負タンの素 @   (2自然数-1)/角度変換 (') - ''	[0][1]
  負タン @ 	_負タンの素[1][0]/ _負タンの素[][]
  コサイン自乗 @ 1/(1+ 負タン! 負タン! )
  コサイン自乗ルート2の素 @ 2 ' + (コサイン自乗-1) '' [0][1]
  コサイン @ コサイン自乗ルート2の素 (1-2((角度変換/パイ! mod 2)-((角度変換/パイ! mod 2) mod 1)))
} [11]
`;
        let andor2 = `
あ @ あ' + 1 [0]
い @ い' + 1 [last(あ)]
う @ あ | あ < 30
`;
        let andor3 = `
あ @ あ' + 1 [0]
い @ い' + 2 [あ]
う @ last(あ)
`;

        let rentaku3 = `
  辺数 @ 		11
  自然数 @		自然数' + 1 [0]
  パイの素A @  	6*パイの素A' +  (2*自然数-1)*(2*自然数-1)* パイの素A'' [1][3]
  パイの素B @  	6*パイの素B' +  (2*自然数-1)*(2*自然数-1)* パイの素B'' [0][1]
  パイ @ 		パイの素A /パイの素B
  入力_角度 @ 	90/辺数
  角度変換 @ 	入力_角度*last(パイ)/180
  負タンの素A @	(2*自然数-1)/角度変換 * 負タンの素A' - 負タンの素A'' [1][0]
  負タンの素B @	(2*自然数-1)/角度変換 * 負タンの素B' - 負タンの素B''	[0][1]
  負タン @ 	負タンの素A/負タンの素B
  コサイン自乗 @ 1/(1+last(負タン)*last(負タン))
  コサイン自乗ルート2の素 @ 2* コサイン自乗ルート2の素' + (コサイン自乗-1)*コサイン自乗ルート2の素'' [0][1]
  コサイン @ コサイン自乗ルート2の素 *(1-2*(mod(角度変換/last(パイ),2)-mod(mod(角度変換/last(パイ),2),1)))
`;
        let rentaku5 = `
  辺数 @ 		11
  自然数 @		自然数' + 1 [0]
  パイの素A @  	6*パイの素A' +  (2*自然数-1)*(2*自然数-1)* パイの素A'' [1][3]
  パイの素B @  	6*パイの素B' +  (2*自然数-1)*(2*自然数-1)* パイの素B'' [0][1]
  パイ @ 		パイの素A /パイの素B
  入力_角度 @ 	90/辺数
  角度変換 @ 	入力_角度*last(パイ)/180
  負タンの素A @	(2*自然数-1)/角度変換 * 負タンの素A' - 負タンの素A'' [1][0]
  負タンの素B @	(2*自然数-1)/角度変換 * 負タンの素B' - 負タンの素B''	[0][1]
  負タン @ 	負タンの素A/負タンの素B
  コサイン自乗 @ 1/(1+last(負タン)*last(負タン))
  コサイン自乗ルート2の素 @ 2* コサイン自乗ルート2の素' + (コサイン自乗-1)*コサイン自乗ルート2の素'' [0][1]
  コサイン @ コサイン自乗ルート2の素 *(1-2*(mod(角度変換/last(パイ),2)-mod(mod(角度変換/last(パイ),2),1)))
  コサインN倍角 @	2*last(コサイン)*コサインN倍角' - コサインN倍角''　[last(コサイン)]　[1]
  コサイン4N倍角抜粋 @ コサインN倍角 | mod(自然数,4)=0
  サイン4N倍角抜粋 @ -コサインN倍角 | and((mod(自然数+2+辺数,4)=0),(自然数<=辺数))
`;
        /*
          コサイン4N倍角	サイン4N倍角 @ 	pack(コサイン4N倍角抜粋) | 自然数 <= 辺数	
          サイン4N倍角 @	pack(サイン4N倍角抜粋) | 自然数 <= 辺数
          */

        let rentakuXX = `							
自然数	 @ 自然数'+1 [0]
パイの素_A @ 6*パイの素_A' +  (2*自然数-1)*(2*自然数-1)*パイの素_A'' [1] [3]
パイの素_B @ 6*パイの素_B' +  (2*自然数-1)*(2*自然数-1)*パイの素_B'' [0] [1]
パイ @ パイの素_A/パイの素_B	
辺数 @ 11	
外角 @ 2* last(パイ)/辺数
コサインの素 @ - コサインの素' * 外角*外角 / (2*自然数 * (2*自然数-1)) [1]
コサイン @ コサイン' + コサインの素 [1]
サインの素 @ - サインの素' * 外角*外角 / (2*自然数 * (2*自然数+1)) [last(外角)]
サイン @ サイン' + サインの素 [last(外角)]
コサインN倍角 @ 2*last(コサイン)*コサインN倍角' - コサインN倍角''  [last(コサイン)] [1]
サインN倍角 @ 2*last(コサイン)*サインN倍角' - サインN倍角'' [-last(サイン)] [0]
辺長	@ 20
回転数 @ 1
点X @ 点X' -辺長 *コサインN倍角 | 自然数 <= 辺数*回転数 [0]
点Y @ 点Y' + 辺長 * サインN倍角 | 自然数 <= 辺数*回転数 [0]
線 @ $3+1-mod($3,1) | { or(and(($0-$2)*($0-$2)<0.0001,自然数=$2+1-mod($2+1,1)),and(($1-$3)*($1-$3)<0.0001,(自然数-$2-1+mod($2+1,1))*(自然数-$0+mod($0,1))<=0)) } $3+($1-$3)/($0-$2)*(自然数-$2-1+mod($2+1,1))+1-mod($3+($1-$3)/($0-$2)*(自然数-$2-1+mod($2+1,1)),1) | { and(($0-$2)*($0-$2)>=0.0001,(自然数-$2-1+mod($2+1,1))*(自然数-$0+mod($0,1))<=0) } [点X'][点Y'][点X][点Y]
`
            /*
                    	
            辺長	@ 20
            回転数 @ 1
            点X @ 点X' -辺長 *コサインN倍角 | 自然数 <= 辺数*回転数
            点Y @ 点Y' + 辺長 * サインN倍角 | 自然数 <= 辺数*回転数
            線 @ $3+1-mod($3,1) | { or(and(($0-$2)*($0-$2)<0.0001,自然数=$2+1-mod($2+1,1)),and(($1-$3)*($1-$3)<0.0001,(自然数-$2-1+mod($2+1,1))*(自然数-$0+mod($0,1))<=0)) }
            $3+($1-$3)/($0-$2)*(自然数-$2-1+mod($2+1,1))+1-mod($3+($1-$3)/($0-$2)*(自然数-$2-1+mod($2+1,1)),1) | { and(($0-$2)*($0-$2)>=0.0001,(自然数-$2-1+mod($2+1,1))*(自然数-$0+mod($0,1))<=0) } [点X'][点Y'][点X][点Y]
            */
            ;
        let test = `
あ @ 1 [1]
お @ $0+あ$0 [2]
`;
        /*
        う @ あ | あ < 4 [あ'] 
        う @ あ [あ+1]
        う @ あ [あ']
        */
        //try 
        {
            let ren = new Rentaku(test);
            ren.run();
            // bug
            // ren.run(3);
            for (let di = 0; di < ren.decls.length; di++) {
                let decl = ren.decls[di];
                let inst = config.instances[decl];
                for (let ii = 0; ii < inst.length; ii++) {
                    console.log(decl + ': ' + inst[ii].values);
                }
            }
        }
        //catch
        let _ = function
        (e) {
            console.log(e);
        }
        // TODO: benchmark
        // [last]
        // side support
        // pack, subseq
    }
})(typeof (document) !== 'undefined' ? document : null, console);
