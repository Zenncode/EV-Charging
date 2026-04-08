import { StartStepLayout } from "./StartStepLayout";
import { getImage } from "../../lib/imageMapper";

interface StartStepProps {
  onNext: () => void;
}

export function StartStep2({ onNext }: StartStepProps) {
  return (
    <StartStepLayout
      step={2}
      title={"Real-Time\nStation Finder"}
      description="View available charging stations in real time, check availability, and get direction to the nearest one."
      backgroundUri={getImage("onboarding", "step2")}
      onPress={onNext}
    />
  );
}
