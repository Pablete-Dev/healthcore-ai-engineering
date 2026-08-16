const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'uis/website');

function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const full = path.join(root, reqPath);
  if (!full.startsWith(root)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
  fs.readFile(full, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    res.setHeader('Content-Type', contentType(full));
    res.end(data);
  });
});

(async () => {
  const port = 4173;
  await new Promise((resolve) => server.listen(port, resolve));

  const browser = await chromium.launch({ headless: true });
  const widths = [375, 768, 1024, 1366];
  const pages = ['index.html', 'index.es.html', 'application.html', 'application.es.html'];
  const results = [];

  for (const pageName of pages) {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${port}/${pageName}`, { waitUntil: 'networkidle' });
      const check = await page.evaluate(() => {
        const body = document.body;
        const docEl = document.documentElement;
        const overflow = docEl.scrollWidth > docEl.clientWidth || body.scrollWidth > body.clientWidth;

        const clickables = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
        let overlapCount = 0;
        for (let i = 0; i < clickables.length; i++) {
          const a = clickables[i].getBoundingClientRect();
          if (a.width === 0 || a.height === 0) continue;
          for (let j = i + 1; j < clickables.length; j++) {
            const b = clickables[j].getBoundingClientRect();
            if (b.width === 0 || b.height === 0) continue;
            const intersects = !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
            if (intersects) overlapCount++;
          }
        }

        return {
          overflow,
          overlapCount,
          scrollWidth: docEl.scrollWidth,
          clientWidth: docEl.clientWidth
        };
      });

      results.push({ page: pageName, width, ...check });
      await context.close();
    }
  }

  await browser.close();
  await new Promise((resolve) => server.close(resolve));

  const reportPath = path.join(process.cwd(), '.tmp', 'responsive-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('REPORT:' + reportPath);
  for (const r of results) {
    console.log(`${r.page} @ ${r.width}px | overflow=${r.overflow} | overlapCount=${r.overlapCount} | w=${r.clientWidth}/${r.scrollWidth}`);
  }
})();
