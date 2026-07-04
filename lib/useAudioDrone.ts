"use client";

import { useState, useEffect, useRef } from "react";
import { useMotionValueEvent } from "framer-motion";
import * as THREE from "three";
import { useJourneyScroll } from "./scroll-context";
import { toCameraProgress } from "./trajectory";
import { JOURNEY, heightAt } from "./terrain-data";

export function useAudioDrone() {
  const [isAudioOn, setIsAudioOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const { smoothProgress } = useJourneyScroll();

  // Calculate terrain bounds for normalization
  const minMax = useRef({ min: 0, max: 1 });
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

  useEffect(() => {
    let minH = Infinity;
    let maxH = -Infinity;
    
    const points = JOURNEY.map((stop) => {
      const groundY = heightAt(stop.x, stop.z);
      if (groundY < minH) minH = groundY;
      if (groundY > maxH) maxH = groundY;
      return new THREE.Vector3(stop.x, groundY, stop.z);
    });

    minMax.current = { min: minH, max: maxH };
    curveRef.current = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.3);

    // Cleanup audio context if component unmounts
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (isAudioOn) {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        
        gainNodeRef.current = audioCtxRef.current.createGain();
        gainNodeRef.current.gain.value = 0; // Start silent
        gainNodeRef.current.connect(audioCtxRef.current.destination);

        oscillatorRef.current = audioCtxRef.current.createOscillator();
        oscillatorRef.current.type = 'triangle'; // Deep, smooth sci-fi hum
        oscillatorRef.current.frequency.value = 50; 
        
        // Add a lowpass filter to warm up the triangle wave
        const filter = audioCtxRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180;
        
        oscillatorRef.current.connect(filter);
        filter.connect(gainNodeRef.current);
        
        oscillatorRef.current.start();
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Fade in gracefully
      const now = audioCtxRef.current.currentTime;
      gainNodeRef.current?.gain.setTargetAtTime(0.35, now, 0.4); 
    } else {
      // Fade out gracefully
      if (audioCtxRef.current && gainNodeRef.current) {
        const now = audioCtxRef.current.currentTime;
        gainNodeRef.current.gain.setTargetAtTime(0.001, now, 0.4);
      }
    }
  }, [isAudioOn]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (!isAudioOn || !audioCtxRef.current || !oscillatorRef.current || !curveRef.current) return;
    
    // Map scroll progress to the terrain curve
    const p = toCameraProgress(latest);
    const pos = curveRef.current.getPointAt(Math.max(0, Math.min(1, p)));
    const height = pos.y;
    
    const { min, max } = minMax.current;
    
    // Normalize height between 0 and 1
    const hRange = max - min || 1;
    let normalized = (height - min) / hRange;
    normalized = Math.max(0, Math.min(1, normalized)); 

    // Map to frequency: deep sub-bass (50Hz) up to low hum (120Hz)
    const minFreq = 50;
    const maxFreq = 120;
    const targetFreq = minFreq + (normalized * (maxFreq - minFreq));
    
    // Glide the pitch smoothly
    const now = audioCtxRef.current.currentTime;
    oscillatorRef.current.frequency.setTargetAtTime(targetFreq, now, 0.15);
  });

  return { isAudioOn, setIsAudioOn };
}
