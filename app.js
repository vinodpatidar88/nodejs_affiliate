const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

const scrapeAmazonProduct = async (url) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const productData = await page.evaluate(() => {
        const title = document.querySelector('#productTitle')?.innerText.trim();
        return { title };
    });

    await browser.close();

    return productData;
};

const scrapeMyntraProduct = async (url) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        console.log(`Navigating to URL: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const productData = await page.evaluate(() => {
            const title = document.querySelector('.pdp-title')?.innerText.trim();

            return { title };
        });

        console.log(`Scraped data: ${JSON.stringify(productData)}`);
        return productData;
    } catch (error) {
        console.error(`Error during Puppeteer operation: ${error.message}`);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

app.get('/scraper', async (req, res) => {
    const url = req.query.url;

    // console.log(url);
    if (!url) {
        return res.status(400).send('URL is required');
    }
    try {
        const data = await scrapeMyntraProduct(url);
        // console.log(data);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).send('Error scraping the product');
    }
});

app.get('/', (req, res) => {
    res.status(200).send("Affiliate response server.")
})

const port = 4040;

app.listen(port, () => {
    console.log(`Server Running At Por : ${port}...`);
});