const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

(async () => {
  console.log("Launching puppeteer for Video generation...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const width = 1200;
  const height = 600;
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  
  await page.goto('file://' + __dirname + '/animation.html');
  
  const fps = 30;
  const duration = 30;
  const frames = fps * duration;
  
  const framesDir = path.join(__dirname, 'frames');
  if (fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(framesDir);
  
  console.log(`Rendering ${frames} frames...`);
  
  for (let i = 0; i < frames; i++) {
    const t = i / frames;
    await page.evaluate(`window.setFrame(${t})`);
    await new Promise(r => setTimeout(r, 5)); // ensure layout
    
    const buffer = await page.screenshot({ type: 'png' });
    // Pad frame number with leading zeros (e.g. 001.png)
    const frameNum = String(i).padStart(4, '0');
    fs.writeFileSync(path.join(framesDir, `frame_${frameNum}.png`), buffer);
    
    if (i % 30 === 0) console.log(`Rendered frame ${i}/${frames}`);
  }
  
  await browser.close();
  console.log("Frames captured. Muxing with ffmpeg...");
  
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  
  // Use ffmpeg to combine frames and audio
  // -framerate 30 -i frames/frame_%04d.png -i audio.wav -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest out.mp4
  const outputPath = path.join(__dirname, '../assets/project.mp4');
  
  const cmd = `"${ffmpegPath}" -y -framerate ${fps} -i "${path.join(framesDir, 'frame_%04d.png')}" -i "${path.join(__dirname, 'audio.wav')}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${outputPath}"`;
  
  console.log("Running:", cmd);
  execSync(cmd, { stdio: 'inherit' });
  
  console.log("Video generation complete! Saved to docs/assets/project.mp4");
  
  // Clean up frames
  fs.rmSync(framesDir, { recursive: true, force: true });
})().catch(console.error);
