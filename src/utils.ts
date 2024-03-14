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


function zodFieldToXML(key: string, field: any, indentLevel: number = 2): string {
    let xmlStr = '';
    let indent = ' '.repeat(indentLevel);
    let fieldType = field._def.typeName;
    let description = field.description;

    if (fieldType === 'ZodObject') {
        xmlStr += `${indent}<object name="${key}" ${description ? `description=${description}` : ""}>\n`;
        Object.keys(field.shape).forEach((innerKey) => {
            xmlStr += zodFieldToXML(innerKey, field.shape[innerKey], indentLevel + 2);
        });
        xmlStr += `${indent}</object>\n`;

    } else if (fieldType == 'ZodNullable') {
        const innerType = field._def.innerType._def.typeName;
        xmlStr = `${indent}<field name="${key}" type="${innerType}" nullable ${description ? `description="${description}"` : ""}/>\n`;
    } else if (fieldType == 'ZodArray') {
        const innerShape = field._def.type;
        xmlStr = `${indent}<array name="${key}" ${description ? `description="${description}"` : ""}>\n`;

        xmlStr += zodFieldToXML('arrayItem', innerShape, indentLevel + 2);
        xmlStr += `${indent}</array>\n`;

    } else {
        xmlStr = `${indent}<field name="${key}" type="${fieldType}" ${description ? `description="${description}"` : ""}/>\n`;
    }

    return xmlStr;
}

export function zodObjectToXML(schema: z.ZodTypeAny): string {
    let xmlStr = `<schema>\n`;

    //@ts-ignore
    const fields = schema.shape;
    Object.keys(fields).forEach((key) => {
        xmlStr += zodFieldToXML(key, fields[key]);
    });

    xmlStr += '</schema>';
    return xmlStr;
}