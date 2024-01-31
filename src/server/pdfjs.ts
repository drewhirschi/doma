import * as pdfjs from 'pdfjs-dist';

require('pdfjs-dist/build/pdf.worker')

// this is from react-pdf
// const pdfjs = (
//     'default' in pdfjsModule ? pdfjsModule['default'] : pdfjsModule
//   ) as typeof pdfjsModule;

export default pdfjs