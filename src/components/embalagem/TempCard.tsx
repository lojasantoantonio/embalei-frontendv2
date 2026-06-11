import type { CSSProperties } from "react";
import { Icon } from "@/components/icons";
import type { OrderTemperature } from "@/types";

export function TempCard({ temp }: { temp: OrderTemperature }) {
  // map -10..40 → -120deg..120deg
  const v = Math.max(-10, Math.min(40, temp.value));
  const rot = -120 + ((v + 10) / 50) * 240;
  const isCold = v < 15;
  const isHot = v > 25;

  return (
    <div>
      <h3 className="panel-title">
        <span className="ic">
          <Icon.thermo width={12} height={12} />
        </span>
        Temperatura no destino
      </h3>
      <div className="temp-card">
        <div className="dial">
          <div
            className="needle"
            style={{ ["--rot" as string]: `${rot}deg` } as CSSProperties}
          />
          <div className="center" />
        </div>
        <div className="temp-num">
          <div className="deg">
            {temp.value}
            <span className="unit">°C</span>
          </div>
          <div className="where">
            <b>{temp.city}</b>
          </div>
          <div className="forecast">{temp.condition}</div>
        </div>
      </div>
      {temp.forecast && (
        <div className="temp-forecast">{temp.forecast}</div>
      )}
    </div>
  );
}
