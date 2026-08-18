import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { PersistentBackground } from "./components/PersistentBackground";
import { PersistentAccents } from "./components/PersistentAccents";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Vision } from "./scenes/Scene2Vision";
import { Scene3Work } from "./scenes/Scene3Work";
import { Scene4Sports } from "./scenes/Scene4Sports";
import { Scene5Close } from "./scenes/Scene5Close";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "800", "900"],
  subsets: ["latin"],
});

const timing = springTiming({ config: { damping: 200 }, durationInFrames: 25 });

export const MainVideo: React.FC = () => (
  <AbsoluteFill style={{ fontFamily, backgroundColor: "#07080B" }}>
    <PersistentBackground />

    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={100}>
        <Scene1Hook fontFamily={fontFamily} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-left" })}
        timing={timing}
      />
      <TransitionSeries.Sequence durationInFrames={110}>
        <Scene2Vision fontFamily={fontFamily} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={timing}
      />
      <TransitionSeries.Sequence durationInFrames={120}>
        <Scene3Work fontFamily={fontFamily} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-right" })}
        timing={timing}
      />
      <TransitionSeries.Sequence durationInFrames={110}>
        <Scene4Sports fontFamily={fontFamily} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={110}>
        <Scene5Close fontFamily={fontFamily} />
      </TransitionSeries.Sequence>
    </TransitionSeries>

    <PersistentAccents />
  </AbsoluteFill>
);
