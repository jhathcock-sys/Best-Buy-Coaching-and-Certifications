const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  console.log('Navigating to http://localhost:5000...');
  await page.goto('http://localhost:5000');
  
  // Set localStorage to simulate logged in user
  await page.evaluate(() => {
    localStorage.setItem('bby_store_pin', '1234');
    localStorage.setItem('bby_active_manager', JSON.stringify({ name: "John", role: "GM" }));
    localStorage.setItem('bby_active_view', 'dashboard');
  });
  
  // Reload
  await page.reload({ waitUntil: 'networkidle0' });
  
  const content = await page.evaluate(() => document.body.innerHTML);
  console.log('DOM CONTENT:', content);
  
  await browser.close();
})();
