/**
 * The speech bubble, drawn as SVG rather than shipped as a raster.
 *
 * Every dimension is an independent number: the body's height no longer
 * changes the stroke weight, and the tail keeps its own size when the body is
 * resized. Editing a raster coupled all three — squashing the box thickened
 * the horizontal strokes, and eroding to compensate eventually broke the
 * outline.
 *
 * Geometry: the tail leaves the centre of the body's bottom edge and points
 * down-left, so the bubble sits to the right of the figure it belongs to.
 */
export default function SpeechBubble({
  width = 430,
  bodyRatio = 0.42,   // body height / width
  tailRatio = 0.20,   // tail height / width
  stroke = 0.6,       // stroke width, as a share of the 100-unit viewBox
  radius = 0.10,      // corner radius / width
  className = '',
  style,
}) {
  const W = 100;                          // work in a 100-wide viewBox
  const bodyH = W * bodyRatio;
  const tailH = W * tailRatio;
  const H = bodyH + tailH;
  const r = W * radius;
  // Stroke width in viewBox units, so the line scales with the bubble and
  // keeps the same visual weight relative to it. It must not be derived from
  // `width`, which may be a percentage string.
  const sw = stroke;

  // Tail: leaves the body's underside, runs down-left to a point, returns.
  // The tail leaves the middle of the body's bottom edge and runs down-left.
  const attachRight = W * 0.56;
  const attachLeft = W * 0.44;
  const tipX = W * 0.30;
  const tipY = H - sw;

  const d = [
    `M ${r} ${sw / 2}`,
    `H ${W - r}`,
    `A ${r} ${r} 0 0 1 ${W - sw / 2} ${r}`,
    `V ${bodyH - r}`,
    `A ${r} ${r} 0 0 1 ${W - r} ${bodyH}`,
    `H ${attachRight}`,
    `L ${tipX} ${tipY}`,               // down to the tail's point
    `L ${attachLeft} ${bodyH}`,        // back up to the body
    `H ${r}`,
    `A ${r} ${r} 0 0 1 ${sw / 2} ${bodyH - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} ${sw / 2}`,
    'Z',
  ].join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={width}
      // Height follows from the viewBox aspect, so `width` may be a percentage.
      height={typeof width === 'number' ? width * (H / W) : undefined}
      className={className}
      style={{ display: 'block', overflow: 'visible', ...style }}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={d}
        fill="none"
        stroke="#151A21"
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
