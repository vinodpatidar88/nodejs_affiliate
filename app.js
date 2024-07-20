const express = require('express');
const puppeteer = require('puppeteer-extra');

// Add stealth plugin and use defaults 
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');

const app = express();

puppeteer.use(pluginStealth());

const scrapeAmazonProduct = async (url) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });
        console.log("before : page : ", browser);
        const page = await browser.newPage();
        console.log("after : page : ", page);

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        console.log(`Navigating to URL: ${url}`);

        await page.screenshot({ path: 'amazon_before_navigation.png' });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

        await page.screenshot({ path: 'amazon_after_navigation.png' });

        const productData = await page.evaluate(() => {
            const title = document.querySelector('#productTitle')?.innerText.trim();

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

const scape_myntra = async (url) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });
        console.log("before : page : ", browser);
        const page = await browser.newPage();
        console.log("after : page : ", page);

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        console.log(`Navigating to URL: ${url}`);

        await page.screenshot({ path: 'myntra_before_navigation.png' });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

        await page.screenshot({ path: 'amazon_after_navigation.png' });

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

app.get('/scraper_myntra', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true, executablePath: executablePath() });
        const page = await browser.newPage();

        // Limit requests 
        await page.setRequestInterception(true);
        page.on('request', async (request) => {
            if (request.resourceType() == 'image') {
                await request.abort();
            } else {
                await request.continue();
            }
        });

        await page.setExtraHTTPHeaders({
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'upgrade-insecure-requests': '1',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9,en;q=0.8'
        });

        await page.setViewport({ width: 1280, height: 720 });
        await page.goto('https://www.myntra.com/');
        await page.screenshot({ path: 'image.png', fullPage: true });

        await browser.close();

        res.status(200).send("Affiliate response server.");
    } catch (error) {
        console.error("Error occurred during Puppeteer operations:", error);
        res.status(500).send("An error occurred while processing your request.");
    }
});

app.get('/scraper_amazon', async (req, res) => {
    const url = req.query.url;
    console.log(`Received URL: ${url}`);

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const data = await scrapeAmazonProduct(url);
        res.status(200).json(data);
    } catch (error) {
        console.error(`Error scraping the product: ${error.message}`);
        res.status(500).send('Error scraping the product');
    }
});

app.get('/myntra_scraper', async (req, res) => {
    const url = req.query.url;
    console.log(`Received URL: ${url}`);

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const data = await scape_myntra(url);
        res.status(200).json(data);
    } catch (error) {
        console.error(`Error scraping the product: ${error.message}`);
        res.status(500).send('Error scraping the product');
    }
});

app.get('/', (req, res) => {
    console.log("status:", res.status(200).send("Affiliate response server."));
    res.status(200).send("Affiliate response server.")
})

const port = 4040;

app.listen(port, () => {
    console.log(`Server Running At Port : ${port}...`);
});