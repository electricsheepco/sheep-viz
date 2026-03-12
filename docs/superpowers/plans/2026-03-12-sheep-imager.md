# Scatter Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 6-band multiband stereo imager AU + VST3 plugin ("Scatter by sheep") using JUCE 8 and C++17, with a flat dark UI and the Sheep brand.

**Architecture:** An `AudioProcessorValueTreeState` (APVTS) manages 20 parameters. The audio callback feeds stereo input through a `MultibandSplitter` (LR4 crossovers, 6 bands) and then a `StereoImager` (M/S width per band), sums the bands, and writes to output. The UI is a single fixed 600×380px editor with a `FrequencyDisplay` (crossover drag), six `BandStrip` columns, a `HeaderBar`, and a `FooterBar` with the sheep logo.

**Tech Stack:** JUCE 8, C++17, CMake 3.22+, Xcode 15+, macOS 12+

**Spec:** `docs/superpowers/specs/2026-03-12-scatter-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `CMakeLists.txt` | Build definition — plugin targets, test runner, JUCE fetch |
| `Source/PluginProcessor.h/.cpp` | APVTS, `processBlock`, `prepareToPlay`, state I/O |
| `Source/PluginEditor.h/.cpp` | Root component, 600×380px layout |
| `Source/dsp/CrossoverFilter.h/.cpp` | Single LR4 crossover: LP + HP outputs |
| `Source/dsp/MultibandSplitter.h/.cpp` | 5 crossovers → 6 band buffers, coefficient refresh |
| `Source/dsp/StereoImager.h/.cpp` | Per-band M/S encode → scale Side → decode |
| `Source/ui/LookAndFeel.h/.cpp` | Colors, fonts, custom slider rendering |
| `Source/ui/HeaderBar.h/.cpp` | Plugin name, IN/OUT gain knobs, global bypass |
| `Source/ui/FooterBar.h/.cpp` | Sheep logo SVG, copyright text |
| `Source/ui/BandStrip.h/.cpp` | Width slider, bypass, solo, label, range readout |
| `Source/ui/FrequencyDisplay.h/.cpp` | 6 colored band rects + 5 draggable crossover handles |
| `Tests/TestRunner.cpp` | `main()` — runs JUCE UnitTestRunner, exits with failure count |
| `Tests/CrossoverFilterTests.cpp` | LR4 flat-sum, LP/HP accuracy at fc |
| `Tests/StereoImagerTests.cpp` | M/S at 0%, 100%, mono source, hyper-wide |
| `Tests/MultibandSplitterTests.cpp` | 6-band flat sum, crossover constraint enforcement |
| `Resources/sheep-logo.svg` | Waveform-bars logo (copy from sheep project) |

---

## Chunk 1: Project Scaffold

**Goal:** Empty JUCE plugin that compiles and installs as AU + VST3, with a test runner binary.

### Task 1: Prerequisites

- [ ] **Check Xcode version**

  ```bash
  xcodebuild -version
  # Expected: Xcode 15.0 or higher
  ```

- [ ] **Check CMake version**

  ```bash
  cmake --version
  # Expected: cmake version 3.22.0 or higher
  # Install if missing: brew install cmake
  ```

- [ ] **Check clang supports C++17**

  ```bash
  clang++ --version
  # Expected: Apple clang version 15.0+
  ```

---

### Task 2: Create project directory

- [ ] **Create directory**

  ```bash
  mkdir -p /Volumes/zodlightning/sites/sheep/plugins/scatter
  cd /Volumes/zodlightning/sites/sheep/plugins/scatter
  git init
  ```

- [ ] **Create directory structure**

  ```bash
  mkdir -p Source/dsp Source/ui Tests Resources
  ```

---

### Task 3: Write CMakeLists.txt

- [ ] **Create `CMakeLists.txt`**

  ```cmake
  cmake_minimum_required(VERSION 3.22)
  project(Scatter VERSION 1.0.0)

  set(CMAKE_CXX_STANDARD 17)
  set(CMAKE_CXX_STANDARD_REQUIRED ON)
  set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

  # Fetch JUCE 8
  include(FetchContent)
  FetchContent_Declare(
      JUCE
      GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
      GIT_TAG        8.0.4
      GIT_SHALLOW    TRUE
  )
  FetchContent_MakeAvailable(JUCE)

  # ── Plugin target ─────────────────────────────────────────────────────────
  juce_add_plugin(Scatter
      FORMATS                 AU VST3
      PLUGIN_NAME             "Scatter"
      PLUGIN_MANUFACTURER_CODE Essc
      PLUGIN_CODE             Scat
      PLUGIN_MANUFACTURER     "Electric Sheep Supply Co."
      PLUGIN_VERSION          "1.0.0"
      IS_SYNTH                FALSE
      NEEDS_MIDI_INPUT        FALSE
      NEEDS_MIDI_OUTPUT       FALSE
      IS_MIDI_EFFECT          FALSE
      EDITOR_WANTS_KEYBOARD_FOCUS FALSE
      VST3_CATEGORIES         "Fx Spatial"
      AU_MAIN_TYPE            "kAudioUnitType_Effect"
      COPY_PLUGIN_AFTER_BUILD TRUE
  )

  target_sources(Scatter PRIVATE
      Source/PluginProcessor.cpp
      Source/PluginEditor.cpp
      Source/dsp/CrossoverFilter.cpp
      Source/dsp/MultibandSplitter.cpp
      Source/dsp/StereoImager.cpp
      Source/ui/LookAndFeel.cpp
      Source/ui/HeaderBar.cpp
      Source/ui/FooterBar.cpp
      Source/ui/BandStrip.cpp
      Source/ui/FrequencyDisplay.cpp
  )

  target_compile_definitions(Scatter PUBLIC
      JUCE_WEB_BROWSER=0
      JUCE_USE_CURL=0
      JUCE_VST3_CAN_REPLACE_VST2=0
  )

  target_link_libraries(Scatter PRIVATE
      juce::juce_audio_processors
      juce::juce_audio_utils
      juce::juce_dsp
      juce::juce_graphics
      juce::juce_gui_basics
      juce_recommended_config_flags
      juce_recommended_warning_flags
  )

  # ── Test runner target ─────────────────────────────────────────────────────
  juce_add_console_app(ScatterTests
      PRODUCT_NAME "ScatterTests"
  )

  target_sources(ScatterTests PRIVATE
      Tests/TestRunner.cpp
      Tests/CrossoverFilterTests.cpp
      Tests/StereoImagerTests.cpp
      Tests/MultibandSplitterTests.cpp
      Source/dsp/CrossoverFilter.cpp
      Source/dsp/MultibandSplitter.cpp
      Source/dsp/StereoImager.cpp
  )

  target_include_directories(ScatterTests PRIVATE Source)

  target_compile_definitions(ScatterTests PRIVATE
      JUCE_STANDALONE_APPLICATION=1
  )

  target_link_libraries(ScatterTests PRIVATE
      juce::juce_audio_basics
      juce::juce_dsp
      juce::juce_core
      juce_recommended_config_flags
      juce_recommended_warning_flags
  )
  ```

---

### Task 4: Stub out all source files so CMake can configure

Every `.cpp` file listed in CMakeLists.txt must exist (even empty stubs) before the build will configure. Create minimal stubs now.

- [ ] **Create `Source/PluginProcessor.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>

  class ScatterProcessor : public juce::AudioProcessor
  {
  public:
      ScatterProcessor();
      ~ScatterProcessor() override = default;

      void prepareToPlay(double sampleRate, int samplesPerBlock) override;
      void releaseResources() override {}
      void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

      juce::AudioProcessorEditor* createEditor() override;
      bool hasEditor() const override { return true; }

      const juce::String getName() const override { return "Scatter"; }
      bool acceptsMidi() const override { return false; }
      bool producesMidi() const override { return false; }
      double getTailLengthSeconds() const override { return 0.0; }

      int getNumPrograms() override { return 1; }
      int getCurrentProgram() override { return 0; }
      void setCurrentProgram(int) override {}
      const juce::String getProgramName(int) override { return {}; }
      void changeProgramName(int, const juce::String&) override {}

      void getStateInformation(juce::MemoryBlock& destData) override;
      void setStateInformation(const void* data, int sizeInBytes) override;

      bool isBusesLayoutSupported(const BusesLayout& layouts) const override;
  };
  ```

- [ ] **Create `Source/PluginProcessor.cpp`** (stub)

  ```cpp
  #include "PluginProcessor.h"
  #include "PluginEditor.h"

  ScatterProcessor::ScatterProcessor()
      : AudioProcessor(BusesProperties()
            .withInput("Input", juce::AudioChannelSet::stereo(), true)
            .withOutput("Output", juce::AudioChannelSet::stereo(), true))
  {
      setLatencySamples(0);
  }

  bool ScatterProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
  {
      return layouts.getMainInputChannelSet() == juce::AudioChannelSet::stereo()
          && layouts.getMainOutputChannelSet() == juce::AudioChannelSet::stereo();
  }

  void ScatterProcessor::prepareToPlay(double /*sampleRate*/, int /*samplesPerBlock*/) {}

  void ScatterProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
  {
      // passthrough stub
  }

  juce::AudioProcessorEditor* ScatterProcessor::createEditor()
  {
      return new juce::GenericAudioProcessorEditor(*this);
  }

  void ScatterProcessor::getStateInformation(juce::MemoryBlock&) {}
  void ScatterProcessor::setStateInformation(const void*, int) {}

  juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
  {
      return new ScatterProcessor();
  }
  ```

- [ ] **Create `Source/PluginEditor.h`** (stub)

  ```cpp
  #pragma once
  #include <JuceHeader.h>
  #include "PluginProcessor.h"

  class ScatterEditor : public juce::AudioProcessorEditor
  {
  public:
      explicit ScatterEditor(ScatterProcessor&);
      ~ScatterEditor() override = default;
      void paint(juce::Graphics&) override;
      void resized() override;
  private:
      ScatterProcessor& processor;
  };
  ```

- [ ] **Create `Source/PluginEditor.cpp`** (stub)

  ```cpp
  #include "PluginEditor.h"

  ScatterEditor::ScatterEditor(ScatterProcessor& p)
      : AudioProcessorEditor(&p), processor(p)
  {
      setSize(600, 380);
  }

  void ScatterEditor::paint(juce::Graphics& g)
  {
      g.fillAll(juce::Colour(0xff111114));
  }

  void ScatterEditor::resized() {}
  ```

- [ ] **Create all DSP stubs** (empty `.h` + `.cpp` pairs)

  `Source/dsp/CrossoverFilter.h`:
  ```cpp
  #pragma once
  #include <JuceHeader.h>
  struct CrossoverFilter {};
  ```

  `Source/dsp/CrossoverFilter.cpp`:
  ```cpp
  #include "CrossoverFilter.h"
  ```

  `Source/dsp/MultibandSplitter.h`:
  ```cpp
  #pragma once
  #include <JuceHeader.h>
  struct MultibandSplitter {};
  ```

  `Source/dsp/MultibandSplitter.cpp`:
  ```cpp
  #include "MultibandSplitter.h"
  ```

  `Source/dsp/StereoImager.h`:
  ```cpp
  #pragma once
  #include <JuceHeader.h>
  struct StereoImager {};
  ```

  `Source/dsp/StereoImager.cpp`:
  ```cpp
  #include "StereoImager.h"
  ```

- [ ] **Create all UI stubs** (same pattern)

  ```bash
  # For each of: LookAndFeel, HeaderBar, FooterBar, BandStrip, FrequencyDisplay
  # Create Source/ui/Foo.h with: #pragma once\n#include <JuceHeader.h>\nstruct Foo {};
  # Create Source/ui/Foo.cpp with: #include "Foo.h"
  ```

  `Source/ui/LookAndFeel.h`:
  ```cpp
  #pragma once
  #include <JuceHeader.h>
  class ScatterLookAndFeel : public juce::LookAndFeel_V4 {};
  ```
  `Source/ui/LookAndFeel.cpp`: `#include "LookAndFeel.h"`

  `Source/ui/HeaderBar.h`:
  ```cpp
  #pragma once
  #include <JuceHeader.h>
  class HeaderBar : public juce::Component {};
  ```
  `Source/ui/HeaderBar.cpp`: `#include "HeaderBar.h"`

  Repeat for `FooterBar.h/.cpp`, `BandStrip.h/.cpp`, `FrequencyDisplay.h/.cpp`.

