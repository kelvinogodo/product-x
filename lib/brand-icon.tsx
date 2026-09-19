/**
 * The product x brand mark: a gradient rounded square with a white "x". Used by the generated
 * favicon and apple-touch icon (rendered by next/og). Satori only understands hex/rgb colours,
 * so no hsl() here.
 */
export function BrandIcon({ size, radius }: { size: number; radius: number }) {
  const stroke = Math.max(2, Math.round(size * 0.14));
  const pad = size * 0.3;
  const far = size - pad;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius,
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #d946ef 100%)",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <line x1={pad} y1={pad} x2={far} y2={far} stroke="#ffffff" strokeWidth={stroke} strokeLinecap="round" />
        <line x1={far} y1={pad} x2={pad} y2={far} stroke="#ffffff" strokeWidth={stroke} strokeLinecap="round" />
      </svg>
    </div>
  );
}
