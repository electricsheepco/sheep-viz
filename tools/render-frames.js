#!/usr/bin/env node
/**
 * Frame Renderer - Renders visualizer frames from pre-analyzed audio data
 * Usage: node render-frames.js audio-data.json output-dir [--width 1920] [--height 1080]
 */

const fs = require('fs');
const path = require('path');

let puppeteer;
try {
    puppeteer = require('puppeteer');
} catch (e) {
    console.error('Missing dependency. Run: npm install puppeteer');
    process.exit(1);
}

// Parse args
const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
        flags[args[i].slice(2)] = args[i + 1];
        i++;
    } else {
        positional.push(args[i]);
    }
}

if (positional.length < 2) {
    console.log('Usage: node render-frames.js <audio-data.json> <output-dir> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --res <preset>   Resolution: youtube, tiktok, reels, shorts, instagram, square, portrait, 2k, 4k');
    console.log('  --width 1920     Canvas width (custom)');
    console.log('  --height 1080    Canvas height (custom)');
    console.log('  --visualizer     Path to visualizer HTML (default: ../visualizers/vertical-pulse-render.html)');
    console.log('  --preset         Path to preset JSON file');
    console.log('  --seed 42        Random seed (overrides preset)');
    console.log('  --start 0        Start frame');
    console.log('  --end -1         End frame (-1 = all)');
    console.log('  --overlay        Path to overlay image (logo, etc.)');
    console.log('  --overlay-size   Overlay size as % (default: 20)');
    console.log('  --overlay-pos    Position: center, bottom-right, bottom-left, top-right, top-left');
    process.exit(1);
}

const audioDataFile = positional[0];
const outputDir = positional[1];
// Resolution presets
const resPresets = {
    youtube: [1920, 1080], hd: [1920, 1080],
    youtube2k: [2560, 1440], '2k': [2560, 1440],
    youtube4k: [3840, 2160], '4k': [3840, 2160],
    tiktok: [1080, 1920], reels: [1080, 1920], shorts: [1080, 1920],
    instagram: [1080, 1080], square: [1080, 1080],
    portrait: [1080, 1350]
};

let width = 1920, height = 1080;
if (flags.res && resPresets[flags.res]) {
    [width, height] = resPresets[flags.res];
} else {
    width = parseInt(flags.width) || 1920;
    height = parseInt(flags.height) || 1080;
}
const visualizerPath = flags.visualizer || path.join(__dirname, '../visualizers/vertical-pulse-render.html');
const seed = parseInt(flags.seed) || 42;
const startFrame = parseInt(flags.start) || 0;
const endFrame = parseInt(flags.end) || -1;
const overlayPath = flags.overlay || null;
const overlaySize = parseInt(flags['overlay-size']) || 20;
const overlayPos = flags['overlay-pos'] || 'bottom-right';
const presetPath = flags.preset || null;

// Load preset if specified
let presetParams = {};
if (presetPath && fs.existsSync(presetPath)) {
    const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
    if (preset.params) {
        presetParams = preset.params;
        console.log(`Loaded preset: ${preset.name}`);
    }
}

if (!fs.existsSync(audioDataFile)) {
    console.error(`File not found: ${audioDataFile}`);
    process.exit(1);
}

// Create output directory
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const audioData = JSON.parse(fs.readFileSync(audioDataFile, 'utf8'));
const totalFrames = endFrame === -1 ? audioData.frames.length : Math.min(endFrame, audioData.frames.length);

console.log(`Audio data: ${audioData.meta.totalFrames} frames @ ${audioData.meta.fps} fps`);
console.log(`Rendering: frames ${startFrame} to ${totalFrames - 1}`);
console.log(`Output: ${outputDir}`);
console.log(`Size: ${width}x${height}`);

async function render() {
    console.log('Launching browser...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });

    // Load the render-mode visualizer
    const vizUrl = `file://${path.resolve(visualizerPath)}`;
    console.log(`Loading: ${vizUrl}`);

    await page.goto(vizUrl, { waitUntil: 'networkidle0' });

    // Wait for p5.js to initialize
    await page.waitForSelector('canvas');
    await page.waitForTimeout(500);

    // Initialize with preset, seed, and overlay settings
    await page.evaluate((presetP, s, oSize, oPos) => {
        if (typeof P !== 'undefined') {
            // Apply preset params first
            if (presetP && typeof presetP === 'object') {
                Object.assign(P, presetP);
            }
            // Override with CLI args
            P.seed = s;
            P.overlaySize = oSize / 100;
            P.overlayPosition = oPos;
        }
        if (typeof initSystem === 'function') initSystem();
    }, presetParams, seed, overlaySize, overlayPos);

    // Load overlay if specified
    if (overlayPath && fs.existsSync(overlayPath)) {
        console.log(`Loading overlay: ${overlayPath}`);
        const overlayData = fs.readFileSync(overlayPath);
        const overlayBase64 = `data:image/${path.extname(overlayPath).slice(1)};base64,${overlayData.toString('base64')}`;

        await page.evaluate(async (dataUrl) => {
            if (typeof loadOverlayFromURL === 'function') {
                await loadOverlayFromURL(dataUrl);
            }
        }, overlayBase64);

        await page.waitForTimeout(500); // Wait for image to load
    }

    console.log('Rendering frames...');
    const startTime = Date.now();

    for (let f = startFrame; f < totalFrames; f++) {
        const frameData = audioData.frames[f];

        // Inject audio data and render frame
        await page.evaluate((data) => {
            // Set injected audio data for this frame
            window.injectedAudio = data;
            // Trigger a single draw
            if (typeof redraw === 'function') redraw();
        }, frameData);

        // Small delay for render
        await page.waitForTimeout(16);

        // Screenshot the canvas
        const canvas = await page.$('canvas');
        const frameNum = String(f).padStart(6, '0');
        const framePath = path.join(outputDir, `frame_${frameNum}.png`);

        await canvas.screenshot({ path: framePath });

        // Progress
        if (f % 10 === 0 || f === totalFrames - 1) {
            const elapsed = (Date.now() - startTime) / 1000;
            const framesRendered = f - startFrame + 1;
            const fps = framesRendered / elapsed;
            const eta = (totalFrames - f) / fps;
            process.stdout.write(`\rFrame ${f}/${totalFrames} | ${fps.toFixed(1)} fps | ETA: ${eta.toFixed(0)}s    `);
        }
    }

    console.log('\n\nClosing browser...');
    await browser.close();

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`Done! Rendered ${totalFrames - startFrame} frames in ${totalTime.toFixed(1)}s`);
    console.log(`Average: ${((totalFrames - startFrame) / totalTime).toFixed(1)} fps`);
    console.log('');
    console.log('Next step - compile with FFmpeg:');
    console.log(`  ffmpeg -framerate ${audioData.meta.fps} -i ${outputDir}/frame_%06d.png -i YOUR_AUDIO.mp3 \\`);
    console.log('    -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 320k output.mp4');
}

render().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
