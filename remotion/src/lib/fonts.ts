import { continueRender, delayRender, staticFile } from "remotion";

let handle: ReturnType<typeof delayRender> | null = null;
let loaded = false;

export const loadFonts = () => {
  if (loaded || handle !== null) return;

  handle = delayRender("Loading Major Mono Display");

  const font = new FontFace(
    "Major Mono Display",
    `url(${staticFile("fonts/MajorMonoDisplay-Regular.ttf")})`
  );

  font
    .load()
    .then((f) => {
      document.fonts.add(f);
      loaded = true;
      if (handle !== null) {
        continueRender(handle);
        handle = null;
      }
    })
    .catch((err) => {
      console.error("Font load failed:", err);
      if (handle !== null) {
        continueRender(handle);
        handle = null;
      }
    });
};
