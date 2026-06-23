import { Icon } from "@/components/icons";
import type { OrderTemperature } from "@/types";

export function TempCard({ temp }: { temp: OrderTemperature }) {
  // Backends antigos podem não enviar min/max — trata undefined e null igual.
  const hasReadings =
    typeof temp.min === "number" && typeof temp.max === "number";

  return (
    <div>
      <h3 className="panel-title">
        <span className="ic">
          <Icon.thermo width={12} height={12} />
        </span>
        Temperatura no destino
      </h3>
      <div className="temp-minmax">
        <div className="temp-stat temp-stat--min">
          <span className="lbl">Mínima</span>
          <span className="val">{hasReadings ? `${temp.min}°` : "—"}</span>
        </div>
        <div className="temp-stat temp-stat--max">
          <span className="lbl">Máxima</span>
          <span className="val">{hasReadings ? `${temp.max}°` : "—"}</span>
        </div>
      </div>
      <div className="temp-meta">
        <div className="where">
          <b>{temp.city}</b>
        </div>
        <div className="cond">{temp.condition}</div>
      </div>
      {temp.deliveryDate && (
        <div className="temp-forecast">
          Previsão de entrega: <b>{temp.deliveryDate}</b>
        </div>
      )}
    </div>
  );
}
