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

app.get('/scraper', async (req, res) => {
    const url = req.query.url;

    // console.log(url);
    if (!url) {
        return res.status(400).send('URL is required');
    }
    try {
        const data = await scrapeAmazonProduct(url);
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