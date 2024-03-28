import { z } from "zod";

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


export function hasItemsChild(schema: z.ZodTypeAny): boolean {
    //@ts-ignore
    const fields = schema.shape;
    if (!fields["items"]) {
        return false;
    }
    if (fields["items"]._def.typeName === 'ZodArray') {
        return true;
    }

    return false;
}