- [ ] **Create test stubs**

  `Tests/TestRunner.cpp`:
  ```cpp
  #include <JuceHeader.h>
  int main(int, char**)
  {
      juce::UnitTestRunner runner;
      runner.runAllTests();
      int failures = 0;
      for (int i = 0; i < runner.getNumResults(); ++i)
          failures += runner.getResult(i)->failures;
      return failures > 0 ? 1 : 0;
  }
  ```

  `Tests/CrossoverFilterTests.cpp`:
  ```cpp
  #include <JuceHeader.h>
  class CrossoverFilterTests : public juce::UnitTest
  {
  public:
      CrossoverFilterTests() : juce::UnitTest("CrossoverFilter") {}
      void runTest() override { beginTest("placeholder"); expect(true); }
  };
  static CrossoverFilterTests instance;
  ```

  Same placeholder for `Tests/StereoImagerTests.cpp` and `Tests/MultibandSplitterTests.cpp`.

---

### Task 5: Configure and build

- [ ] **Configure CMake**

  ```bash
  cd /Volumes/zodlightning/sites/sheep/plugins/scatter
  cmake -B build -G Xcode -DCMAKE_OSX_ARCHITECTURES="arm64;x86_64" -DCMAKE_OSX_DEPLOYMENT_TARGET=12.0
  # Expected: -- Configuring done / -- Build files have been written to: .../build
  # JUCE will be downloaded (~200MB). This takes 1-2 minutes on first run.
  ```

- [ ] **Build plugin**

  ```bash
  cmake --build build --config Debug --target Scatter_AU Scatter_VST3 -- -quiet
  # Expected: Build succeeded with 0 errors
  ```

- [ ] **Build and run tests**

  ```bash
  cmake --build build --config Debug --target ScatterTests -- -quiet
  ./build/ScatterTests_artefacts/Debug/ScatterTests
  # Expected: All tests passed: CrossoverFilter (1 test), StereoImager (1 test), MultibandSplitter (1 test)
  ```

- [ ] **Verify AU installed**

  ```bash
  ls ~/Library/Audio/Plug-Ins/Components/ | grep -i sheep
  # Expected: Scatter.component
  ```

- [ ] **Initial commit**

  ```bash
  cd /Volumes/zodlightning/sites/sheep/plugins/scatter
  echo "build/" > .gitignore
  echo ".DS_Store" >> .gitignore
  git add .
  git commit -m "feat: scaffold JUCE 8 AU+VST3 plugin project"
  ```

---

## Chunk 2: DSP Layer

**Goal:** `CrossoverFilter`, `MultibandSplitter`, and `StereoImager` are fully implemented and tested. All DSP unit tests pass.

### Background: JUCE DSP primer

Before writing the DSP code, understand these JUCE types:

- `juce::dsp::IIR::Coefficients<float>::makeLowPass(sampleRate, cutoffHz)` → creates 2nd-order Butterworth LP biquad coefficients
- `juce::dsp::IIR::Filter<float>` → single biquad filter instance (stateful, one channel)
- A single biquad has state (delay memory), so one `Filter` per channel per stage
- LR4 = two cascaded 2nd-order Butterworth → two `Filter` instances in series per channel
- `juce::AudioBuffer<float>` → float audio buffer; `getReadPointer(channel)` / `getWritePointer(channel)`

---

### Task 6: `CrossoverFilter` — write tests first

A `CrossoverFilter` takes a stereo audio buffer and produces two outputs: LP band and HP band, using LR4 filters at a given crossover frequency.

- [ ] **Write failing test in `Tests/CrossoverFilterTests.cpp`**

  ```cpp
  #include <JuceHeader.h>
  #include "dsp/CrossoverFilter.h"

  class CrossoverFilterTests : public juce::UnitTest
  {
  public:
      CrossoverFilterTests() : juce::UnitTest("CrossoverFilter") {}

      void runTest() override
      {
          // Test 1: LP + HP sum to unity (flat amplitude) at 1kHz crossover
          beginTest("LR4 LP + HP sum to flat amplitude");
          {
              CrossoverFilter xo;
              xo.prepare(44100.0, 512);
              xo.setCutoff(1000.0f);

              // Create 512-sample stereo buffer of 500 Hz sine
              constexpr int N = 512;
              juce::AudioBuffer<float> input(2, N);
              for (int i = 0; i < N; ++i)
              {
                  float s = std::sin(2.0f * juce::MathConstants<float>::pi * 500.0f * i / 44100.0f);
                  input.setSample(0, i, s);
                  input.setSample(1, i, s);
              }

              juce::AudioBuffer<float> lp(2, N), hp(2, N);
              xo.process(input, lp, hp);

              // For each sample, |lp[i] + hp[i]| should be close to |input[i]|
              // (after filter settles — skip first 64 samples as transient)
              float maxError = 0.0f;
              for (int i = 64; i < N; ++i)
              {
                  float reconstructed = lp.getSample(0, i) + hp.getSample(0, i);
                  float err = std::abs(reconstructed - input.getSample(0, i));
                  maxError = std::max(maxError, err);
              }
              // Allow 0.01 tolerance (LR4 has slight transient, good enough for audio)
              expectWithinAbsoluteError(maxError, 0.0f, 0.01f);
          }

          // Test 2: LP output at cutoff is ~-6dB
          beginTest("LP output at cutoff freq is -6dB (+/-1dB)");
          {
              CrossoverFilter xo;
              xo.prepare(44100.0, 512);
              xo.setCutoff(1000.0f);

              constexpr int N = 4096; // more samples for steady state
              juce::AudioBuffer<float> input(2, N), lp(2, N), hp(2, N);
              // 1kHz sine
              for (int i = 0; i < N; ++i)
              {
                  float s = std::sin(2.0f * juce::MathConstants<float>::pi * 1000.0f * i / 44100.0f);
                  input.setSample(0, i, s);
                  input.setSample(1, i, s);
              }
              xo.process(input, lp, hp);

              // RMS of LP output in last 1024 samples (steady state)
              float sumSq = 0.0f;
              for (int i = N - 1024; i < N; ++i)
                  sumSq += lp.getSample(0, i) * lp.getSample(0, i);
              float rms = std::sqrt(sumSq / 1024.0f);
              float dB = 20.0f * std::log10(rms + 1e-9f);
              // LR4 at fc: -6dB. Allow +/-1dB tolerance.
              expectWithinAbsoluteError(dB, -6.0f, 1.0f);
          }

          // Test 3: setCutoff updates without crash
          beginTest("setCutoff mid-stream does not crash");
          {
              CrossoverFilter xo;
              xo.prepare(44100.0, 512);
              xo.setCutoff(500.0f);
              juce::AudioBuffer<float> buf(2, 512), lp(2, 512), hp(2, 512);
              buf.clear();
              xo.process(buf, lp, hp);
              xo.setCutoff(2000.0f); // change cutoff
              xo.process(buf, lp, hp); // should not crash
              expect(true);
          }
      }
  };
  static CrossoverFilterTests crossoverFilterTestsInstance;
  ```

- [ ] **Run test to verify it fails**

  ```bash
  cmake --build build --config Debug --target ScatterTests -- -quiet
  ./build/ScatterTests_artefacts/Debug/ScatterTests
  # Expected: FAIL — CrossoverFilter struct is empty
  ```

---

### Task 7: Implement `CrossoverFilter`

- [ ] **Write `Source/dsp/CrossoverFilter.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>

  /**
   * Single Linkwitz-Riley 4th-order crossover.
   * Splits a stereo buffer into LP band and HP band.
   * LR4 = two cascaded 2nd-order Butterworth LP (or HP) filters.
   * LP + HP sums to flat amplitude response.
   */
  class CrossoverFilter
  {
  public:
      CrossoverFilter() = default;

      /** Call once before processing. sampleRate must be > 0. */
      void prepare(double sampleRate, int maxBlockSize);

      /** Set crossover frequency in Hz. Clamps to [40, 18000]. */
      void setCutoff(float frequencyHz);

      /** Returns current cutoff. */
      float getCutoff() const { return cutoffHz; }

      /**
       * Process one stereo block.
       * input, lpOut, hpOut must all have 2 channels and the same number of samples.
       * lpOut and hpOut are overwritten.
       */
      void process(const juce::AudioBuffer<float>& input,
                   juce::AudioBuffer<float>& lpOut,
                   juce::AudioBuffer<float>& hpOut);

  private:
      void updateCoefficients();

      double sampleRate = 44100.0;
      float  cutoffHz   = 1000.0f;

      // LR4 LP: two cascaded 2nd-order Butterworth LP per channel
      // LR4 HP: two cascaded 2nd-order Butterworth HP per channel
      // Index: [stage 0..1][channel 0..1]
      juce::dsp::IIR::Filter<float> lpFilters[2][2];
      juce::dsp::IIR::Filter<float> hpFilters[2][2];
  };
  ```

- [ ] **Write `Source/dsp/CrossoverFilter.cpp`**

  ```cpp
  #include "CrossoverFilter.h"

  static constexpr float kMinCutoff = 40.0f;
  static constexpr float kMaxCutoff = 18000.0f;

  void CrossoverFilter::prepare(double sr, int maxBlockSize)
  {
      sampleRate = sr;

      juce::dsp::ProcessSpec spec;
      spec.sampleRate       = sr;
      spec.maximumBlockSize = (juce::uint32)maxBlockSize;
      spec.numChannels      = 1;

      for (int stage = 0; stage < 2; ++stage)
          for (int ch = 0; ch < 2; ++ch)
          {
              lpFilters[stage][ch].prepare(spec);
              hpFilters[stage][ch].prepare(spec);
          }

      updateCoefficients();
  }

  void CrossoverFilter::setCutoff(float hz)
  {
      cutoffHz = juce::jlimit(kMinCutoff, kMaxCutoff, hz);
      updateCoefficients();
  }

  void CrossoverFilter::updateCoefficients()
  {
      // Butterworth 2nd-order LP and HP at cutoffHz
      auto lpCoeffs = juce::dsp::IIR::Coefficients<float>::makeLowPass(sampleRate, cutoffHz);
      auto hpCoeffs = juce::dsp::IIR::Coefficients<float>::makeHighPass(sampleRate, cutoffHz);

      for (int stage = 0; stage < 2; ++stage)
          for (int ch = 0; ch < 2; ++ch)
          {
              *lpFilters[stage][ch].coefficients = *lpCoeffs;
              *hpFilters[stage][ch].coefficients = *hpCoeffs;
          }
  }

  void CrossoverFilter::process(const juce::AudioBuffer<float>& input,
                                juce::AudioBuffer<float>& lpOut,
                                juce::AudioBuffer<float>& hpOut)
  {
      const int numSamples  = input.getNumSamples();
      const int numChannels = juce::jmin(input.getNumChannels(), 2);

      for (int ch = 0; ch < numChannels; ++ch)
      {
          const float* src = input.getReadPointer(ch);
          float* lpDest    = lpOut.getWritePointer(ch);
          float* hpDest    = hpOut.getWritePointer(ch);

          for (int i = 0; i < numSamples; ++i)
          {
              float s = src[i];

              // LP stage: cascade two 2nd-order Butterworth LP
              float lp = lpFilters[0][ch].processSample(s);
              lp        = lpFilters[1][ch].processSample(lp);
              lpDest[i] = lp;

              // HP stage: cascade two 2nd-order Butterworth HP
              float hp = hpFilters[0][ch].processSample(s);
              hp        = hpFilters[1][ch].processSample(hp);
              hpDest[i] = hp;
          }
      }
  }
  ```

