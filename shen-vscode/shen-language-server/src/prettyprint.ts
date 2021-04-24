import {ShenToken} from './parser';

export interface PrintOptions {
    wrapColumn: number;
    indentWidth: number;
}

const defaultOptions : PrintOptions = {
    wrapColumn: 80,
    indentWidth: 4,
};

export function prettyPrint(token: ShenToken) {
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
