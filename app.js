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

app.get('/scraper_myntra', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
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
    res.status(200).send("Affiliate response server.")
});

app.get('/', (req, res) => {
    console.log("status:", res.status(200).send("Affiliate response server."));
    res.status(200).send("Affiliate response server.")
})

const port = 4040;

app.listen(port, () => {
    console.log(`Server Running At Port : ${port}...`);
});