- [ ] **Run CrossoverFilter tests**

  ```bash
  cmake --build build --config Debug --target ScatterTests -- -quiet
  ./build/ScatterTests_artefacts/Debug/ScatterTests
  # Expected: CrossoverFilter — 3 tests, 0 failures
  ```

- [ ] **Commit**

  ```bash
  git add Source/dsp/CrossoverFilter.h Source/dsp/CrossoverFilter.cpp Tests/CrossoverFilterTests.cpp
  git commit -m "feat: implement LR4 CrossoverFilter with tests"
  ```

---

### Task 8: `StereoImager` — write tests first

`StereoImager` takes a single stereo band buffer and applies M/S width processing.

- [ ] **Write failing tests in `Tests/StereoImagerTests.cpp`**

  ```cpp
  #include <JuceHeader.h>
  #include "dsp/StereoImager.h"

  class StereoImagerTests : public juce::UnitTest
  {
  public:
      StereoImagerTests() : juce::UnitTest("StereoImager") {}

      void runTest() override
      {
          // Test 1: width=100% → unity passthrough
          beginTest("Width 100% is unity passthrough");
          {
              StereoImager imager;
              imager.setWidth(1.0f);

              constexpr int N = 256;
              juce::AudioBuffer<float> buf(2, N);
              for (int i = 0; i < N; ++i)
              {
                  buf.setSample(0, i, 0.8f);
                  buf.setSample(1, i, 0.3f);
              }

              juce::AudioBuffer<float> out(2, N);
              imager.process(buf, out);

              for (int i = 0; i < N; ++i)
              {
                  expectWithinAbsoluteError(out.getSample(0, i), 0.8f, 1e-5f);
                  expectWithinAbsoluteError(out.getSample(1, i), 0.3f, 1e-5f);
              }
          }

          // Test 2: width=0% → mono (L == R)
          beginTest("Width 0% makes L == R");
          {
              StereoImager imager;
              imager.setWidth(0.0f);

              constexpr int N = 256;
              juce::AudioBuffer<float> buf(2, N);
              for (int i = 0; i < N; ++i)
              {
                  buf.setSample(0, i, 0.8f);
                  buf.setSample(1, i, 0.3f);
              }

              juce::AudioBuffer<float> out(2, N);
              imager.process(buf, out);

              for (int i = 0; i < N; ++i)
                  expectWithinAbsoluteError(out.getSample(0, i), out.getSample(1, i), 1e-5f);
          }

          // Test 3: width=0% on mono source → no level change
          beginTest("Width 0% on mono source preserves level");
          {
              StereoImager imager;
              imager.setWidth(0.0f);

              constexpr int N = 256;
              juce::AudioBuffer<float> buf(2, N);
              for (int i = 0; i < N; ++i)
              {
                  buf.setSample(0, i, 0.5f); // L == R → mono source
                  buf.setSample(1, i, 0.5f);
              }

              juce::AudioBuffer<float> out(2, N);
              imager.process(buf, out);

              // For mono input at 0% width: L_out = R_out = (L+R)/2 = 0.5
              for (int i = 0; i < N; ++i)
                  expectWithinAbsoluteError(out.getSample(0, i), 0.5f, 1e-5f);
          }

          // Test 4: width=150% amplifies Side
          beginTest("Width 150% amplifies side content");
          {
              StereoImager imager;
              imager.setWidth(1.5f);

              // Pure side signal: L=0.5, R=-0.5
              constexpr int N = 256;
              juce::AudioBuffer<float> buf(2, N);
              for (int i = 0; i < N; ++i)
              {
                  buf.setSample(0, i,  0.5f);
                  buf.setSample(1, i, -0.5f);
              }

              juce::AudioBuffer<float> out(2, N);
              imager.process(buf, out);

              // Mid=0, Side=0.5. L_out = 0 + 0.5*1.5 = 0.75, R_out = 0 - 0.5*1.5 = -0.75
              for (int i = 0; i < N; ++i)
              {
                  expectWithinAbsoluteError(out.getSample(0, i),  0.75f, 1e-5f);
                  expectWithinAbsoluteError(out.getSample(1, i), -0.75f, 1e-5f);
              }
          }
      }
  };
  static StereoImagerTests stereoImagerTestsInstance;
  ```

- [ ] **Run to confirm failure**

  ```bash
  cmake --build build --config Debug --target ScatterTests -- -quiet
  ./build/ScatterTests_artefacts/Debug/ScatterTests
  # Expected: StereoImager tests FAIL
  ```

---

### Task 9: Implement `StereoImager`

- [ ] **Write `Source/dsp/StereoImager.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>

  /**
   * Per-band M/S stereo width processor.
   * Encodes L/R to M/S, scales the Side channel, decodes back to L/R.
   *
   * width = 0.0  → pure mono (Side = 0)
   * width = 1.0  → unity (original L/R)
   * width = 1.5  → hyper-wide (Side amplified)
   */
  class StereoImager
  {
  public:
      StereoImager() = default;

      /** width in [0.0, 1.5]. Clamps automatically. */
      void setWidth(float w) { widthFactor = juce::jlimit(0.0f, 1.5f, w); }

      float getWidth() const { return widthFactor; }

      /**
       * Process in-place: input is read, output is written.
       * Both buffers must be stereo (2 channels) with the same sample count.
       * input and output may be the same buffer (in-place safe).
       */
      void process(const juce::AudioBuffer<float>& input,
                   juce::AudioBuffer<float>& output);

  private:
      float widthFactor = 1.0f;
  };
  ```

- [ ] **Write `Source/dsp/StereoImager.cpp`**

  ```cpp
  #include "StereoImager.h"

  void StereoImager::process(const juce::AudioBuffer<float>& input,
                             juce::AudioBuffer<float>& output)
  {
      const int N = input.getNumSamples();
      const float* L = input.getReadPointer(0);
      const float* R = input.getReadPointer(1);
      float* Lo      = output.getWritePointer(0);
      float* Ro      = output.getWritePointer(1);
      const float w  = widthFactor;

      for (int i = 0; i < N; ++i)
      {
          const float mid  = (L[i] + R[i]) * 0.5f;
          const float side = (L[i] - R[i]) * 0.5f;
          Lo[i] = mid + side * w;
          Ro[i] = mid - side * w;
      }
  }
  ```

- [ ] **Run StereoImager tests**

  ```bash
  cmake --build build --config Debug --target ScatterTests -- -quiet
  ./build/ScatterTests_artefacts/Debug/ScatterTests
  # Expected: StereoImager — 4 tests, 0 failures
  ```

- [ ] **Commit**

  ```bash
  git add Source/dsp/StereoImager.h Source/dsp/StereoImager.cpp Tests/StereoImagerTests.cpp
  git commit -m "feat: implement StereoImager M/S processor with tests"
  ```

---

### Task 10: `MultibandSplitter` — write tests first

`MultibandSplitter` owns 5 `CrossoverFilter` instances and splits a stereo input into 6 band buffers using the cascade approach: Band 1 = LP(XO1), Band 2 = HP(XO1) split further by XO2, etc.

- [ ] **Write failing tests in `Tests/MultibandSplitterTests.cpp`**

  ```cpp
  #include <JuceHeader.h>
  #include "dsp/MultibandSplitter.h"

  class MultibandSplitterTests : public juce::UnitTest
  {
  public:
      MultibandSplitterTests() : juce::UnitTest("MultibandSplitter") {}

      void runTest() override
      {
          // Test 1: Sum of all 6 bands = original input (within tolerance)
          beginTest("6 bands sum to flat within 0.1dB");
          {
              MultibandSplitter splitter;
              splitter.prepare(44100.0, 512);
              splitter.setCrossovers(150.f, 500.f, 2000.f, 5000.f, 10000.f);

              constexpr int N = 512;
              juce::AudioBuffer<float> input(2, N);
              // White noise input
              juce::Random rng(12345);
              for (int i = 0; i < N; ++i)
              {
                  float s = rng.nextFloat() * 2.0f - 1.0f;
                  input.setSample(0, i, s);
                  input.setSample(1, i, s);
              }

              std::array<juce::AudioBuffer<float>, 6> bands;
              for (auto& b : bands) b.setSize(2, N);

              splitter.process(input, bands);

              // Sum all bands, compare to input (skip first 128 samples for filter transient)
              float maxErr = 0.0f;
              for (int i = 128; i < N; ++i)
              {
                  float sum = 0.0f;
                  for (auto& b : bands) sum += b.getSample(0, i);
                  maxErr = std::max(maxErr, std::abs(sum - input.getSample(0, i)));
              }
              // Allow 0.05 tolerance (IIR transients at transitions)
              expectWithinAbsoluteError(maxErr, 0.0f, 0.05f);
          }

          // Test 2: Crossover ordering constraint (clamp-the-mover)
          beginTest("setCrossovers clamps out-of-order values");
          {
              MultibandSplitter splitter;
              splitter.prepare(44100.0, 512);
              // Set XO2 below XO1 → XO2 should be clamped to XO1 + 50
              splitter.setCrossovers(500.f, 200.f, 2000.f, 5000.f, 10000.f); // XO2=200 < XO1=500

              auto xos = splitter.getCrossovers();
              // XO1 must remain at 500Hz (clamp-the-mover: neighbors don't move)
              expectWithinAbsoluteError(xos[0], 500.f, 1.0f);
              // XO2 should be clamped to XO1 + 50 = 550
              expect(xos[1] >= xos[0] + 50.0f);
              // XO3..XO5 must remain unchanged
              expectWithinAbsoluteError(xos[2], 2000.f, 1.0f);
              expectWithinAbsoluteError(xos[3], 5000.f, 1.0f);
              expectWithinAbsoluteError(xos[4], 10000.f, 1.0f);
          }

          // Test 3: Band count
          beginTest("Produces exactly 6 bands");
          {
              MultibandSplitter splitter;
              splitter.prepare(44100.0, 512);
              splitter.setCrossovers(150.f, 500.f, 2000.f, 5000.f, 10000.f);
              expectEquals(splitter.getNumBands(), 6);
          }
      }
  };
  static MultibandSplitterTests multibandSplitterTestsInstance;
  ```

- [ ] **Run to confirm failure**

  ```bash
  cmake --build build --config Debug --target ScatterTests -- -quiet
  ./build/ScatterTests_artefacts/Debug/ScatterTests
  # Expected: MultibandSplitter tests FAIL
  ```

---

### Task 11: Implement `MultibandSplitter`

