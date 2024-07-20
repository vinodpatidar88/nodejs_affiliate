const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

puppeteer.use(StealthPlugin());

const app = express();

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
            executablePath: executablePath(),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
        console.log("before : page : ", browser);
        const page = await browser.newPage();
        console.log("after : page : ", page);

        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'DNT': '1', // Do Not Track
            'Referer': 'https://www.google.com/', // Referrer
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Chromium";v="91", "Not;A Brand";v="99", "Google Chrome";v="91"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            // 'Cookie': 'your_cookie_data_here' // If you have cookies for the site
        });

        const userAgent = new UserAgent();
        await page.setUserAgent(userAgent.toString());

        console.log(`Navigating to URL: ${url}`);

        await page.screenshot({ path: 'myntra_before_navigation.png' });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

        await page.screenshot({ path: 'myntra_after_navigation.png' });

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
    const browser = await puppeteer.launch({
        headless: true, // Sometimes headful mode helps avoid detection
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    });
    const page = await browser.newPage();

    // Set a random user agent
    const userAgent = new UserAgent();
    await page.setUserAgent(userAgent.toString());

    // Set extra HTTP headers
    await page.setExtraHTTPHeaders({
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,en;q=0.8'
    });

    // Set a random viewport size
    await page.setViewport({
        width: Math.floor(Math.random() * (1920 - 1366 + 1)) + 1366,
        height: Math.floor(Math.random() * (1080 - 768 + 1)) + 768
    });

    await page.goto('https://www.myntra.com/', { waitUntil: 'networkidle2' });

    // Perform some actions to mimic user behavior
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.click('body');
    await page.screenshot({ path: 'image.png', fullPage: true });

    await browser.close();
    res.status(200).send("Affiliate response server.")
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