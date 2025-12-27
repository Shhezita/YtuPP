const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// 1. Sigilo activado
puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://s65-en.gladiatus.gameforge.com/game/index.php?mod=player&p=10765579&language=es';

// Función de espera minimalista
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  // console.log('Iniciando...'); // Comentado para ahorrar I/O
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome', // Usamos Chrome del sistema (Ultra rápido)
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas', // Optimización extra de rendimiento
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // 2. Simulamos venir de Google para legitimidad
    await page.setExtraHTTPHeaders({ 'Referer': 'https://www.google.com/' });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // 3. Carga optimizada: Solo esperamos a que el DOM esté listo (mucho más rápido que networkidle)
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 4. Scroll "Trigger": Movimiento rápido para despertar el contador
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 300; // Pasos más largos para acabar antes
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if(totalHeight >= scrollHeight){ 
                    clearInterval(timer);
                    resolve();
                }
            }, 50); // Muy rápido
        });
    });

    // 5. Espera de seguridad mínima (3 segundos son suficientes para registrar la visita)
    await wait(3000);
    
    console.log('Visita OK'); // Único log necesario

  } catch (error) {
    console.error('Err:', error.message); // Solo mensaje de error corto
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
