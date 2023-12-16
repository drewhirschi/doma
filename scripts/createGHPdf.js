// import puppeteer from 'puppeteer';
const puppeteer = require('puppeteer');

async function convertLinkToPDF(url) {
    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    const pdfBuffer = await page.pdf({ path: "docs/github.pdf", format: 'A4' });

    await browser.close();
    return pdfBuffer;
}

convertLinkToPDF("https://docs.github.com/en/site-policy/github-terms/github-terms-of-service")
    .then(() => console.log('PDF created successfully!'));
