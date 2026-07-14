const puppeteer = require('puppeteer');
const GIFEncoder = require('gifencoder');
const { createCanvas, Image } = require('canvas');
const fs = require('fs');

(async () => {
  console.log("Launching puppeteer...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const width = 1200;
  const height = 600;
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  
  console.log("Loading HTML...");
  await page.goto('file://' + __dirname + '/animation.html');
  
  console.log("Initializing GIF encoder...");
  const encoder = new GIFEncoder(width, height);
  encoder.createReadStream().pipe(fs.createWriteStream('../assets/project.gif'));
  
  encoder.start();
  encoder.setRepeat(0);   
  encoder.setDelay(1000/20); // 20 fps to keep size small
  encoder.setQuality(10); 
  
  const frames = 600; // 30 seconds at 20 fps
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  for (let i = 0; i < frames; i++) {
    const t = i / frames;
    await page.evaluate(`window.setFrame(${t})`);
    
    // Evaluate to wait for layout
    await new Promise(r => setTimeout(r, 10));
    
    const buffer = await page.screenshot({ type: 'png' });
    
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, width, height);
    img.src = buffer;
    
    encoder.addFrame(ctx);
    
    if (i % 10 === 0) console.log(`Rendered frame ${i}/${frames}`);
  }
  
  encoder.finish();
  await browser.close();
  console.log("GIF generation complete! Saved to docs/assets/project.gif");
})().catch(console.error);
