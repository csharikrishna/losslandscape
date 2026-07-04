/**
 * Terrain surface shader.
 *
 * Elevation (world-space Y, which in this scene literally *is* loss — see
 * lib/terrain-data.ts) drives everything: the four-stop color ramp, the
 * contour-line overlay, and how quickly a point fades into fog. Height
 * displacement itself happens once on the CPU when the geometry is built
 * (see components/canvas/Terrain.tsx) — this shader only shades.
 */

export const terrainVertexShader = /* glsl */ `
  varying float vElevation;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vViewDepth;

  void main() {
    vElevation = position.y;
    vNormal = normalize(normalMatrix * normal);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    vec4 mvPosition = viewMatrix * worldPosition;
    vViewDepth = -mvPosition.z;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const terrainFragmentShader = /* glsl */ `
  uniform vec3 uColorLow;
  uniform vec3 uColorMidLow;
  uniform vec3 uColorMid;
  uniform vec3 uColorHigh;
  uniform float uMinY;
  uniform float uMaxY;
  uniform vec3 uLightDir;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec3 uCameraPosition;
  uniform float uContourSpacing;
  uniform float uContourOpacity;
  uniform vec3 uContourColor;
  uniform float uTime;

  varying float vElevation;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vViewDepth;

  // Four-stop elevation ramp: low → mid-low → mid → high.
  vec3 elevationColor(float t) {
    vec3 c;
    if (t < 0.333) {
      c = mix(uColorLow, uColorMidLow, smoothstep(0.0, 0.333, t));
    } else if (t < 0.666) {
      c = mix(uColorMidLow, uColorMid, smoothstep(0.333, 0.666, t));
    } else {
      c = mix(uColorMid, uColorHigh, smoothstep(0.666, 1.0, t));
    }
    return c;
  }

  void main() {
    float t = clamp((vElevation - uMinY) / (uMaxY - uMinY), 0.0, 1.0);
    vec3 base = elevationColor(t);

    // --- Lambert diffuse + soft ambient, keyed off a fixed sun direction ---
    vec3 n = normalize(vNormal);
    float diff = max(dot(n, normalize(uLightDir)), 0.0);
    float lighting = 0.42 + diff * 0.66;
    vec3 shaded = base * lighting;

    // --- Contour lines: crisp, anti-aliased iso-elevation rings ---
    float coord = vElevation / uContourSpacing;
    float distToLine = abs(fract(coord - 0.5) - 0.5);
    float aa = fwidth(coord) * 1.5 + 0.0001;
    float lineMask = 1.0 - smoothstep(0.0, aa, distToLine);
    float shimmer = 0.92 + 0.08 * sin(uTime * 0.35 + vWorldPosition.x * 0.08 + vWorldPosition.z * 0.05);
    shaded = mix(shaded, uContourColor, lineMask * uContourOpacity * shimmer);

    // --- Fresnel rim light along ridgelines, catching a cool highlight ---
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 2.4);
    shaded += uContourColor * fresnel * 0.14;

    // --- Distance fog, fading the far range into the void background ---
    float fogFactor = smoothstep(uFogNear, uFogFar, vViewDepth);
    vec3 finalColor = mix(shaded, uFogColor, fogFactor);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/** A thin, glowing tube shader for the optimization trajectory — a simple
 *  fresnel-boosted emissive core so it reads as "light," not "plastic." */
export const trajectoryVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const trajectoryFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uCameraPosition;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), viewDir), 0.0, 1.0), 1.6);
    vec3 color = uColor * (0.75 + fresnel * 1.4);
    gl_FragColor = vec4(color, uOpacity);
  }
`;
