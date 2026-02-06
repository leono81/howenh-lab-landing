import { Composition, Folder } from "remotion";
import { Idea1VideoLoop } from "./compositions/Idea1VideoLoop";
import { Idea4Storytelling, Idea4Idle } from "./compositions/Idea4Storytelling";
import { Idea5MultiFormat, idea5Schema } from "./compositions/Idea5MultiFormat";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Workflow-Templates">
        <Composition
          id="Idea1-VideoLoop"
          component={Idea1VideoLoop}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={600}
        />
        <Composition
          id="Idea4-Storytelling"
          component={Idea4Storytelling}
          durationInFrames={600}
          fps={30}
          width={1920}
          height={800}
        />
        <Composition
          id="Idea4-Idle"
          component={Idea4Idle}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={800}
        />
        <Composition
          id="Idea5-MultiFormat-Landscape"
          component={Idea5MultiFormat}
          schema={idea5Schema}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={600}
          defaultProps={{ format: "landscape" as const }}
        />
        <Composition
          id="Idea5-MultiFormat-Square"
          component={Idea5MultiFormat}
          schema={idea5Schema}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{ format: "square" as const }}
        />
        <Composition
          id="Idea5-MultiFormat-Vertical"
          component={Idea5MultiFormat}
          schema={idea5Schema}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ format: "vertical" as const }}
        />
      </Folder>
    </>
  );
};
