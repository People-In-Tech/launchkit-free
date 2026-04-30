import { Composition } from "remotion";
import { LaunchKitDemo } from "./LaunchKitDemo";

export const Root: React.FC = () => {
  return (
    <Composition
      id="LaunchKitDemo"
      component={LaunchKitDemo}
      durationInFrames={750}
      fps={30}
      width={1080}
      height={700}
    />
  );
};
