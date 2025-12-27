const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://s65-en.gladiatus.gameforge.com/game/index.php?mod=player&p=10765579&language=es';

(async () => {
  console.log('--- Iniciando Debugger ---');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
    ]
  });

  try {
    const page = await browser.newPage();
    
    // TRUCO NUEVO: Decir que venimos de Google
    await page.setExtraHTTPHeaders({
      'Referer': 'https://www.google.com/'
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`Navegando a: ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Esperar un poco para asegurar carga visual
    await new Promise(r => setTimeout(r, 5000));

    // --- MOMENTO FOTO ---
    console.log('Tomando captura de pantalla...');
    await page.screenshot({ path: 'evidence.png', fullPage: true });
    console.log('Captura guardada como evidence.png');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
