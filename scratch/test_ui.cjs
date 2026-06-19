const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  console.log('Navigating to http://localhost:5000...');
  try {
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
    const content = await page.evaluate(() => document.body.innerHTML);
    console.log('DOM CONTENT:', content);
  } catch (e) {
    console.log('Failed to load:', e.message);
  }
  
  await browser.close();
})();
