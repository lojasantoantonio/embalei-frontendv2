"use client";

import { ToggleButton } from "@heroui/react";
import type { ApiEstacao } from "@/lib/api";

interface Props {
  station: ApiEstacao;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function StationCard({ station, index, selected, onSelect }: Props) {
  const busy = station.status === "em_uso";
  const className =
    "station-card" + (selected ? " selected" : "") + (busy ? " busy" : "");

  const subtitle = busy
    ? station.occupantName
      ? `Em uso · ${station.occupantName}`
      : "Em uso"
    : station.description ?? "Disponível";

  return (
    <ToggleButton
      className={className}
      aria-label={`Estação ${station.name} — ${subtitle}`}
      isSelected={selected}
      isDisabled={busy}
      onChange={(isSelected) => {
        if (isSelected) onSelect(station.id);
      }}
    >
      <span className="num">{String(index).padStart(2, "0")}</span>
      <span className="info">
        <span className="name">{station.name}</span>
        <span className="sub">{subtitle}</span>
      </span>
      <span className="dot" title={busy ? "ocupada" : "disponível"} />
    </ToggleButton>
  );
}
