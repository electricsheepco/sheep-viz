#!/usr/bin/env node
/**
 * Audio Analyzer - Extracts FFT data from audio file for offline rendering
 * Usage: node analyze-audio.js input.mp3 output.json [fps]
 */

const fs = require('fs');
const path = require('path');

// Check for required module
let Meyda;
try {
    Meyda = require('meyda');
} catch (e) {
    console.error('Missing dependency. Run: npm install meyda');
    process.exit(1);
}

let AudioContext, decodeAudioData;
try {
    const wa = require('web-audio-api');
    AudioContext = wa.AudioContext;
} catch (e) {
    console.error('Missing dependency. Run: npm install web-audio-api');
    process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node analyze-audio.js <input.mp3> <output.json> [fps=60]');
    console.log('');
    console.log('Extracts per-frame audio data for offline visual rendering.');
    console.log('Output JSON contains bass/mid/treble/spectrum for each frame.');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];
const fps = parseInt(args[2]) || 60;

if (!fs.existsSync(inputFile)) {
    console.error(`File not found: ${inputFile}`);
    process.exit(1);
}

console.log(`Analyzing: ${inputFile}`);
console.log(`Output: ${outputFile}`);
console.log(`FPS: ${fps}`);

const audioContext = new AudioContext();
const audioData = fs.readFileSync(inputFile);

audioContext.decodeAudioData(audioData.buffer, (buffer) => {
    const sampleRate = buffer.sampleRate;
    const duration = buffer.duration;
    const totalFrames = Math.ceil(duration * fps);
    const samplesPerFrame = Math.floor(sampleRate / fps);

    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Sample rate: ${sampleRate}`);
    console.log(`Total frames: ${totalFrames}`);

    // Get channel data (mono mix)
    const channels = buffer.numberOfChannels;
    const length = buffer.length;
    const mono = new Float32Array(length);

    for (let c = 0; c < channels; c++) {
        const channelData = buffer.getChannelData(c);
        for (let i = 0; i < length; i++) {
            mono[i] += channelData[i] / channels;
        }
    }

    const frames = [];
    const fftSize = 256;
    const binCount = fftSize / 2;

    console.log('Processing frames...');

    for (let f = 0; f < totalFrames; f++) {
        const startSample = f * samplesPerFrame;
        const endSample = Math.min(startSample + fftSize, length);

        // Extract window
        const window = new Float32Array(fftSize);
        for (let i = 0; i < fftSize && startSample + i < length; i++) {
            window[i] = mono[startSample + i];
        }

        // Compute features using Meyda
        Meyda.bufferSize = fftSize;
        Meyda.sampleRate = sampleRate;

        let features;
        try {
            features = Meyda.extract(['amplitudeSpectrum', 'rms', 'spectralCentroid'], window);
        } catch (e) {
            features = { amplitudeSpectrum: new Array(binCount).fill(0), rms: 0 };
        }

        const spectrum = features.amplitudeSpectrum || new Array(binCount).fill(0);

        // Normalize spectrum to 0-1
        const maxAmp = Math.max(...spectrum, 0.001);
        const normalizedSpectrum = spectrum.map(v => Math.min(v / maxAmp, 1));

        // Split into frequency bands
        const bassEnd = Math.floor(binCount * 0.1);
        const midEnd = Math.floor(binCount * 0.5);

        let bass = 0, mid = 0, treble = 0;
        for (let i = 0; i < bassEnd; i++) bass += normalizedSpectrum[i] || 0;
        for (let i = bassEnd; i < midEnd; i++) mid += normalizedSpectrum[i] || 0;
        for (let i = midEnd; i < binCount; i++) treble += normalizedSpectrum[i] || 0;

        bass /= bassEnd || 1;
        mid /= (midEnd - bassEnd) || 1;
        treble /= (binCount - midEnd) || 1;

        frames.push({
            frame: f,
            time: f / fps,
            bass: parseFloat(bass.toFixed(4)),
            mid: parseFloat(mid.toFixed(4)),
            treble: parseFloat(treble.toFixed(4)),
            rms: parseFloat((features.rms || 0).toFixed(4)),
            spectrum: normalizedSpectrum.map(v => parseFloat(v.toFixed(3)))
        });

        if (f % 100 === 0) {
            process.stdout.write(`\rFrame ${f}/${totalFrames} (${Math.round(f/totalFrames*100)}%)`);
        }
    }

    console.log('\nWriting output...');

    const output = {
        meta: {
            source: path.basename(inputFile),
            duration,
            fps,
            totalFrames,
            sampleRate,
            fftSize,
            binCount
        },
        frames
    };

    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`Done! Wrote ${totalFrames} frames to ${outputFile}`);

}, (err) => {
    console.error('Error decoding audio:', err);
    process.exit(1);
});
