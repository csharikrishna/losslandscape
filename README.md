# The Loss Landscape

An interactive, scroll-driven expedition into the high-dimensional geometry of deep learning optimization.

This project uses **Next.js**, **React Three Fiber (WebGL)**, and **Framer Motion** to visualize the incredibly complex, abstract concepts of neural network training—transforming equations into a tangible, explorable 3D world.

## Features

- **Continuous Scroll Journey:** The camera smoothly flies through a persistent 3D landscape of local minima, saddle points, and plateaus tied directly to your scroll position.
- **Interactive Topography:** See abstract concepts like "Sharp vs Flat Minima" visualized as physical 3D terrain.
- **Cinematic Movie Mode:** Press the "Movie" button (or Spacebar) to let the site automatically scroll and guide you through the article with cinematic pacing.
- **Explore The Matrix:** Break off the rails! Enter Explore mode (`/explore`) to fly around the 3D landscape freely using WASD and your mouse.
- **Architecture View:** Enter Architecture mode (`/architecture`) to view a glowing, 3D visualization of a Convolutional Neural Network processing an image, complete with real-time data packets flowing through the layers and a 12-second automated Cinematic Fly-Through.

## Tech Stack

- **Framework:** Next.js (App Router)
- **3D Graphics:** Three.js, React Three Fiber, Drei
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS

## Running Locally

First, install the dependencies:
```bash
npm install
# or
yarn install
```

Then, run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start the journey.
