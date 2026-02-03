# Vertical Pulse

## Algorithmic Philosophy

Sound is not horizontal - it rises. Bass emerges from the depths, treble shimmers at the apex. **Vertical Pulse** renders this truth through cascading columns of light that breathe with audio, creating the visual sensation of standing inside a living frequency spectrum.

The core algorithm constructs a forest of vertical light columns, each assigned to a frequency band. These columns are not static bars - they are composed of thousands of particles that flow upward or downward based on audio energy. When bass hits, the lower columns surge with density and brightness. High frequencies cause upper particles to scatter and shimmer. The result is a continuous liquid curtain of light that responds to every transient, every sustained note, every moment of silence.

Organic distortion emerges through metaballs - soft blob shapes that drift horizontally across the column field, creating the illusion of something alive moving behind the curtain. These entities are driven by mid-frequency energy, swelling and contracting with the music's body. Where metaballs intersect columns, light bends and pools, creating the characteristic bright nodes visible in the aesthetic. This layering - rigid vertical structure disrupted by organic horizontal drift - produces visual tension that mirrors music's interplay of rhythm and melody.

Color is mapped to frequency with deliberate craft: deep reds and magentas for bass weight, electric blues for high-frequency air, with gradients bleeding between. The palette shifts dynamically - during quiet passages, colors desaturate toward monochrome; during crescendos, saturation pushes toward neon. Every color transition is the product of painstaking calibration, ensuring the visual never fights the audio but amplifies its emotional arc.

The implementation demands master-level attention to performance. Real-time audio analysis via FFT feeds directly into particle systems running at 60fps. Column density, metaball radius, color saturation, and particle velocity all respond to separate frequency bands simultaneously. The algorithm must feel effortless despite its complexity - a meticulously crafted system refined through countless iterations until the visual becomes inseparable from the sound.

This is not visualization - it is translation. Sound into light. Frequency into form. Rhythm into breath.

---

## Technical Expression

- **Vertical columns**: 40-80 columns across canvas width, each a particle emitter
- **Frequency mapping**: FFT bins mapped to column indices (bass left/center, treble right, or distributed)
- **Particle behavior**: Upward flow velocity proportional to column's frequency energy
- **Metaballs**: 3-8 organic blobs driven by mid-frequency RMS, creating distortion zones
- **Color system**: HSB with hue mapped to frequency, saturation to energy, brightness to local density
- **Audio reactivity**: Web Audio API AnalyserNode with smoothed FFT data

## Conceptual Seed

The quiet reference embedded in this algorithm: the visual language of analog synthesizer patch cables and modular racks - vertical paths of signal flow, cross-patched by organic human decisions, light indicating presence of voltage/life. Those who've stood before a modular wall will feel it without knowing why.
