export type ScannerVariant = "a" | "b" | "c";

export function ScannerIllus({ variant }: { variant: ScannerVariant }) {
  if (variant === "b") {
    return (
      <div className="scanner-illus vb">
        <div className="scanner-label">ZBR · DS2208</div>
        <div className="gun">
          <div className="gun-head" />
          <div className="grip" />
          <div className="beam" />
          <div className="barcode" />
        </div>
      </div>
    );
  }
  if (variant === "c") {
    return (
      <div className="scanner-illus vc">
        <div className="scanner-label">HONEY · MK7580</div>
        <div className="laser-bar" />
        <div className="laser-fan" />
        <div className="pkg" />
        <div className="scan-line" />
      </div>
    );
  }
  return (
    <div className="scanner-illus va">
      <div className="scanner-label">SYM · LS2208</div>
      <div className="scanner-window" />
    </div>
  );
}