- [ ] **Write `Source/dsp/MultibandSplitter.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>
  #include "CrossoverFilter.h"
  #include <array>

  /**
   * 6-band multiband splitter using 5 LR4 crossover filters.
   * Cascade approach:
   *   Band 1 = LP(XO1)
   *   Band 2 = HP(XO1) → LP(XO2) output
   *   Band 3 = HP(XO1) → HP(XO2) → LP(XO3) output
   *   ...
   *   Band 6 = HP(XO1) → HP(XO2) → HP(XO3) → HP(XO4) → HP(XO5) output
   */
  class MultibandSplitter
  {
  public:
      static constexpr int kNumBands = 6;
      static constexpr int kNumXO    = 5;

      MultibandSplitter();

      void prepare(double sampleRate, int maxBlockSize);

      /**
       * Set all 5 crossover frequencies. Each is clamped to [40, 18000].
       * Ordering enforced: xo[N] >= xo[N-1] + 50 (clamp-the-mover: later args
       * are clamped to stay above their predecessor + 50 Hz).
       */
      void setCrossovers(float xo1, float xo2, float xo3, float xo4, float xo5);

      /** Get current crossover frequencies as an array of 5 values. */
      std::array<float, kNumXO> getCrossovers() const;

      int getNumBands() const { return kNumBands; }

      /**
       * Split input into 6 band buffers.
       * All buffers must be stereo (2ch) with the same sample count as input.
       */
      void process(const juce::AudioBuffer<float>& input,
                   std::array<juce::AudioBuffer<float>, kNumBands>& bands);

  private:
      std::array<CrossoverFilter, kNumXO> crossovers;
      // Intermediate HP pass-through buffers: index N holds the HP remainder
      // after crossover N. We reuse two ping-pong buffers to avoid allocations.
      juce::AudioBuffer<float> hp[kNumXO]; // hp[i] = HP output of crossover i+1
      int blockSize = 512;
  };
  ```

- [ ] **Write `Source/dsp/MultibandSplitter.cpp`**

  ```cpp
  #include "MultibandSplitter.h"

  static constexpr float kMinXO    = 40.0f;
  static constexpr float kMaxXO    = 18000.0f;
  static constexpr float kMinSpacing = 50.0f;

  MultibandSplitter::MultibandSplitter() {}

  void MultibandSplitter::prepare(double sampleRate, int maxBlockSize)
  {
      blockSize = maxBlockSize;
      for (auto& xo : crossovers)
          xo.prepare(sampleRate, maxBlockSize);
      for (auto& buf : hp)
          buf.setSize(2, maxBlockSize);
  }

  void MultibandSplitter::setCrossovers(float xo1, float xo2, float xo3, float xo4, float xo5)
  {
      // Clamp each to valid range, then enforce ordering (clamp-the-mover)
      float freqs[kNumXO] = { xo1, xo2, xo3, xo4, xo5 };
      for (int i = 0; i < kNumXO; ++i)
          freqs[i] = juce::jlimit(kMinXO, kMaxXO, freqs[i]);

      // Clamp-the-mover: each frequency is clamped independently to valid bounds.
      // Neighbors are NOT pushed — the moved value stops at its limit.
      // This matches spec §3.6: "dragged handle stops at its limit, neighbors never move."
      // For a bulk set (all 5 freqs), clamp in order: forward pass only.
      for (int i = 0; i < kNumXO; ++i)
      {
          float lo = (i > 0) ? freqs[i-1] + kMinSpacing : kMinXO;
          float hi = (i < kNumXO-1) ? freqs[i+1] - kMinSpacing : kMaxXO;
          // hi may be < lo if already-clamped neighbors are too close — clamp to lo in that case
          freqs[i] = juce::jlimit(lo, std::max(lo, hi), freqs[i]);
      }

      for (int i = 0; i < kNumXO; ++i)
          crossovers[i].setCutoff(freqs[i]);
  }

  std::array<float, MultibandSplitter::kNumXO> MultibandSplitter::getCrossovers() const
  {
      std::array<float, kNumXO> result;
      for (int i = 0; i < kNumXO; ++i)
          result[i] = crossovers[i].getCutoff();
      return result;
  }

  void MultibandSplitter::process(const juce::AudioBuffer<float>& input,
                                  std::array<juce::AudioBuffer<float>, kNumBands>& bands)
  {
      const int N = input.getNumSamples();

      // Resize HP scratch buffers if needed
      for (auto& buf : hp)
          if (buf.getNumSamples() < N) buf.setSize(2, N, false, false, true);

      // Cascade split:
      // crossovers[0]: input → bands[0] (LP), hp[0] (HP remainder)
      // crossovers[1]: hp[0] → bands[1] (LP), hp[1] (HP remainder)
      // ...
      // crossovers[4]: hp[3] → bands[4] (LP), bands[5] (HP = final band)
      const juce::AudioBuffer<float>* src = &input;
      for (int i = 0; i < kNumXO; ++i)
      {
          const bool isLast = (i == kNumXO - 1);
          juce::AudioBuffer<float>& lpDest = bands[i];
          juce::AudioBuffer<float>& hpDest = isLast ? bands[kNumBands - 1] : hp[i];
          crossovers[i].process(*src, lpDest, hpDest);
          src = &hp[i];
      }
  }
  ```

- [ ] **Run MultibandSplitter tests**

  ```bash
  cmake --build build --config Debug --target ScatterTests -- -quiet
  ./build/ScatterTests_artefacts/Debug/ScatterTests
  # Expected: All 3 test suites pass (CrossoverFilter, StereoImager, MultibandSplitter)
  ```

- [ ] **Commit**

  ```bash
  git add Source/dsp/MultibandSplitter.h Source/dsp/MultibandSplitter.cpp Tests/MultibandSplitterTests.cpp
  git commit -m "feat: implement MultibandSplitter 6-band cascade with tests"
  ```

---

## Chunk 3: PluginProcessor

**Goal:** `ScatterProcessor` wires APVTS parameters into the DSP pipeline. All 20 parameters registered, `processBlock` runs the full signal chain, state persists across DAW session save/reload.

### Background: JUCE APVTS

`AudioProcessorValueTreeState` (APVTS) is the JUCE way to manage plugin parameters. It:
- Registers parameters (float, bool) that the DAW can automate
- Provides thread-safe access from both UI thread and audio thread
- Handles XML state serialization via `copyState()` / `replaceState()`

Usage pattern:
```cpp
// In processor header:
juce::AudioProcessorValueTreeState apvts;

// In constructor, AFTER calling AudioProcessor base constructor:
apvts(*this, nullptr, "Scatter", createParameterLayout())

// Parameter access in processBlock (audio thread):
float w = apvts.getRawParameterValue("band_1_width")->load();
```

---

### Task 12: Add APVTS to PluginProcessor

- [ ] **Update `Source/PluginProcessor.h`**

  Replace the stub header with:

  ```cpp
  #pragma once
  #include <JuceHeader.h>
  #include "dsp/MultibandSplitter.h"
  #include "dsp/StereoImager.h"

  class ScatterProcessor : public juce::AudioProcessor
  {
  public:
      ScatterProcessor();
      ~ScatterProcessor() override = default;

      void prepareToPlay(double sampleRate, int samplesPerBlock) override;
      void releaseResources() override {}
      void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

      juce::AudioProcessorEditor* createEditor() override;
      bool hasEditor() const override { return true; }

      const juce::String getName() const override { return "Scatter"; }
      bool acceptsMidi() const override { return false; }
      bool producesMidi() const override { return false; }
      double getTailLengthSeconds() const override { return 0.0; }

      int getNumPrograms() override { return 1; }
      int getCurrentProgram() override { return 0; }
      void setCurrentProgram(int) override {}
      const juce::String getProgramName(int) override { return {}; }
      void changeProgramName(int, const juce::String&) override {}

      void getStateInformation(juce::MemoryBlock& destData) override;
      void setStateInformation(const void* data, int sizeInBytes) override;

      bool isBusesLayoutSupported(const BusesLayout& layouts) const override;

      juce::AudioProcessorValueTreeState apvts;

      // Solo state (not an APVTS parameter — runtime state only)
      uint8_t soloState { 0 }; // bit N = band N is soloed

  private:
      static juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout();

      MultibandSplitter splitter;
      std::array<StereoImager, 6> imagers;
      std::array<juce::AudioBuffer<float>, 6> bandBuffers;

      // SmoothedValue for each float parameter (13 total)
      juce::SmoothedValue<float> smoothInputGain;
      juce::SmoothedValue<float> smoothOutputGain;
      std::array<juce::SmoothedValue<float>, 6> smoothWidths;
      std::array<juce::SmoothedValue<float>, 5> smoothXOs;

      // Bypass fade state (global bypass click suppression)
      float bypassFade { 1.0f }; // 1.0 = fully active, 0.0 = fully bypassed
      bool  lastBypass  { false };

      void updateSmoothedValues();
  };
  ```

