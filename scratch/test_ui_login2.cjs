const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.goto('http://localhost:5000');
  
  await page.evaluate(() => {
    localStorage.setItem('bby_store_pin', '1234');
    localStorage.setItem('bby_active_manager', JSON.stringify({ name: "John", role: "GM", pin: "1234", id: "mgr-1" }));
    localStorage.setItem('bby_is_authenticated', 'true');
    localStorage.setItem('bby_active_view', 'dashboard');
    // Zustand persist key:
    localStorage.setItem('floorvision-storage', JSON.stringify({
      state: {
        isAuthenticated: true,
        storePin: '1234',
        activeManager: { name: "John", role: "GM", pin: "1234", id: "mgr-1" },
        activeView: 'dashboard'
      },
      version: 0
    }));
  });
  
  console.log('Reloading...');
  await page.reload({ waitUntil: 'networkidle0' });
  
  const content = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log('DOM ROOT LENGTH:', content.length);
  console.log('DOM ROOT CONTENT:');
  console.log(content.substring(0, 3000));
  
  await browser.close();
})();
