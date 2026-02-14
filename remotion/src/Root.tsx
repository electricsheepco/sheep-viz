import { Composition } from "remotion";
import { Video1What } from "./Video1-What";
import { Video2Origin } from "./Video2-Origin";
import { Video3Why } from "./Video3-Why";
import { Video4HowToUse } from "./Video4-HowToUse";
import { Video5Who } from "./Video5-Who";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video1-What"
        component={Video1What}
        durationInFrames={600} // 20s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Video2-Origin"
        component={Video2Origin}
        durationInFrames={750} // 25s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Video3-Why"
        component={Video3Why}
        durationInFrames={600} // 20s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Video4-HowToUse"
        component={Video4HowToUse}
        durationInFrames={900} // 30s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="Video5-Who"
        component={Video5Who}
        durationInFrames={750} // 25s @ 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
