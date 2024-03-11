import { z } from 'zod';

// Define Zod schemas for testing
const NestedObject = z.object({
  innerSummary: z.string().describe("Inner summary."),
  innerFlag: z.boolean().describe("Inner flag."),
});
const TermShape = z.object({
  summary: z.string().describe("Summary of the term."),
  silent: z.boolean().describe("Indicates if the term is silent."),
  expired: z.boolean().describe("Indicates if the term has expired."),
  expireDate: z.date().nullable().describe("This should be the date the agreement was signed."),
  nested: NestedObject.describe("Nested object description."),
});

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
    } else {
        xmlStr = `${indent}<field name="${key}" type="${fieldType}" description="${description}"/>\n`;
    }

    return xmlStr;
}

function zodObjectToXML(name: string, schema: z.ZodTypeAny): string {
    //@ts-ignore
    const fields = schema.shape;
    let xmlStr = `<schema name="${name}">\n`;

    Object.keys(fields).forEach((key) => {
        xmlStr += zodFieldToXML(key, fields[key]);
    });

    xmlStr += '</schema>';
    return xmlStr;
}

console.log(zodObjectToXML("TermShape", TermShape));
