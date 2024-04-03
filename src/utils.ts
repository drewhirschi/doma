import { z } from 'zod';

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const pixel = {

    pageview: () => {
        window.fbq("track", "PageView");
    },

    // https://developers.facebook.com/docs/facebook-pixel/advanced/
    event: (name: string, options = {}) => {
        window.fbq("track", name, options);
    },
    FB_PIXEL_ID: "905081251117190",
}

export function objectToXml(obj: any, rootElement: string = 'root'): string {
    let xml = `<${rootElement}>`;

    if (obj) {

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                xml += objectToXml(value, key);
            } else {
                xml += `<${key}>${value}</${key}>`;
            }
        }
    }

    xml += `</${rootElement}>`;
    return xml;
}

export function isEmptyObject(obj: object): boolean {
    return Object.keys(obj).length === 0;
}


export interface IRespError {
    message?: string,
    [key: string]: any;

}
export interface ISuccessResp<TOK> {
    ok: TOK;
    error?: never;
}

export interface IErrorResp<TError = IRespError> {
    ok?: never;
    error: TError;
}

export type IResp<TOK = any, TError = IRespError> = ISuccessResp<TOK> | IErrorResp<TError>;

export function rok<T>(ok: T): IResp<T> {
    return { ok }
}

export function rerm<TError = any>(message: string, anyErrorData: TError, errorCode?: string): IResp<any, TError> {
    return { error: { message, ...anyErrorData } }
}





export function rangeToStringWithNewLines(range: Range): string {
    const fragment = range.cloneContents();
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let text = '';
    let currentNode: Node | null = walker.currentNode;

    while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
            text += currentNode.textContent;
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const element = currentNode as Element;
            // Check if the element is a block-level element
            if (['DIV', 'P', 'BR'].includes(element.tagName)) {
                text += '\n'; // Add a newline for block-level elements
            }
        }
        currentNode = walker.nextNode();
    }

    return text;
}


export function formatKey(text: string): string {
    const words = text.split('_');
    const formattedWords = words.map((word, index) => {
        // if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        // } else {
        //     return word.toLowerCase();
        // }
    });
    return formattedWords.join(' ');
}