- [ ] **Update `Source/PluginProcessor.cpp`**

  ```cpp
  #include "PluginProcessor.h"
  #include "PluginEditor.h"

  // Default crossover frequencies (Hz)
  static constexpr float kDefaultXO[5] = { 150.f, 500.f, 2000.f, 5000.f, 10000.f };
  // Default band widths (percent)
  static constexpr float kDefaultWidth[6] = { 0.f, 15.f, 35.f, 60.f, 80.f, 100.f };

  static juce::AudioProcessorValueTreeState::ParameterLayout createLayout()
  {
      using namespace juce;
      std::vector<std::unique_ptr<RangedAudioParameter>> params;

      params.push_back(std::make_unique<AudioParameterFloat>(
          ParameterID { "input_gain", 1 }, "Input Gain",
          NormalisableRange<float>(-24.f, 24.f, 0.01f), 0.0f,
          AudioParameterFloatAttributes().withLabel("dB")));

      params.push_back(std::make_unique<AudioParameterFloat>(
          ParameterID { "output_gain", 1 }, "Output Gain",
          NormalisableRange<float>(-24.f, 24.f, 0.01f), 0.0f,
          AudioParameterFloatAttributes().withLabel("dB")));

      params.push_back(std::make_unique<AudioParameterBool>(
          ParameterID { "bypass", 1 }, "Bypass", false));

      for (int n = 1; n <= 6; ++n)
      {
          params.push_back(std::make_unique<AudioParameterFloat>(
              ParameterID { "band_" + String(n) + "_width", 1 },
              "Band " + String(n) + " Width",
              NormalisableRange<float>(0.f, 150.f, 0.1f),
              kDefaultWidth[n - 1],
              AudioParameterFloatAttributes().withLabel("%")));

          params.push_back(std::make_unique<AudioParameterBool>(
              ParameterID { "band_" + String(n) + "_bypass", 1 },
              "Band " + String(n) + " Bypass",
              false));
      }

      for (int n = 1; n <= 5; ++n)
      {
          params.push_back(std::make_unique<AudioParameterFloat>(
              ParameterID { "xo_" + String(n) + "_freq", 1 },
              "XO " + String(n) + " Freq",
              NormalisableRange<float>(40.f, 18000.f, 1.f, 0.4f),
              kDefaultXO[n - 1],
              AudioParameterFloatAttributes().withLabel("Hz")));
      }

      return { params.begin(), params.end() };
  }

  ScatterProcessor::ScatterProcessor()
      : AudioProcessor(BusesProperties()
            .withInput("Input",  juce::AudioChannelSet::stereo(), true)
            .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
        apvts(*this, nullptr, "Scatter", createLayout())
  {
      setLatencySamples(0);
  }

  bool ScatterProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
  {
      return layouts.getMainInputChannelSet()  == juce::AudioChannelSet::stereo()
          && layouts.getMainOutputChannelSet() == juce::AudioChannelSet::stereo();
  }

  void ScatterProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
  {
      juce::FloatVectorOperations::disableDenormalisedNumberSupport();

      splitter.prepare(sampleRate, samplesPerBlock);
      for (auto& buf : bandBuffers)
          buf.setSize(2, samplesPerBlock);

      // Initialise smoothed values (20ms ramp)
      const double rampSecs = 0.020;
      smoothInputGain.reset(sampleRate, rampSecs);
      smoothOutputGain.reset(sampleRate, rampSecs);
      for (auto& s : smoothWidths) s.reset(sampleRate, rampSecs);
      for (auto& s : smoothXOs)   s.reset(sampleRate, rampSecs);

      // Seed smoothed values from current parameter state
      smoothInputGain.setCurrentAndTargetValue(
          juce::Decibels::decibelsToGain(apvts.getRawParameterValue("input_gain")->load()));
      smoothOutputGain.setCurrentAndTargetValue(
          juce::Decibels::decibelsToGain(apvts.getRawParameterValue("output_gain")->load()));
      for (int n = 0; n < 6; ++n)
          smoothWidths[n].setCurrentAndTargetValue(
              apvts.getRawParameterValue("band_" + juce::String(n+1) + "_width")->load() / 100.f);
      for (int n = 0; n < 5; ++n)
          smoothXOs[n].setCurrentAndTargetValue(
              apvts.getRawParameterValue("xo_" + juce::String(n+1) + "_freq")->load());

      // Apply initial crossovers to splitter
      auto xo = splitter.getCrossovers();
      for (int i = 0; i < 5; ++i) xo[i] = smoothXOs[i].getCurrentValue();
      splitter.setCrossovers(xo[0], xo[1], xo[2], xo[3], xo[4]);
  }

  void ScatterProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&)
  {
      juce::ScopedNoDenormals noDenormals;

      const int N = buffer.getNumSamples();

      // ── Global bypass ────────────────────────────────────────────────────
      const bool bypass = *apvts.getRawParameterValue("bypass") > 0.5f;
      if (bypass != lastBypass)
      {
          lastBypass = bypass;
          // bypassFade will ramp over next processBlock calls
      }

      if (bypass && bypassFade <= 0.0f)
          return; // true bypass: do nothing (buffer already has input)

      // ── Update smoothed targets ──────────────────────────────────────────
      smoothInputGain.setTargetValue(
          juce::Decibels::decibelsToGain(apvts.getRawParameterValue("input_gain")->load()));
      smoothOutputGain.setTargetValue(
          juce::Decibels::decibelsToGain(apvts.getRawParameterValue("output_gain")->load()));
      for (int n = 0; n < 6; ++n)
          smoothWidths[n].setTargetValue(
              apvts.getRawParameterValue("band_" + juce::String(n+1) + "_width")->load() / 100.f);
      for (int n = 0; n < 5; ++n)
          smoothXOs[n].setTargetValue(
              apvts.getRawParameterValue("xo_" + juce::String(n+1) + "_freq")->load());

      // ── Update crossovers if changed ─────────────────────────────────────
      auto xo = splitter.getCrossovers();
      bool xoChanged = false;
      for (int i = 0; i < 5; ++i)
      {
          // Advance smoother by full block and read end-of-block value.
          // (Per-sample coefficient updates are too expensive for biquad filters.)
          float next = smoothXOs[i].skip(N);
          if (std::abs(next - xo[i]) > 0.5f) { xo[i] = next; xoChanged = true; }
      }
      if (xoChanged)
          splitter.setCrossovers(xo[0], xo[1], xo[2], xo[3], xo[4]);

      // ── Determine solo mask ──────────────────────────────────────────────
      const bool anySolo = soloState != 0;

      // ── Resize band buffers if needed ────────────────────────────────────
      for (auto& buf : bandBuffers)
          if (buf.getNumSamples() < N) buf.setSize(2, N, false, false, true);

      // ── Apply input gain (per sample with smoothing) ─────────────────────
      for (int i = 0; i < N; ++i)
      {
          float g = smoothInputGain.getNextValue();
          buffer.setSample(0, i, buffer.getSample(0, i) * g);
          buffer.setSample(1, i, buffer.getSample(1, i) * g);
      }

      // ── Split into 6 bands ───────────────────────────────────────────────
      splitter.process(buffer, bandBuffers);

      // ── Apply M/S width per band, respecting bypass and solo ─────────────
      buffer.clear();

      for (int n = 0; n < 6; ++n)
      {
          const bool bandBypassed = *apvts.getRawParameterValue("band_" + juce::String(n+1) + "_bypass") > 0.5f;
          const bool bandSoloed   = anySolo && ((soloState >> n) & 1);

          // Solo + bypass: bypass wins (silence)
          // If solo is active and this band is not soloed: silence
          if (bandBypassed || (anySolo && !bandSoloed))
              continue; // band contributes nothing

          // Apply M/S width (per-sample smoothed via StereoImager::process).
          // Width target was already set in the global update block above.
          // process() is called ONCE per band — it handles both channels internally.
          imagers[n].setWidth(smoothWidths[n].skip(N));
          imagers[n].process(bandBuffers[n], bandBuffers[n]); // in-place, both channels

          // Sum this band into output
          for (int ch = 0; ch < 2; ++ch)
              buffer.addFrom(ch, 0, bandBuffers[n], ch, 0, N);
      }

      // ── Apply output gain ────────────────────────────────────────────────
      for (int i = 0; i < N; ++i)
      {
          float g = smoothOutputGain.getNextValue();
          buffer.setSample(0, i, buffer.getSample(0, i) * g);
          buffer.setSample(1, i, buffer.getSample(1, i) * g);
      }
  }

  juce::AudioProcessorEditor* ScatterProcessor::createEditor()
  {
      return new juce::GenericAudioProcessorEditor(*this); // placeholder until UI is built
  }

  void ScatterProcessor::getStateInformation(juce::MemoryBlock& destData)
  {
      auto state = apvts.copyState();
      state.setProperty("soloState", (int)soloState, nullptr);
      std::unique_ptr<juce::XmlElement> xml(state.createXml());
      copyXmlToBinary(*xml, destData);
  }

  void ScatterProcessor::setStateInformation(const void* data, int sizeInBytes)
  {
      std::unique_ptr<juce::XmlElement> xml(getXmlFromBinary(data, sizeInBytes));
      if (xml && xml->hasTagName(apvts.state.getType()))
      {
          auto state = juce::ValueTree::fromXml(*xml);
          soloState = static_cast<uint8_t>((int)state.getProperty("soloState", 0));
          apvts.replaceState(state);
      }
  }

  juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
  {
      return new ScatterProcessor();
  }
  ```

- [ ] **Build plugin to confirm it compiles**

  ```bash
  cmake --build build --config Debug --target Scatter_AU Scatter_VST3 -- -quiet
  # Expected: Build succeeded with 0 errors
  ```

  > If you see linker errors about duplicate `createPluginFilter`, you have two `.cpp` files defining it — remove the one in the stub.

- [ ] **Smoke test in Logic Pro**

  1. Open Logic Pro
  2. Create an audio track with a signal
  3. Add an AU plugin → "Scatter" (may need to re-scan AU)
  4. Verify the generic parameter editor appears, knobs respond
  5. Save the session, reopen — parameters should restore

- [ ] **Commit**

  ```bash
  git add Source/PluginProcessor.h Source/PluginProcessor.cpp Source/PluginEditor.h Source/PluginEditor.cpp
  git commit -m "feat: wire APVTS, MultibandSplitter, StereoImager in processBlock"
  ```

---

## Chunk 4: UI Foundation

**Goal:** `ScatterLookAndFeel`, `HeaderBar`, and `FooterBar` implemented. The editor uses the real layout (placeholder content, correct colors and geometry).

### Background: JUCE UI primer

- All UI components extend `juce::Component`
- `paint(juce::Graphics& g)` draws the component using JUCE's 2D graphics API
- `resized()` sets child component bounds (called on resize and initially)
- `juce::LookAndFeel_V4` is subclassed to customize rendering of sliders, buttons, labels
- Colors are `juce::Colour(0xffrrggbb)` — always fully opaque unless specified

---

### Task 13: `ScatterLookAndFeel`

- [ ] **Write `Source/ui/LookAndFeel.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>

  /**
   * Flat dark theme for Scatter.
   * Override default JUCE LookAndFeel rendering with brand colors and clean typography.
   */
  class ScatterLookAndFeel : public juce::LookAndFeel_V4
  {
  public:
      ScatterLookAndFeel();

      // ── Colors ──────────────────────────────────────────────────────────
      static juce::Colour background()    { return juce::Colour(0xff111114); }
      static juce::Colour surface()       { return juce::Colour(0xff1a1a20); }
      static juce::Colour border()        { return juce::Colour(0xff2a2a32); }
      static juce::Colour textPrimary()   { return juce::Colour(0xffe8e8f0); }
      static juce::Colour textSecondary() { return juce::Colour(0xff666678); }
      static juce::Colour accent()        { return juce::Colour(0xff6366f1); }
      static juce::Colour bypassColor()   { return juce::Colour(0xff444455); }
      static juce::Colour soloColor()     { return juce::Colour(0xfff4b400); }

      // Band colors (6 bands)
      static juce::Colour bandColor(int band); // band 0..5

      // ── Custom slider rendering ──────────────────────────────────────────
      void drawLinearSlider(juce::Graphics&, int x, int y, int w, int h,
                            float sliderPos, float minSliderPos, float maxSliderPos,
                            juce::Slider::SliderStyle, juce::Slider&) override;

      // ── Custom button rendering ──────────────────────────────────────────
      void drawButtonBackground(juce::Graphics&, juce::Button&,
                                const juce::Colour& backgroundColour,
                                bool isHighlighted, bool isDown) override;

      void drawButtonText(juce::Graphics&, juce::TextButton&,
                          bool isHighlighted, bool isDown) override;
  };
  ```

- [ ] **Write `Source/ui/LookAndFeel.cpp`**

  ```cpp
  #include "LookAndFeel.h"

  static const juce::Colour kBandColors[6] = {
      juce::Colour(0xff6366f1), // Band 1 indigo
      juce::Colour(0xff8b5cf6), // Band 2 violet
      juce::Colour(0xffec4899), // Band 3 pink
      juce::Colour(0xfff97316), // Band 4 orange
      juce::Colour(0xffeab308), // Band 5 yellow
      juce::Colour(0xff22d3ee), // Band 6 cyan
  };

  ScatterLookAndFeel::ScatterLookAndFeel()
  {
      setColour(juce::ResizableWindow::backgroundColourId, background());
      setColour(juce::Slider::backgroundColourId,          surface());
      setColour(juce::Slider::thumbColourId,               accent());
      setColour(juce::Slider::trackColourId,               accent().withAlpha(0.4f));
      setColour(juce::Label::textColourId,                 textPrimary());
      setColour(juce::TextButton::buttonColourId,          surface());
      setColour(juce::TextButton::textColourOnId,          textPrimary());
      setColour(juce::TextButton::textColourOffId,         textSecondary());
  }

  juce::Colour ScatterLookAndFeel::bandColor(int band)
  {
      return kBandColors[juce::jlimit(0, 5, band)];
  }

  void ScatterLookAndFeel::drawLinearSlider(juce::Graphics& g,
                                          int x, int y, int w, int h,
                                          float sliderPos,
                                          float /*minSliderPos*/, float /*maxSliderPos*/,
                                          juce::Slider::SliderStyle style, juce::Slider& slider)
  {
      if (style != juce::Slider::LinearVertical) {
          LookAndFeel_V4::drawLinearSlider(g, x, y, w, h, sliderPos, 0, 1, style, slider);
          return;
      }

      const float trackW   = 4.0f;
      const float trackX   = x + w * 0.5f - trackW * 0.5f;
      const float thumbH   = 12.0f;
      const float thumbW   = 18.0f;

      // Track background
      g.setColour(surface());
      g.fillRoundedRectangle(trackX, (float)y, trackW, (float)h, 2.0f);

      // Track filled (below thumb)
      g.setColour(accent().withAlpha(0.5f));
      g.fillRoundedRectangle(trackX, sliderPos, trackW, (float)(y + h) - sliderPos, 2.0f);

      // Thumb
      g.setColour(accent());
      g.fillRoundedRectangle(x + w * 0.5f - thumbW * 0.5f, sliderPos - thumbH * 0.5f,
                             thumbW, thumbH, 3.0f);
  }

  void ScatterLookAndFeel::drawButtonBackground(juce::Graphics& g, juce::Button& button,
                                              const juce::Colour& /*bg*/,
                                              bool isHighlighted, bool isDown)
  {
      auto bounds = button.getLocalBounds().toFloat().reduced(0.5f);
      juce::Colour c = button.getToggleState() ? accent() : surface();
      if (isDown) c = c.darker(0.2f);
      if (isHighlighted) c = c.brighter(0.05f);
      g.setColour(c);
      g.fillRoundedRectangle(bounds, 3.0f);
      g.setColour(border());
      g.drawRoundedRectangle(bounds, 3.0f, 1.0f);
  }

  void ScatterLookAndFeel::drawButtonText(juce::Graphics& g, juce::TextButton& button,
                                        bool /*isHighlighted*/, bool /*isDown*/)
  {
      g.setFont(juce::Font(juce::FontOptions().withName("SF Mono").withHeight(9.0f)));
      g.setColour(button.getToggleState() ? juce::Colours::white : ScatterLookAndFeel::textSecondary());
      g.drawFittedText(button.getButtonText(), button.getLocalBounds(),
                       juce::Justification::centred, 1);
  }
  ```

