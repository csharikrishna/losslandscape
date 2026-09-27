"use client";

import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import { journey } from "@/lib/journey-state";

interface JourneyDriverProps {
  lambda?: number;
}

/**
 * Advances the single smoothed journey value once per frame.
 * Priority -1 ensures this runs before CameraRig and TrajectoryPath.
 * MathUtils.damp ensures identical smoothing behavior across 60Hz, 120Hz, and 144Hz displays.
 */
export default function JourneyDriver({ lambda = 5 }: JourneyDriverProps) {
  useFrame((_, delta) => {
    const clampedDt = Math.min(delta, 0.1);
    journey.smoothed = MathUtils.damp(journey.smoothed, journey.target, lambda, clampedDt);
  }, -1);

  return null;
}
