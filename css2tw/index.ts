import puppeteer from 'puppeteer';


async function convertPageToTailwind(url: string) {
    // Launch browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Go to the page
    await page.goto(url);

    // Execute script in the page context to modify the HTML
    const modifiedHtml = await page.evaluate(() => {
        // Function to map styles to Tailwind classes
        const mapStyleToTailwind = (style: CSSStyleDeclaration) => {
            let classes = [];
            // Example: Mapping padding, this would need to be more comprehensive
            const padding = Math.round(parseFloat(style.padding));
            if (padding > 0) {
                const paddingClass = `p-${Math.min(Math.max(Math.round(padding / 4), 1), 8)}`;
                classes.push(paddingClass);
            }

            const margin = Math.round(parseFloat(style.margin));
            if (margin > 0) {
                const marginClass = `m-${Math.min(Math.max(Math.round(margin / 4), 1), 8)}`;
                classes.push(marginClass);
            }

            return classes.join(' ');
        };

        // Iterate over elements, you might want to refine the selector
        document.querySelectorAll('*').forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            const tailwindClasses = mapStyleToTailwind(computedStyle);
            if (tailwindClasses) {
                el.className = ` ${tailwindClasses}`;
            }
        });

        // Return the modified HTML
        return document.documentElement.innerHTML;
    });

    console.log(modifiedHtml);

    await browser.close();
}

// Usage example
convertPageToTailwind('https://iota.uz');

// getSource('https://iota.uz').then((source) => {
//     console.log(source);
// });
