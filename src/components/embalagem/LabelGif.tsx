import { Icon } from "@/components/icons";

export function LabelGif({ gifUrl }: { gifUrl?: string | null }) {
  return (
    <div>
      <h3 className="panel-title">
        <span className="ic">
          <Icon.play width={12} height={12} />
        </span>
        Como colar a etiqueta
      </h3>
      <div className={`gif${gifUrl ? " gif--media" : ""}`}>
        {gifUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gifUrl}
            alt="Instrução de colagem da etiqueta"
            className="gif-media"
          />
        ) : (
          <>
            <div className="ph-label">GIF · ETIQUETA</div>
            <div className="ph-dot">SEM ETIQUETA</div>
            <div className="label-art">
              <div className="label-box" />
              <div className="label-sticker">
                <span />
                <span />
                <span />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="gif-caption">
        <div>
          {gifUrl
            ? "Siga o GIF para posicionar a etiqueta"
            : "Nenhuma etiqueta cadastrada para esta transportadora"}
        </div>
      </div>
    </div>
  );
}
