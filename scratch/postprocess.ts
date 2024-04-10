import {Collection, MongoClient} from "mongodb";
import puppeteer, {Browser} from "puppeteer";


function parseNumber(str: string): number {
    if (str.includes('K')) {
        return parseFloat(str.replace('K', '')) * 1000;
    }
    return parseInt(str);
}

class Postprocess {
    constructor(private browser: Browser, private vcCollection: Collection<any>, private newCollection: Collection<any>) {
    }

    async postprocess() {
        const posts = await this.vcCollection.find().toArray();
        const page = await this.browser.newPage();
        for (let i = 0; i < posts.length; i++) {
            console.log(`Processing ${i + 1}/${posts.length}`);
            const post = posts[i];
            try {
                await page.goto(post.url);
                await new Promise(resolve => setTimeout(resolve, 1000));
                const content = await page.evaluate(() => {
                    return document.querySelector('div.l-entry')?.textContent;
                });
                await this.newCollection.insertOne({
                    title: post.title.trim(),
                    comments: parseNumber(post.comments),
                    likes: post.likes ? parseNumber(post.likes) : -1,
                    views: parseNumber(post.views),
                    impressions: parseNumber(post.impressions),
                    url: post.url,
                    data: post.date,
                    content: content.trim(),
                    createdAt: new Date(),
                });
            } catch (e) {
                console.error(e);
            }
        }
    }
}

async function main() {
    const mongoClient = new MongoClient('mongodb://localhost:27017/amadeus', {});
    await mongoClient.connect();
    const db = mongoClient.db('amadeus');
    const collection = db.collection('vc');
    const newCollection = db.collection('vc_new');
    // create index
    await newCollection.createIndex({url: 1}, {unique: true});
    const browser = await puppeteer.launch({headless: true});
    const postprocess = new Postprocess(browser, collection, newCollection);
    await postprocess.postprocess();
}

main().then(() => process.exit(0)).catch(console.error);