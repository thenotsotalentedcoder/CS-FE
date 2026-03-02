// CS monogram logo — white C + green glowing S, slightly overlapping
export default function CsLogo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ColdStart"
    >
      <defs>
        <filter id="cs-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* C — white, slightly left */}
      <text
        x="3"
        y="22"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontWeight="700"
        fontSize="22"
        fill="white"
        letterSpacing="-1"
      >
        C
      </text>

      {/* S — green with glow, overlaps C slightly */}
      <text
        x="13"
        y="22"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontWeight="700"
        fontSize="22"
        fill="#22c55e"
        filter="url(#cs-glow)"
        letterSpacing="-1"
      >
        S
      </text>
    </svg>
  );
}
