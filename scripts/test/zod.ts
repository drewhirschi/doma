// import { z } from 'zod';

// // Define Zod schemas for testing
// const NestedObject = z.object({
//   innerSummary: z.string().describe("Inner summary."),
//   innerFlag: z.boolean().describe("Inner flag."),
// });
// const TermShape = z.object({
//   summary: z.string().describe("Summary of the term."),
//   silent: z.boolean().describe("Indicates if the term is silent."),
//   expired: z.boolean().describe("Indicates if the term has expired."),
//   expireDate: z.date().nullable().describe("This should be the date the agreement was signed."),
//   nested: NestedObject.describe("Nested object description."),
// });



// console.log(zodObjectToXML("TermShape", TermShape));
