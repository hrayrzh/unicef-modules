import SpeechBubble from './SpeechBubble';

/**
 * A figure with a speech bubble rising from its head. The figure sits at the
 * left of the content column and the bubble opens to its right.
 *
 * The block spans the full content column; `width` sizes the figure itself and
 * everything derived from it — the bubble, its offsets, the headroom above it
 * and the text inside it — so the composition scales as one piece and keeps its
 * proportions. Height is never passed in: both images have a fixed aspect
 * ratio, so accepting a height would only let a caller distort them.
 */

// Ratios, expressed relative to `width` (the figure's width). Both source
// images are cropped tight to their content, so these are derived from the
// artwork: the head sits at ~0.45 of the figure's width and near its top, and
// the bubble's tail tip sits at its bottom-left corner.
const BUBBLE_SCALE = 1.95;  // bubble width / figure width
const BUBBLE_LEFT = 0.05; // bubble's left edge, inset from the figure's left
const BUBBLE_BOTTOM = 0.9;// bubble's bottom edge, above the figure's bottom
const HEADROOM = 0.92;      // space reserved above the figure for the bubble
// Bubble text size, as a percentage of the bubble's own width. Expressed
// against the bubble rather than the figure so the text stays in proportion to
// the box that contains it, whatever the bubble is scaled to.
const TEXT_CQW = 3.8;

// The bubble is drawn, not shipped as an image, so its body and tail size
// independently of each other and of the stroke weight.
const BODY_RATIO = 0.40;    // body height / bubble width
const TAIL_RATIO = 0.13;    // tail height / bubble width

export default function FigureWithBubble({
  src,
  alt = '',
  bubble,
  bubbleText,
  width = 260,
  align = 'flex-start',
  className = '',
  asideTitle,
  asideText,
}) {
  const hasAside = asideTitle || asideText;
  return (
    <figure
      className={`ms-figure ${className}`.trim()}
      // Full width of the content column, with the figure placed inside it.
      // When an aside is present the two sit side by side, bottom-aligned so
      // the text runs alongside the figure rather than the bubble above it.
      style={{
        margin: 0,
        width: '100%',
        display: 'flex',
        justifyContent: hasAside ? 'flex-start' : align,
        alignItems: 'flex-end',
        gap: hasAside ? 28 : 0,
      }}
    >
      {/* Headroom keeps the bubble, which sits above the figure, from being
          clipped by the top of the scroll area. */}
      <div
        className="ms-figure-stage"
        style={{
          position: 'relative',
          width,
          flexShrink: 0,
          // The mobile rule overrides --ms-w-mobile to shrink the stage; every
          // offset below is a percentage of the stage's width, so the whole
          // composition follows without any of them being re-stated.
          '--ms-w-mobile': `${width}px`,
          '--ms-headroom-ratio': HEADROOM,
          marginTop: `calc(${width}px * ${HEADROOM})`,
        }}
      >
        {bubble && (
          <div
            className="ms-figure-bubble"
            style={{
              position: 'absolute',
              // Anchored above and to the right of the head; the bubble's tail
              // sits bottom-left, so it points back down at the figure.
              // Percentages of the stage's width, so shrinking the stage moves
              // and resizes the bubble with it.
              left: `${BUBBLE_LEFT * 100}%`,
              bottom: `${BUBBLE_BOTTOM * 100}%`,
              width: `${BUBBLE_SCALE * 100}%`,
              // The bubble overhangs to the left; never let it grow past the
              // content column it sits in.
              maxWidth: '100vw',
              zIndex: 1,
              // Make the bubble a query container so the text inside can size
              // itself against the bubble's real rendered width.
              containerType: 'inline-size',
            }}
          >
            <SpeechBubble
              width="100%"
              bodyRatio={BODY_RATIO}
              tailRatio={TAIL_RATIO}
            />
            {bubbleText && (
              <span
                style={{
                  position: 'absolute',
                  // Inset to the drawn body. The tail hangs below it, so the
                  // bottom inset clears exactly the tail's share of the height.
                  inset: `6% 5% ${Math.round((TAIL_RATIO / (BODY_RATIO + TAIL_RATIO)) * 100) + 4}% 5%`,
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  // Sized against the bubble's own width — cqw is 1% of this
                  // container's inline size, NOT of the viewport. The text
                  // therefore holds the same proportion to the bubble at every
                  // bubble size and on every screen. No floor or ceiling: a
                  // clamp would break that proportion at the extremes.
                  fontSize: `${TEXT_CQW}cqw`,
                  lineHeight: 1.45,
                  fontWeight: 500,
                  color: '#151A21',
                }}
              >
                {bubbleText}
              </span>
            )}
          </div>
        )}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </div>

      {/* Text column beside the figure, sitting on the same baseline. */}
      {hasAside && (
        <figcaption className="ms-figure-aside" style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
          {asideTitle && (
            <h2 style={{ margin: 0, fontFamily: "'Noto Serif Armenian', 'Spectral', serif", fontSize: 22, lineHeight: 1.35, fontWeight: 600, letterSpacing: '-.3px' }}>
              {asideTitle}
            </h2>
          )}
          {asideText && (
            <p style={{ margin: asideTitle ? '12px 0 0' : 0, fontSize: 16, lineHeight: 1.8, color: '#2B313A' }}>
              {asideText}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
