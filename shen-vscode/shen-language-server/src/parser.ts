import {createLanguage, seq, alt, string, noneOf, regexp, lf, whitespace, optWhitespace, empty} from 'parsimmon';

export interface ShenComment {
    type: 'comment';
    comment: string;
}

export interface ShenVariable {
    type: 'variable';
    comments: ShenComment[];
    variable: string;
}

export interface ShenAtom {
    type: 'atom';
    comments: ShenComment[];
    atom: string;
}

export interface ShenTail {
    type: 'tail';
    comments: ShenComment[];
    expr: ShenList | ShenVariable;
}

export interface ShenList {
    type: 'list';
    comments: ShenComment[];
    exprs: ShenExpr[];
    tail: ShenTail | null;
}

export interface ShenApplication {
    type: 'application';
    comments: ShenComment[];
    exprs: ShenExpr[];
}

export interface ShenFile {
    type: 'file';
    comments: ShenComment[];
    exprs: ShenExpr[];
}

export type ShenExpr = ShenVariable | ShenAtom | ShenList | ShenApplication;

export type ShenToken = ShenComment | ShenExpr | ShenTail | ShenFile;

export const shenLanguage = createLanguage({
    lineComment() {
        return seq(string('\\\\'), noneOf('\n').many(), lf).map(comment => ({type: 'comment', comment}));
    },
    multiComment() {
        return seq(
            string('\\*'),
            alt(
                noneOf('*'),
                string('*').notFollowedBy(string('\\')),
            ).many(),
            string('*\\'),
        ).map(comment => ({type: 'comment', comment}));
    },
    boolean() {
        return alt(string('true'), string('false'));
    },
    symbol() {
        return regexp(/[a-zA-Z=\-*\/+_?$!@~.><&%'#`;:{}][a-zA-Z0-9=\-*\/+_?$!@~.><&%'#`;:{}]*/);
    },
    variable() {
        return regexp(/[A-Z][a-zA-Z0-9=\-*\/+_?$!@~.><&%'#`;:{}]*/).map(variable => ({
            type: 'variable',
            comments: [],
            variable,
        }));
    },
    number() {
        return regexp(/[+\-]*(?:\.\d+|\d+(?:\.\d+)?)(?:e\-?\d+)?/);
    },
    string() {
        return seq(
            string('"'),
            noneOf('"').many(),
            string('"'),
        );
    },
    atom(r) {
        return alt(r.boolean, r.number, r.variable, r.symbol, r.string).map(atom => atom.type ? atom : ({
            type: 'atom',
            comments: [],
            atom,
        }));
    },
    optComments(r) {
        return alt(whitespace.map(() => null), r.lineComment, r.multiComment).many().map(result => result.filter(Boolean));
    },
    listTail(r) {
        return seq(
            r.optComments,
            string('|'),
            r.optComments,
            alt(r.list, r.variable),
        ).atMost(1).map(([tail]) => tail ? ({
            type: 'tail',
            comments: [...tail[0], ...tail[2]],
            expr: tail[3],
        }) : null);
    },
    list(r) {
        return seq(
            string('['),
            r.expr.many(),
            r.listTail,
            r.optComments,
            string(']'),
        ).map(([lb, expr, tail, comments, rb]) => ({
            type: 'list',
            comments,
            expr,
            tail,
        }));
    },
    application(r) {
        return seq(
            string('('),
            r.expr.many(),
            r.optComments,
            string(')'),
        ).map(([lp, exprs, comments, rp]) => ({
            type: 'application',
            comments,
            exprs,
        }));
    },
    expr(r) {
        return seq(r.optComments, alt(r.atom, r.list, r.application)).map(([comments, expr]) => ({
            ...expr,
            comments: [...comments, ...expr.comments],
        }));
    },
    file(r) {
        return seq(r.expr.many(), r.optComments).map(([exprs, comments]) => ({
            type: 'file',
            comments,
            exprs,
        } as ShenFile));
    },
});

function main() {
    console.log(shenLanguage.atom.tryParse('Abc'));
    console.log(shenLanguage.atom.sepBy(shenLanguage.optComments).tryParse('abc def ghi'));
    console.log(shenLanguage.file.tryParse('\\\\ hello world\n(define \\* comment *\\ abc 1 -> 1)'));
    console.log(JSON.stringify(shenLanguage.file.tryParse('(define abc [] -> 0 [D | E] -> (+ D (abc E)))').exprs));
}

if (process.mainModule === module) {
    main();
}
