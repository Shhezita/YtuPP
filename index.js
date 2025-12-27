const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://s65-en.gladiatus.gameforge.com/game/index.php?mod=player&p=10765579&language=es';
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  // Configuración TURBO (Chrome del sistema)
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Identidad humana
    await page.setExtraHTTPHeaders({ 'Referer': 'https://www.google.com/' });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // --- CORRECCIÓN DE PRECISIÓN ---
    // Usamos networkidle2 para asegurar que el contador de visitas se carga SÍ o SÍ.
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Scroll para activar triggers visuales
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 300;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if(totalHeight >= scrollHeight){ 
                    clearInterval(timer);
                    resolve();
                }
            }, 50);
        });
    });

    // Espera final de seguridad
    await wait(3000);
    console.log('Visita Confirmada');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
