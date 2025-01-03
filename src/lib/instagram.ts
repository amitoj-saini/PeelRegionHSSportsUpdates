import { fetchStoredCookies, storeFetchedCookies } from "./datastoreManager";
import { config as envConfig } from "dotenv";
import puppeteer from "puppeteer";

envConfig();

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


(async () => {
    let cookies = fetchStoredCookies();

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await browser.setCookie(...cookies);

    await page.goto("https://instagram.com/", { waitUntil: "networkidle2" });

    let inputElement = await page.$('input[name="username"]');

    if (inputElement) {
        await page.type('input[name="username"]', process.env.IG_USERNAME || "");
        await page.type('input[name="password"]', process.env.IG_PASSWORD || "");

        await timeout(1000);

        await page.click('button[type="submit"]');
        
        await page.waitForNavigation({ waitUntil: "networkidle2" });

        await page.waitForSelector('button[type="button"]');

        await page.click('button[type="button"]');

        await timeout(1000);

        let cookies = await browser.cookies();

        storeFetchedCookies(cookies);        
    } else {
        console.log(" no need to login buddy!")
    }

    await browser.close();
})();
