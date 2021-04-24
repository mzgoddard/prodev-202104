"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrint = void 0;
const defaultOptions = {
    wrapColumn: 80,
    indentWidth: 4,
};
function prettyPrint(token) {
    switch (token.type) {
        case 'comment':
            break;
        case 'variable':
            break;
        case 'atom':
            break;
        case 'list':
            break;
        case 'application':
            break;
        case 'file':
            break;
    }
}
exports.prettyPrint = prettyPrint;
//# sourceMappingURL=prettyprint.js.map