const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Añadimos el plugin de sigilo para evitar detección de bot básico
puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://s65-en.gladiatus.gameforge.com/game/index.php?mod=player&p=10765579&language=es';

(async () => {
  console.log('Iniciando navegador...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necesario para entornos CI/CD como GitHub
  });

  const page = await browser.newPage();

  // Establecemos un tamaño de pantalla realista
  await page.setViewport({ width: 1366, height: 768 });

  try {
    console.log(`Visitando: ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Esperamos 10 segundos aleatorios para asegurar que el script del juego carga y cuenta la visita
    console.log('Esperando en la página para validar la visita...');
    await new Promise(r => setTimeout(r, 10000));

    // Opcional: Imprimir el título para confirmar que cargó
    const title = await page.title();
    console.log(`Título de la página: ${title}`);
    console.log('¡Visita completada con éxito!');

  } catch (error) {
    console.error('Error durante la visita:', error);
    process.exit(1); // Forzamos error para que GitHub nos avise si falla mucho
  } finally {
    await browser.close();
  }
})();
