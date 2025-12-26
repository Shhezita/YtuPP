const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// 1. Activar modo sigilo para evitar detección antibot básica
puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://s65-en.gladiatus.gameforge.com/game/index.php?mod=player&p=10765579&language=es';

// Función para generar esperas aleatorias (comportamiento humano)
const wait = (min, max) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));

(async () => {
  console.log('--- Iniciando Protocolo de Visita Cirujano ---');
  
  const browser = await puppeteer.launch({
    headless: "new", // Nuevo modo headless más indetectable
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled' // Bandera crítica para ocultar automatización
    ]
  });

  try {
    const page = await browser.newPage();

    // 2. Configurar User Agent de un usuario real de Windows 10
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Configurar viewport común
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`Navegando a: ${TARGET_URL}`);
    
    // 3. Carga robusta: Esperamos hasta que la red esté casi inactiva (networkidle2)
    // Esto asegura que todos los scripts de tracking del juego se hayan descargado.
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Página cargada. Iniciando simulación humana...');

    // 4. MANIOBRA DE SCROLL (Vital para que cuente la visita)
    // Hacemos scroll suave hacia abajo para activar triggers de visibilidad
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight / 2){ // Bajar hasta la mitad
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    await wait(1000, 2000);

    // 5. MOVIMIENTO DE RATÓN
    // Movemos el ratón virtualmente para activar eventos 'mousemove'
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.mouse.move(500, 300);

    // 6. INTENTO DE CIERRE DE COOKIES (Si existe)
    // A veces el banner bloquea el tracking. Intentamos clicar "Aceptar" si aparece.
    try {
        const buttons = await page.$$('button');
        for (const button of buttons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text && (text.includes('Accept') || text.includes('Aceptar') || text.includes('Agree'))) {
                console.log('Botón de cookies detectado. Clicando...');
                await button.click();
                await wait(500, 1000);
                break;
            }
        }
    } catch (e) {
        // Ignoramos errores aquí, no es crítico si no hay banner
    }

    // Tiempo de permanencia extra para asegurar registro en base de datos del juego
    console.log('Manteniendo sesión activa para asegurar el conteo...');
    await wait(5000, 8000);

    const title = await page.title();
    console.log(`VISITA CONFIRMADA - Título final: ${title}`);

  } catch (error) {
    console.error('FALLO CRÍTICO:', error);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('--- Sesión finalizada ---');
  }
})();
