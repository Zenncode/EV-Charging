import { StartStepLayout } from "./StartStepLayout";
import { getImage } from "../../lib/imageMapper";

interface StartStepProps {
  onNext: () => void;
}

export function StartStep3({ onNext }: StartStepProps) {
  return (
    <StartStepLayout
      step={3}
      title={"Smart Charging,\nSeamless\nTravel"}
      description="Locate the nearest Sapphire Network charging stations instantly. Keep your drive smooth and your battery full."
      backgroundUri={getImage("onboarding", "step3")}
      onPress={onNext}
    />
  );
}
