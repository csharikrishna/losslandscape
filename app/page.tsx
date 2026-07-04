"use client";

import Hero from "@/components/sections/Hero";
import Basics from "@/components/sections/Basics";
import SharpMinimum from "@/components/sections/SharpMinimum";
import SaddlePoint from "@/components/sections/SaddlePoint";
import Plateau from "@/components/sections/Plateau";
import Cliff from "@/components/sections/Cliff";
import Ridge from "@/components/sections/Ridge";
import RavineContours from "@/components/sections/RavineContours";
import Curvature from "@/components/sections/Curvature";
import FlatMinimum from "@/components/sections/FlatMinimum";
import GlobalMinimum from "@/components/sections/GlobalMinimum";
import Sgd from "@/components/sections/Sgd";
import Overlook from "@/components/sections/Overlook";
import DeepConcepts from "@/components/sections/DeepConcepts";
import KeyTakeaways from "@/components/sections/KeyTakeaways";
import PDFSection from "@/components/sections/PDFSection";
import GrandFinale from "@/components/sections/GrandFinale";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Basics />
      <SharpMinimum />
      <SaddlePoint />
      <Plateau />
      <Cliff />
      <Ridge />
      <RavineContours />
      <Curvature />
      <FlatMinimum />
      <GlobalMinimum />
      <Sgd />
      <Overlook />
      <DeepConcepts />
      <KeyTakeaways />
      <PDFSection />
      <GrandFinale />
      <Footer />
    </>
  );
}
