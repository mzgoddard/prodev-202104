"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shenLanguage = void 0;
const parsimmon_1 = require("parsimmon");
exports.shenLanguage = parsimmon_1.createLanguage({
    lineComment() {
        return parsimmon_1.seq(parsimmon_1.string('\\\\'), parsimmon_1.noneOf('\n').many(), parsimmon_1.lf).map(comment => ({ type: 'comment', comment }));
    },
    multiComment() {
        return parsimmon_1.seq(parsimmon_1.string('\\*'), parsimmon_1.alt(parsimmon_1.noneOf('*'), parsimmon_1.string('*').notFollowedBy(parsimmon_1.string('\\'))).many(), parsimmon_1.string('*\\')).map(comment => ({ type: 'comment', comment }));
    },
    boolean() {
        return parsimmon_1.alt(parsimmon_1.string('true'), parsimmon_1.string('false'));
    },
    symbol() {
        return parsimmon_1.regexp(/[a-zA-Z=\-*\/+_?$!@~.><&%'#`;:{}][a-zA-Z0-9=\-*\/+_?$!@~.><&%'#`;:{}]*/);
    },
    variable() {
        return parsimmon_1.regexp(/[A-Z][a-zA-Z0-9=\-*\/+_?$!@~.><&%'#`;:{}]*/).map(variable => ({
            type: 'variable',
            comments: [],
            variable,
        }));
    },
    number() {
        return parsimmon_1.regexp(/[+\-]*(?:\.\d+|\d+(?:\.\d+)?)(?:e\-?\d+)?/);
    },
    string() {
        return parsimmon_1.seq(parsimmon_1.string('"'), parsimmon_1.noneOf('"').many(), parsimmon_1.string('"'));
    },
    atom(r) {
        return parsimmon_1.alt(r.boolean, r.number, r.variable, r.symbol, r.string).map(atom => atom.type ? atom : ({
            type: 'atom',
            comments: [],
            atom,
        }));
    },
    optComments(r) {
        return parsimmon_1.alt(parsimmon_1.whitespace.map(() => null), r.lineComment, r.multiComment).many().map(result => result.filter(Boolean));
    },
    listTail(r) {
        return parsimmon_1.seq(r.optComments, parsimmon_1.string('|'), r.optComments, parsimmon_1.alt(r.list, r.variable)).atMost(1).map(([tail]) => tail ? ({
            type: 'tail',
            comments: [...tail[0], ...tail[2]],
            expr: tail[3],
        }) : null);
    },
    list(r) {
        return parsimmon_1.seq(parsimmon_1.string('['), r.expr.many(), r.listTail, r.optComments, parsimmon_1.string(']')).map(([lb, expr, tail, comments, rb]) => ({
            type: 'list',
            comments,
            expr,
            tail,
        }));
    },
    application(r) {
        return parsimmon_1.seq(parsimmon_1.string('('), r.expr.many(), r.optComments, parsimmon_1.string(')')).map(([lp, exprs, comments, rp]) => ({
            type: 'application',
            comments,
            exprs,
        }));
    },
    expr(r) {
        return parsimmon_1.seq(r.optComments, parsimmon_1.alt(r.atom, r.list, r.application)).map(([comments, expr]) => (Object.assign(Object.assign({}, expr), { comments: [...comments, ...expr.comments] })));
    },
    file(r) {
        return parsimmon_1.seq(r.expr.many(), r.optComments).map(([exprs, comments]) => ({
            type: 'file',
            comments,
            exprs,
        }));
    },
});
function main() {
    console.log(exports.shenLanguage.atom.tryParse('Abc'));
    console.log(exports.shenLanguage.atom.sepBy(exports.shenLanguage.optComments).tryParse('abc def ghi'));
    console.log(exports.shenLanguage.file.tryParse('\\\\ hello world\n(define \\* comment *\\ abc 1 -> 1)'));
    console.log(JSON.stringify(exports.shenLanguage.file.tryParse('(define abc [] -> 0 [D | E] -> (+ D (abc E)))').exprs));
}
if (process.mainModule === module) {
    main();
}
//# sourceMappingURL=parser.js.map