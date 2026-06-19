const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.goto('http://localhost:5000/shadow');
  
  await page.evaluate(() => {
    sessionStorage.setItem('bby_authenticated', 'true');
    sessionStorage.setItem('bby_active_manager', JSON.stringify({ name: 'Default Supervisor', role: 'Store Leader' }));
    sessionStorage.setItem('bby_store_id', 'store-1');
  });
  
  console.log('Reloading...');
  await page.reload({ waitUntil: 'networkidle0' });
  
  const content = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log('DOM ROOT LENGTH:', content.length);
  console.log('DOM ROOT CONTENT:');
  require('fs').writeFileSync('scratch/dom.html', content);
  
  const hasError = await page.evaluate(() => document.body.innerHTML.includes('Something went wrong'));
  console.log('HAS ERROR BOUNDARY:', hasError);
  
  await browser.close();
})();



