export type ConceptVariant =
  | "concentration"
  | "typical"
  | "basin"
  | "connectivity"
  | "flatsharp"
  | "implicit-bias"
  | "reparam";

const STROKE = "#8FF7E0";
const LOW = "#2E6FF2";
const HIGH = "#F2542D";
const MID = "#F2C14E";
const DIM = "#3A4360";

function Concentration() {
  return (
    <>
      <circle cx="32" cy="32" r="22" fill="none" stroke={DIM} strokeWidth="1.5" />
      <ellipse cx="32" cy="32" rx="22" ry="6" fill={STROKE} fillOpacity="0.16" />
      <ellipse cx="32" cy="32" rx="22" ry="6" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="1.6" fill="#EDEFF5" />
    </>
  );
}

function Typical() {
  return (
    <>
      <path
        d="M8,46 C16,46 20,16 32,16 C44,16 48,46 56,46"
        fill="none"
        stroke={DIM}
        strokeWidth="1.5"
      />
      <line x1="32" y1="46" x2="32" y2="18" stroke={STROKE} strokeDasharray="2 2" strokeWidth="1.3" />
      <circle cx="32" cy="17" r="2" fill={STROKE} />
      <circle cx="52" cy="44.5" r="2" fill={HIGH} />
      <line x1="8" y1="46" x2="56" y2="46" stroke={DIM} strokeWidth="1.5" />
    </>
  );
}

function Basin() {
  return (
    <>
      {[
        "M10,12 C18,20 24,26 30,30",
        "M54,10 C46,18 38,24 34,29",
        "M12,52 C20,44 26,38 30,33",
        "M52,54 C44,46 38,40 34,33",
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={STROKE} strokeWidth="1.4" markerEnd="url(#basin-arrow)" />
      ))}
      <circle cx="32" cy="32" r="3" fill="#EDEFF5" />
      <defs>
        <marker id="basin-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={STROKE} />
        </marker>
      </defs>
    </>
  );
}

function Connectivity() {
  return (
    <>
      <line x1="8" y1="18" x2="56" y2="18" stroke={DIM} strokeWidth="1.2" strokeDasharray="2 3" />
      <path d="M14,20 C14,42 26,44 32,44 C38,44 50,42 50,20" fill="none" stroke={STROKE} strokeWidth="1.6" />
      <circle cx="14" cy="20" r="3" fill={LOW} />
      <circle cx="50" cy="20" r="3" fill={LOW} />
    </>
  );
}

function FlatSharp() {
  return (
    <>
      <g>
        <ellipse cx="18" cy="32" rx="4" ry="3" fill="none" stroke={HIGH} strokeWidth="1.3" />
        <ellipse cx="18" cy="32" rx="9" ry="7" fill="none" stroke={HIGH} strokeWidth="1.1" opacity="0.6" />
        <ellipse cx="18" cy="32" rx="14" ry="11" fill="none" stroke={HIGH} strokeWidth="0.9" opacity="0.35" />
      </g>
      <g>
        <ellipse cx="46" cy="32" rx="4" ry="3" fill="none" stroke={LOW} strokeWidth="1.3" />
        <ellipse cx="46" cy="32" rx="12" ry="9" fill="none" stroke={LOW} strokeWidth="1.1" opacity="0.6" />
        <ellipse cx="46" cy="32" rx="20" ry="15" fill="none" stroke={LOW} strokeWidth="0.9" opacity="0.35" />
      </g>
    </>
  );
}

function ImplicitBias() {
  return (
    <>
      <path
        d="M8,20 L14,26 L11,30 L18,34 L14,38 L22,40 L26,36 L30,40"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx="44" cy="40" rx="16" ry="10" fill="none" stroke={LOW} strokeWidth="1.4" />
      <circle cx="44" cy="40" r="2.3" fill={LOW} />
    </>
  );
}

function Reparam() {
  return (
    <>
      <ellipse cx="16" cy="32" rx="10" ry="6" fill="none" stroke={MID} strokeWidth="1.6" />
      <text x="30" y="36" fill="#7B8299" fontSize="13" className="font-mono">
        =
      </text>
      <ellipse cx="48" cy="32" rx="6" ry="10" fill="none" stroke={MID} strokeWidth="1.6" />
    </>
  );
}

const ICONS: Record<ConceptVariant, () => JSX.Element> = {
  concentration: Concentration,
  typical: Typical,
  basin: Basin,
  connectivity: Connectivity,
  flatsharp: FlatSharp,
  "implicit-bias": ImplicitBias,
  reparam: Reparam,
};

export default function ConceptIcon({ variant }: { variant: ConceptVariant }) {
  const IconInner = ICONS[variant];
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
      <IconInner />
    </svg>
  );
}