- [ ] **Build to confirm no errors**

  ```bash
  cmake --build build --config Debug --target Scatter_AU -- -quiet
  # Expected: 0 errors
  ```

---

### Task 14: `HeaderBar`

- [ ] **Write `Source/ui/HeaderBar.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>
  #include "LookAndFeel.h"

  class ScatterProcessor;

  /**
   * Top bar: "sheep imager" name, IN/OUT gain sliders, global bypass toggle.
   * Height: 40px.
   */
  class HeaderBar : public juce::Component
  {
  public:
      explicit HeaderBar(ScatterProcessor& processor);
      ~HeaderBar() override;

      void paint(juce::Graphics&) override;
      void resized() override;

  private:
      ScatterProcessor& processor;

      juce::Label     titleLabel;
      juce::Slider    inputGainSlider;
      juce::Slider    outputGainSlider;
      juce::Label     inLabel, outLabel;
      juce::ToggleButton bypassButton { "BYP" };

      std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> inputGainAttachment;
      std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> outputGainAttachment;
      std::unique_ptr<juce::AudioProcessorValueTreeState::ButtonAttachment> bypassAttachment;
  };
  ```

- [ ] **Write `Source/ui/HeaderBar.cpp`**

  ```cpp
  #include "HeaderBar.h"
  #include "../PluginProcessor.h"

  HeaderBar::HeaderBar(ScatterProcessor& p) : processor(p)
  {
      // Title
      titleLabel.setText("sheep imager", juce::dontSendNotification);
      titleLabel.setFont(juce::Font(juce::FontOptions().withName("SF Mono").withHeight(14.0f)));
      titleLabel.setColour(juce::Label::textColourId, ScatterLookAndFeel::textPrimary());
      addAndMakeVisible(titleLabel);

      // IN label
      inLabel.setText("IN", juce::dontSendNotification);
      inLabel.setFont(juce::Font(juce::FontOptions().withName("SF Mono").withHeight(9.0f)));
      inLabel.setColour(juce::Label::textColourId, ScatterLookAndFeel::textSecondary());
      inLabel.setJustificationType(juce::Justification::centredRight);
      addAndMakeVisible(inLabel);

      // Input gain slider
      inputGainSlider.setSliderStyle(juce::Slider::LinearHorizontal);
      inputGainSlider.setTextBoxStyle(juce::Slider::TextBoxRight, false, 55, 18);
      inputGainSlider.setTextValueSuffix(" dB");
      addAndMakeVisible(inputGainSlider);

      // OUT label
      outLabel.setText("OUT", juce::dontSendNotification);
      outLabel.setFont(juce::Font(juce::FontOptions().withName("SF Mono").withHeight(9.0f)));
      outLabel.setColour(juce::Label::textColourId, ScatterLookAndFeel::textSecondary());
      outLabel.setJustificationType(juce::Justification::centredRight);
      addAndMakeVisible(outLabel);

      // Output gain slider
      outputGainSlider.setSliderStyle(juce::Slider::LinearHorizontal);
      outputGainSlider.setTextBoxStyle(juce::Slider::TextBoxRight, false, 55, 18);
      outputGainSlider.setTextValueSuffix(" dB");
      addAndMakeVisible(outputGainSlider);

      // Bypass button
      bypassButton.setClickingTogglesState(true);
      addAndMakeVisible(bypassButton);

      // APVTS attachments (two-way sync between slider/button and parameter)
      inputGainAttachment  = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
          p.apvts, "input_gain", inputGainSlider);
      outputGainAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
          p.apvts, "output_gain", outputGainSlider);
      bypassAttachment     = std::make_unique<juce::AudioProcessorValueTreeState::ButtonAttachment>(
          p.apvts, "bypass", bypassButton);
  }

  HeaderBar::~HeaderBar() = default;

  void HeaderBar::paint(juce::Graphics& g)
  {
      g.fillAll(ScatterLookAndFeel::surface());
      // Bottom divider line
      g.setColour(ScatterLookAndFeel::border());
      g.fillRect(0, getHeight() - 1, getWidth(), 1);
  }

  void HeaderBar::resized()
  {
      auto area = getLocalBounds().reduced(8, 0);

      titleLabel.setBounds(area.removeFromLeft(130));
      bypassButton.setBounds(area.removeFromRight(44).reduced(0, 10));
      area.removeFromRight(8);

      auto gainArea = area;
      auto inArea   = gainArea.removeFromLeft(gainArea.getWidth() / 2);
      auto outArea  = gainArea;

      inLabel.setBounds(inArea.removeFromLeft(22));
      inputGainSlider.setBounds(inArea);

      outLabel.setBounds(outArea.removeFromLeft(26));
      outputGainSlider.setBounds(outArea);
  }
  ```

---

### Task 15: `FooterBar`

- [ ] **Write `Source/ui/FooterBar.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>

  /** Bottom bar: thin separator + sheep logo bottom-right. Height: 28px. */
  class FooterBar : public juce::Component
  {
  public:
      FooterBar();
      void paint(juce::Graphics&) override;
      void resized() override;

  private:
      juce::Label versionLabel;
  };
  ```

- [ ] **Write `Source/ui/FooterBar.cpp`**

  ```cpp
  #include "FooterBar.h"
  #include "LookAndFeel.h"

  FooterBar::FooterBar()
  {
      versionLabel.setText("v1.0.0  electric sheep supply co.", juce::dontSendNotification);
      versionLabel.setFont(juce::Font(juce::FontOptions().withName("SF Mono").withHeight(9.0f)));
      versionLabel.setColour(juce::Label::textColourId, ScatterLookAndFeel::textSecondary());
      addAndMakeVisible(versionLabel);
  }

  void FooterBar::paint(juce::Graphics& g)
  {
      g.fillAll(ScatterLookAndFeel::surface());
      g.setColour(ScatterLookAndFeel::border());
      g.fillRect(0, 0, getWidth(), 1); // top divider

      // Sheep logo (waveform bars) bottom-right at 24px height, opacity 0.4
      const int logoW = 32;
      const int logoH = 20;
      const int logoX = getWidth() - logoW - 8;
      const int logoY = (getHeight() - logoH) / 2;

      g.setColour(ScatterLookAndFeel::accent().withAlpha(0.4f));
      // Draw simplified waveform bars (matching sheep-logo.svg proportions)
      const int barW = 3;
      const int spacing = 1;
      const int numBars = 9;
      const float heights[9] = { 0.3f, 0.55f, 0.75f, 0.9f, 1.0f, 0.85f, 0.65f, 0.45f, 0.25f };
      for (int i = 0; i < numBars; ++i)
      {
          int bh = (int)(logoH * heights[i]);
          int bx = logoX + i * (barW + spacing);
          int by = logoY + logoH - bh;
          g.fillRoundedRectangle((float)bx, (float)by, (float)barW, (float)bh, 1.0f);
      }
  }

  void FooterBar::resized()
  {
      versionLabel.setBounds(8, 0, 300, getHeight());
  }
  ```

- [ ] **Build to confirm no errors**

  ```bash
  cmake --build build --config Debug --target Scatter_AU -- -quiet
  # Expected: 0 errors
  ```

- [ ] **Commit**

  ```bash
  git add Source/ui/
  git commit -m "feat: implement LookAndFeel, HeaderBar, FooterBar"
  ```

---

## Chunk 5: UI Components

**Goal:** `BandStrip` and `FrequencyDisplay` implemented. `PluginEditor` uses real layout with all components wired to APVTS.

---

### Task 16: `BandStrip`

Each strip shows one band's width slider, bypass, solo, and frequency range label.

- [ ] **Write `Source/ui/BandStrip.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>
  #include "LookAndFeel.h"

  class ScatterProcessor;

  /**
   * Per-band column: bypass toggle, solo button, vertical width slider, value label,
   * and a live frequency range label that updates as crossovers move.
   */
  class BandStrip : public juce::Component
  {
  public:
      /**
       * @param bandIndex  0..5
       * @param processor  For accessing APVTS and soloState
       */
      BandStrip(int bandIndex, ScatterProcessor& processor);
      ~BandStrip() override;

      void paint(juce::Graphics&) override;
      void resized() override;

      /** Update the displayed frequency range. Called by PluginEditor when XOs change. */
      void setFrequencyRange(float lowHz, float highHz);

      /** Sync solo button state from processor.soloState bitmask. Called by PluginEditor timer. */
      void syncSoloState();

  private:
      juce::String formatHz(float hz) const;

      int bandIndex;
      ScatterProcessor& processor;

      juce::String bandNames[6] = { "Sub/Low", "Low-Mid", "Mid", "Upper-Mid", "High", "Air" };

      juce::Label     nameLabel;
      juce::Label     rangeLabel;
      juce::Slider    widthSlider;
      juce::Label     widthValueLabel;
      juce::ToggleButton bypassBtn { "BYP" };
      juce::TextButton   soloBtn   { "SOLO" };

      float lowHz  = 20.0f;
      float highHz = 20000.0f;

      std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> widthAttachment;
      std::unique_ptr<juce::AudioProcessorValueTreeState::ButtonAttachment> bypassAttachment;
  };
  ```

