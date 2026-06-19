const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  console.log('Navigating to http://localhost:5000...');
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
  
  console.log('Clicking Store Leader Access...');
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    if (buttons.length > 0) buttons[0].click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Entering Store ID and PIN...');
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    if (inputs.length > 0) {
      inputs[0].value = 'store-1';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    for (let i = 0; i < 4; i++) {
      const pinInput = document.getElementById(`pin-${i}`);
      if (pinInput) {
        pinInput.value = '1234'.charAt(i);
        pinInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('C:\\Users\\jhath\\projects\\Best Buy Coaching and Certifications\\scratch\\dump.html', content);
  console.log('DOM CONTENT POST-LOGIN written to dump.html (Length:', content.length, ')');
  
  const hasError = await page.evaluate(() => document.body.innerHTML.includes('Something went wrong'));
  console.log('HAS ERROR BOUNDARY:', hasError);
  
  await page.screenshot({ path: 'C:\\Users\\jhath\\projects\\Best Buy Coaching and Certifications\\scratch\\screenshot.png', fullPage: true });
  console.log('Screenshot saved to screenshot.png');
  
  await browser.close();
})();
