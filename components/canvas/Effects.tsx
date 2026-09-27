"use client";

import { EffectComposer, Bloom, SMAA } from "@react-three/postprocessing";
import type { Tier } from "@/lib/quality";

interface EffectsProps {
  tier: Tier;
}

export default function Effects({ tier }: EffectsProps) {
  if (!tier.postprocessing) {
    // On minimal tier, shaders include colorspace_fragment, rendering directly to canvas
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        levels={tier.bloomLevels}
        intensity={0.55}
        radius={0.6}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.25}
      />
      {tier.smaa ? <SMAA /> : <></>}
    </EffectComposer>
  );
}