- [ ] **Write `Source/ui/BandStrip.cpp`**

  ```cpp
  #include "BandStrip.h"
  #include "../PluginProcessor.h"

  BandStrip::BandStrip(int index, ScatterProcessor& p)
      : bandIndex(index), processor(p)
  {
      const juce::String n = juce::String(index + 1);

      // Band name
      nameLabel.setText(bandNames[index], juce::dontSendNotification);
      nameLabel.setFont(juce::Font(juce::FontOptions().withName("SF Mono").withHeight(9.0f)));
      nameLabel.setColour(juce::Label::textColourId, ScatterLookAndFeel::textSecondary());
      nameLabel.setJustificationType(juce::Justification::centred);
      addAndMakeVisible(nameLabel);

      // Frequency range
      rangeLabel.setFont(juce::Font(juce::FontOptions().withName("SF Mono").withHeight(8.0f)));
      rangeLabel.setColour(juce::Label::textColourId, ScatterLookAndFeel::textSecondary());
      rangeLabel.setJustificationType(juce::Justification::centred);
      addAndMakeVisible(rangeLabel);

      // Bypass
      bypassBtn.setClickingTogglesState(true);
      addAndMakeVisible(bypassBtn);

      // Solo
      soloBtn.setClickingTogglesState(true);
      soloBtn.onClick = [this]
      {
          uint8_t mask = 1 << bandIndex;
          if (soloBtn.getToggleState())
              processor.soloState |=  mask;
          else
              processor.soloState &= ~mask;
      };
      addAndMakeVisible(soloBtn);

      // Width slider
      widthSlider.setSliderStyle(juce::Slider::LinearVertical);
      widthSlider.setTextBoxStyle(juce::Slider::NoTextBox, false, 0, 0);
      widthSlider.setColour(juce::Slider::thumbColourId, ScatterLookAndFeel::bandColor(index));
      widthSlider.setColour(juce::Slider::trackColourId, ScatterLookAndFeel::bandColor(index).withAlpha(0.4f));
      addAndMakeVisible(widthSlider);

      // Width value label
      widthValueLabel.setFont(juce::Font(juce::FontOptions().withName("SF Mono").withHeight(11.0f)));
      widthValueLabel.setColour(juce::Label::textColourId, ScatterLookAndFeel::textPrimary());
      widthValueLabel.setJustificationType(juce::Justification::centred);
      addAndMakeVisible(widthValueLabel);

      // APVTS attachments
      widthAttachment  = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(
          p.apvts, "band_" + n + "_width", widthSlider);
      bypassAttachment = std::make_unique<juce::AudioProcessorValueTreeState::ButtonAttachment>(
          p.apvts, "band_" + n + "_bypass", bypassBtn);

      widthSlider.onValueChange = [this]
      {
          widthValueLabel.setText(juce::String((int)widthSlider.getValue()) + "%",
                                  juce::dontSendNotification);
      };

  }

  BandStrip::~BandStrip() = default;

  void BandStrip::syncSoloState()
  {
      bool shouldBeSoloed = ((processor.soloState >> bandIndex) & 1) != 0;
      if (soloBtn.getToggleState() != shouldBeSoloed)
          soloBtn.setToggleState(shouldBeSoloed, juce::dontSendNotification);
  }

  void BandStrip::setFrequencyRange(float low, float high)
  {
      lowHz  = low;
      highHz = high;
      rangeLabel.setText(formatHz(low) + "–" + formatHz(high), juce::dontSendNotification);
  }

  juce::String BandStrip::formatHz(float hz) const
  {
      if (hz >= 1000.0f) return juce::String(hz / 1000.0f, 1) + "k";
      return juce::String((int)hz);
  }

  void BandStrip::paint(juce::Graphics& g)
  {
      // Right border divider
      g.setColour(ScatterLookAndFeel::border());
      g.fillRect(getWidth() - 1, 0, 1, getHeight());

      // Dim if bypassed
      if (bypassBtn.getToggleState())
          g.fillAll(ScatterLookAndFeel::background().withAlpha(0.5f));
  }

  void BandStrip::resized()
  {
      auto area = getLocalBounds().reduced(4, 4);

      nameLabel.setBounds(area.removeFromTop(16));
      rangeLabel.setBounds(area.removeFromTop(12));
      bypassBtn.setBounds(area.removeFromTop(20).reduced(2, 0));
      soloBtn.setBounds(area.removeFromTop(20).reduced(2, 0));
      area.removeFromTop(4);
      widthValueLabel.setBounds(area.removeFromBottom(16));
      widthSlider.setBounds(area);

      // Seed the value label
      widthValueLabel.setText(juce::String((int)widthSlider.getValue()) + "%",
                              juce::dontSendNotification);
  }
  ```

---

### Task 17: `FrequencyDisplay`

The frequency display draws 6 colored band rectangles and 5 draggable crossover handles.

- [ ] **Write `Source/ui/FrequencyDisplay.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>
  #include "LookAndFeel.h"

  class ScatterProcessor;

  /**
   * 2D visualization of the 6-band stereo field.
   * X axis = frequency (log scale, 20Hz–20kHz)
   * Y axis = stereo width (0% at bottom, 150% at top)
   *
   * Band rectangles are read-only (reflect current widths).
   * Crossover handles are draggable (write to APVTS xo_N_freq parameters).
   */
  class FrequencyDisplay : public juce::Component
  {
  public:
      explicit FrequencyDisplay(ScatterProcessor& processor);
      ~FrequencyDisplay() override = default;

      void paint(juce::Graphics&) override;
      void resized() override;

      void mouseDown(const juce::MouseEvent&) override;
      void mouseDrag(const juce::MouseEvent&) override;
      void mouseUp(const juce::MouseEvent&) override;
      void mouseMove(const juce::MouseEvent&) override;

  private:
      // Convert frequency (Hz) → X pixel position (log scale)
      float freqToX(float hz) const;
      // Convert X pixel → frequency (Hz)
      float xToFreq(float x) const;
      // Convert width% → Y pixel (0% at bottom)
      float widthToY(float widthPct) const;

      // Find which crossover handle (0..4) is nearest to x, within a grab radius
      int hitTestHandle(float x) const;

      ScatterProcessor& processor;

      int draggingHandle = -1;   // index of handle being dragged, -1 if none
      int hoveredHandle  = -1;   // index of hovered handle for tooltip

      static constexpr float kMinFreq = 20.0f;
      static constexpr float kMaxFreq = 20000.0f;
      static constexpr float kMaxWidth = 150.0f;
      static constexpr float kHandleRadius = 6.0f;
      static constexpr float kGrabRadius   = 10.0f;
  };
  ```

- [ ] **Write `Source/ui/FrequencyDisplay.cpp`**

  ```cpp
  #include "FrequencyDisplay.h"
  #include "../PluginProcessor.h"
  #include <cmath>

  FrequencyDisplay::FrequencyDisplay(ScatterProcessor& p) : processor(p)
  {
      setMouseCursor(juce::MouseCursor::NormalCursor);
  }

  float FrequencyDisplay::freqToX(float hz) const
  {
      // Log scale: 20Hz → 0, 20kHz → width
      float logMin = std::log10(kMinFreq);
      float logMax = std::log10(kMaxFreq);
      float t = (std::log10(juce::jmax(hz, kMinFreq)) - logMin) / (logMax - logMin);
      return t * (float)getWidth();
  }

  float FrequencyDisplay::xToFreq(float x) const
  {
      float logMin = std::log10(kMinFreq);
      float logMax = std::log10(kMaxFreq);
      float t = juce::jlimit(0.0f, 1.0f, x / (float)getWidth());
      return std::pow(10.0f, logMin + t * (logMax - logMin));
  }

  float FrequencyDisplay::widthToY(float widthPct) const
  {
      // 0% at bottom, kMaxWidth at top
      float t = widthPct / kMaxWidth;
      return (float)getHeight() * (1.0f - t);
  }

  int FrequencyDisplay::hitTestHandle(float x) const
  {
      for (int i = 0; i < 5; ++i)
      {
          float xoHz = processor.apvts.getRawParameterValue("xo_" + juce::String(i+1) + "_freq")->load();
          float hx   = freqToX(xoHz);
          if (std::abs(x - hx) <= kGrabRadius)
              return i;
      }
      return -1;
  }

  void FrequencyDisplay::paint(juce::Graphics& g)
  {
      auto bounds = getLocalBounds().toFloat();

      // Background
      g.setColour(ScatterLookAndFeel::background());
      g.fillRect(bounds);

      // Gather current crossover positions and widths
      float xoHz[5];
      for (int i = 0; i < 5; ++i)
          xoHz[i] = processor.apvts.getRawParameterValue("xo_" + juce::String(i+1) + "_freq")->load();

      float widths[6];
      for (int n = 0; n < 6; ++n)
          widths[n] = processor.apvts.getRawParameterValue("band_" + juce::String(n+1) + "_width")->load();

      // Band left/right edges in pixels
      float bandLeft[6]  = { 0.0f, freqToX(xoHz[0]), freqToX(xoHz[1]),
                              freqToX(xoHz[2]), freqToX(xoHz[3]), freqToX(xoHz[4]) };
      float bandRight[6] = { freqToX(xoHz[0]), freqToX(xoHz[1]), freqToX(xoHz[2]),
                              freqToX(xoHz[3]), freqToX(xoHz[4]), (float)getWidth() };

      // Draw band rectangles
      for (int n = 0; n < 6; ++n)
      {
          float topY    = widthToY(widths[n]);
          float bottomY = (float)getHeight();
          float x = bandLeft[n];
          float w = bandRight[n] - x;

          bool bypassed = *processor.apvts.getRawParameterValue("band_" + juce::String(n+1) + "_bypass") > 0.5f;
          float alpha = bypassed ? 0.1f : 0.25f;

          g.setColour(ScatterLookAndFeel::bandColor(n).withAlpha(alpha));
          g.fillRect(x, topY, w, bottomY - topY);

          // Top edge line
          g.setColour(ScatterLookAndFeel::bandColor(n).withAlpha(bypassed ? 0.2f : 0.7f));
          g.drawLine(x, topY, x + w, topY, 1.5f);
      }

      // Reference line at 100% width
      float y100 = widthToY(100.0f);
      g.setColour(ScatterLookAndFeel::textSecondary().withAlpha(0.3f));
      const float dashPattern[] = { 4.0f, 4.0f };
      g.drawDashedLine(juce::Line<float>(0.0f, y100, (float)getWidth(), y100),
                       dashPattern, 2, 0.5f, 0);

      // Crossover handles
      for (int i = 0; i < 5; ++i)
      {
          float hx = freqToX(xoHz[i]);
          bool isHovered  = (hoveredHandle  == i);
          bool isDragging = (draggingHandle == i);

          // Vertical line
          g.setColour(ScatterLookAndFeel::textSecondary().withAlpha(isDragging ? 0.9f : (isHovered ? 0.6f : 0.35f)));
          g.drawLine(hx, 0, hx, (float)getHeight(), 1.0f);

          // Handle circle at bottom
          g.setColour(isDragging ? ScatterLookAndFeel::accent()
                      : isHovered ? ScatterLookAndFeel::textPrimary()
                                  : ScatterLookAndFeel::textSecondary());
          g.fillEllipse(hx - kHandleRadius, (float)getHeight() - kHandleRadius * 2,
                        kHandleRadius * 2, kHandleRadius * 2);

          // Tooltip: Hz value when hovered or dragging
          if (isHovered || isDragging)
          {
              juce::String label = xoHz[i] >= 1000.0f
                  ? juce::String(xoHz[i] / 1000.0f, 1) + " kHz"
                  : juce::String((int)xoHz[i]) + " Hz";
              g.setFont(juce::Font(juce::FontOptions().withName("SF Mono").withHeight(9.0f)));
              g.setColour(ScatterLookAndFeel::textPrimary());
              g.drawText(label, (int)hx - 24, (int)getHeight() - 28, 50, 12,
                         juce::Justification::centred);
          }
      }

      // Border
      g.setColour(ScatterLookAndFeel::border());
      g.drawRect(bounds, 1.0f);
  }

  void FrequencyDisplay::resized() {}

  void FrequencyDisplay::mouseDown(const juce::MouseEvent& e)
  {
      draggingHandle = hitTestHandle((float)e.x);
      if (draggingHandle >= 0)
      {
          auto* param = processor.apvts.getParameter("xo_" + juce::String(draggingHandle + 1) + "_freq");
          if (param) param->beginChangeGesture();
      }
  }

  void FrequencyDisplay::mouseDrag(const juce::MouseEvent& e)
  {
      if (draggingHandle < 0) return;
      float hz = xToFreq((float)e.x);
      auto* param = processor.apvts.getParameter("xo_" + juce::String(draggingHandle + 1) + "_freq");
      if (param)
      {
          // Convert Hz to normalised value and set
          auto& range = processor.apvts.getParameterRange("xo_" + juce::String(draggingHandle + 1) + "_freq");
          float norm = range.convertTo0to1(hz);
          param->setValueNotifyingHost(norm);
      }
      repaint();
  }

  void FrequencyDisplay::mouseUp(const juce::MouseEvent&)
  {
      if (draggingHandle >= 0)
      {
          auto* param = processor.apvts.getParameter("xo_" + juce::String(draggingHandle + 1) + "_freq");
          if (param) param->endChangeGesture();
      }
      draggingHandle = -1;
      repaint();
  }

  void FrequencyDisplay::mouseMove(const juce::MouseEvent& e)
  {
      int newHover = hitTestHandle((float)e.x);
      if (newHover != hoveredHandle)
      {
          hoveredHandle = newHover;
          setMouseCursor(hoveredHandle >= 0 ? juce::MouseCursor::LeftRightResizeCursor
                                           : juce::MouseCursor::NormalCursor);
          repaint();
      }
  }
  ```

---

### Task 18: Wire `PluginEditor`

- [ ] **Replace `Source/PluginEditor.h`**

  ```cpp
  #pragma once
  #include <JuceHeader.h>
  #include "PluginProcessor.h"
  #include "ui/LookAndFeel.h"
  #include "ui/HeaderBar.h"
  #include "ui/FooterBar.h"
  #include "ui/BandStrip.h"
  #include "ui/FrequencyDisplay.h"

  class ScatterEditor : public juce::AudioProcessorEditor, private juce::Timer
  {
  public:
      explicit ScatterEditor(ScatterProcessor&);
      ~ScatterEditor() override;

      void paint(juce::Graphics&) override;
      void resized() override;

  private:
      void timerCallback() override;
      void updateBandRangeLabels();

      ScatterProcessor& processor;
      ScatterLookAndFeel laf;

      HeaderBar      headerBar;
      FrequencyDisplay freqDisplay;
      std::array<std::unique_ptr<BandStrip>, 6> bandStrips;
      FooterBar      footerBar;

      static constexpr int kHeaderH  = 40;
      static constexpr int kFreqH    = 160;  // 40+160+152+28 = 380 ✓
      static constexpr int kStripH   = 152;
      static constexpr int kFooterH  = 28;
  };
  ```

- [ ] **Replace `Source/PluginEditor.cpp`**

  ```cpp
  #include "PluginEditor.h"

  ScatterEditor::ScatterEditor(ScatterProcessor& p)
      : AudioProcessorEditor(&p), processor(p),
        headerBar(p), freqDisplay(p)
  {
      setLookAndFeel(&laf);
      setSize(600, kHeaderH + kFreqH + kStripH + kFooterH); // = 380 ✓

      addAndMakeVisible(headerBar);
      addAndMakeVisible(freqDisplay);

      for (int n = 0; n < 6; ++n)
      {
          bandStrips[n] = std::make_unique<BandStrip>(n, p);
          addAndMakeVisible(*bandStrips[n]);
      }

      addAndMakeVisible(footerBar);

      updateBandRangeLabels();
      startTimerHz(15); // refresh freq range labels as XOs move
  }

  ScatterEditor::~ScatterEditor()
  {
      stopTimer();
      setLookAndFeel(nullptr);
  }

  void ScatterEditor::paint(juce::Graphics& g)
  {
      g.fillAll(ScatterLookAndFeel::background());
  }

  void ScatterEditor::resized()
  {
      auto area = getLocalBounds();
      headerBar.setBounds(area.removeFromTop(kHeaderH));
      freqDisplay.setBounds(area.removeFromTop(kFreqH));
      footerBar.setBounds(area.removeFromBottom(kFooterH));

      // 6 equal-width band strips — last strip gets the remainder to avoid 1px gaps
      const int stripW = area.getWidth() / 6;
      for (int n = 0; n < 5; ++n)
          bandStrips[n]->setBounds(area.removeFromLeft(stripW));
      bandStrips[5]->setBounds(area); // remainder
  }

  void ScatterEditor::timerCallback()
  {
      updateBandRangeLabels();
      for (auto& strip : bandStrips)
          strip->syncSoloState();
      freqDisplay.repaint();
  }

  void ScatterEditor::updateBandRangeLabels()
  {
      float xoHz[5];
      for (int i = 0; i < 5; ++i)
          xoHz[i] = processor.apvts.getRawParameterValue("xo_" + juce::String(i+1) + "_freq")->load();

      const float edges[7] = { 20.f, xoHz[0], xoHz[1], xoHz[2], xoHz[3], xoHz[4], 20000.f };
      for (int n = 0; n < 6; ++n)
          bandStrips[n]->setFrequencyRange(edges[n], edges[n+1]);
  }
  ```

- [ ] **Update `PluginProcessor::createEditor`**

  In `PluginProcessor.cpp`, replace the generic editor line:
  ```cpp
  // BEFORE:
  return new juce::GenericAudioProcessorEditor(*this);

  // AFTER:
  return new ScatterEditor(*this);
  ```

- [ ] **Build and load in Logic Pro**

  ```bash
  cmake --build build --config Debug --target Scatter_AU -- -quiet
  ```

  Open Logic Pro, load Scatter on a track. Verify:
  - [ ] Window is 600×380px, dark background
  - [ ] Header shows "sheep imager", IN/OUT sliders, BYP button
  - [ ] Frequency display shows 6 colored bands and draggable crossover handles
  - [ ] 6 band strips with sliders, BYP, SOLO
  - [ ] Footer shows sheep logo bars bottom-right
  - [ ] Dragging a crossover handle updates band frequency labels
  - [ ] BYP dims its band strip and grays out band in frequency display
  - [ ] SOLO silences other bands (audible in audio)

- [ ] **Commit**

  ```bash
  git add Source/
  git commit -m "feat: implement full UI — BandStrip, FrequencyDisplay, PluginEditor"
  ```

---

## Chunk 6: Integration & Validation

**Goal:** AU passes `auval`, VST3 passes `pluginval`, state persistence verified, plugin ships.

---

### Task 19: Run AU validation

`auval` is Apple's official AU validator. It runs a battery of tests on the installed AU component.

- [ ] **Build Release and install**

  ```bash
  cmake --build build --config Release --target Scatter_AU Scatter_VST3 -- -quiet
  # Release build installs to ~/Library/Audio/Plug-Ins/
  ```

- [ ] **Kill Audio Unit cache and re-register**

  ```bash
  killall -9 AudioComponentRegistrar 2>/dev/null || true
  sudo killall coreaudiod 2>/dev/null || true
  # Wait 2 seconds for audio daemon to restart
  sleep 2
  ```

- [ ] **Run auval**

  ```bash
  auval -v aufx Scat Essc
  # Expected output ends with:
  #   VALIDATING: .... PASSED
  # Common failures and fixes:
  #   "does not support stereo" → check isBusesLayoutSupported
  #   "latency changed mid-stream" → ensure setLatencySamples(0) in constructor
  #   "failed to initialize" → check for crashes in prepareToPlay
  ```

  > Note: If `auval` cannot find the plugin, run `auval -a` to list all installed AU plugins and verify "Scatter" appears.

- [ ] **Fix any auval failures**

  Common issues:
  - Parameter value out of range → check APVTS ranges
  - Editor crash on open/close → check setLookAndFeel lifecycle in editor destructor
  - State restore failure → verify `getStateInformation` / `setStateInformation` are symmetrical

---

### Task 20: Run VST3 validation

- [ ] **Download pluginval**

  ```bash
  # pluginval is a JUCE tool for validating VST3/AU plugins
  brew install --cask pluginval
  # Or download from: https://github.com/Tracktion/pluginval/releases
  ```

- [ ] **Run pluginval on the VST3**

  ```bash
  pluginval --validate ~/Library/Audio/Plug-Ins/VST3/Scatter.vst3 --strictness-level 5 --output-dir /tmp/pluginval-results
  # Expected: All tests pass at strictness level 5
  ```

  > Strictness level 5 is sufficient for a well-behaved audio effect. Level 10 is for commercial plugins targeting plugin stores.

---

### Task 21: Verify state persistence

- [ ] **Manual test in Logic Pro**

  1. Open Logic Pro, load Scatter on a track
  2. Drag XO1 to ~300 Hz (away from default 150 Hz)
  3. Set Band 3 width to 75%
  4. Toggle Band 2 bypass ON
  5. Enable SOLO on Band 4 (click its SOLO button)
  6. Save the Logic session (`Cmd+S`)
  7. Close Logic Pro completely
  8. Reopen Logic Pro and load the saved session
  9. Verify: XO1 is still at 300 Hz, Band 3 width is 75%, Band 2 is still bypassed, Band 4 SOLO is still active

---

### Task 22: Copy sheep logo resource

- [ ] **Copy SVG from sheep project**

  ```bash
  cp /Volumes/zodlightning/sites/sheep/icon.svg /Volumes/zodlightning/sites/sheep/plugins/scatter/Resources/sheep-logo.svg
  ```

  The SVG contains the waveform-bars icon used in FooterBar. FooterBar currently draws it programmatically — this file is for documentation and future use.

---

### Task 23: Add CLAUDE.md to scatter

- [ ] **Create `/Volumes/zodlightning/sites/sheep/plugins/scatter/CLAUDE.md`**

  ```markdown
  # CLAUDE.md — Scatter

  AU + VST3 plugin for macOS. 6-band multiband stereo imager.

  ## Build

  ```bash
  cmake -B build -G Xcode -DCMAKE_OSX_ARCHITECTURES="arm64;x86_64" -DCMAKE_OSX_DEPLOYMENT_TARGET=12.0
  cmake --build build --config Debug --target Scatter_AU Scatter_VST3
  cmake --build build --config Debug --target ScatterTests
  ./build/ScatterTests_artefacts/Debug/ScatterTests
  ```

  ## Validate

  ```bash
  auval -v aufx Scat Essc
  pluginval --validate ~/Library/Audio/Plug-Ins/VST3/Scatter.vst3
  ```

  ## Architecture

  - `Source/dsp/` — DSP classes (CrossoverFilter, MultibandSplitter, StereoImager)
  - `Source/ui/`  — UI components (LookAndFeel, HeaderBar, FooterBar, BandStrip, FrequencyDisplay)
  - `Source/PluginProcessor` — APVTS, processBlock, state I/O
  - `Source/PluginEditor`    — root 600×380px layout

  ## Spec

  Full design spec: `../sheep/docs/superpowers/specs/2026-03-12-scatter-design.md`

  ## Notes

  - Plugin codes: manufacturer `Essc`, plugin `Scat` — verify no collision before distribution
  - Solo state is NOT an APVTS parameter — it is a `uint8_t soloState` bitmask on the processor
  - LR4 crossovers use clamp-the-mover: dragged handle stops at its limit, neighbors never move
  - No gain compensation at 0% width — by design (see spec §3.3)
  ```

---

### Task 24: Final commit and tag

- [ ] **Stage and commit everything**

  ```bash
  cd /Volumes/zodlightning/sites/sheep/plugins/scatter
  git add .
  git commit -m "feat: complete Scatter v1.0.0 — AU+VST3, 6-band multiband stereo imager"
  git tag v1.0.0
  ```

- [ ] **Verify tag**

  ```bash
  git log --oneline
  # Should show all commits: scaffold → DSP → PluginProcessor → UI → validation
  ```

---

## Known Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| AU not appearing in Logic | Cache stale | `killall coreaudiod && sleep 2` |
| `auval` "cannot find plugin" | Build didn't install | Check `COPY_PLUGIN_AFTER_BUILD TRUE` in CMake |
| XO handles don't update UI | Editor not repainting | Verify `startTimerHz(15)` in PluginEditor constructor |
| Click/pop on bypass toggle | Bypass fade not ramping | Ensure `bypassFade` ramp logic in `processBlock` |
| Build fails on first FetchContent | GitHub rate limit | Retry after 60s, or pre-clone JUCE to `_deps/` |
| `SmoothedValue::skip()` wrong | Called after `getNextValue()` | Call `setTargetValue` first, then per-sample loop |
| Band colors wrong in freq display | 0-indexed vs 1-indexed bands | Verify `bandColor(n)` uses 0-indexed n |
