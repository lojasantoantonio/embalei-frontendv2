import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@/components/icons";
import type { OperatorStats } from "@/types";

interface Props {
  orderCode: string | null;
  stationName: string;
  operatorName: string;
  operatorStats: OperatorStats;
  onExit: () => void;
  onReset: () => void;
}

// Tempo em que o "+N" verde permanece visível pulsando ao lado do contador.
const BUMP_VISIBLE_MS = 1500;

interface StatBump {
  delta: number;
  key: number;
}

export function TopBar({
  orderCode,
  stationName,
  operatorName,
  operatorStats,
  onExit,
  onReset,
}: Props) {
  const [previousStats, setPreviousStats] = useState<OperatorStats>(operatorStats);
  const [ordersBump, setOrdersBump] = useState<StatBump | null>(null);
  const [unitsBump, setUnitsBump] = useState<StatBump | null>(null);

  // Detecta incrementos para piscar o badge "+N". Ignora decréscimos ou valores
  // iguais (ex.: primeira carga ou correção do backend depois de race).
  useEffect(() => {
    const orderDelta = operatorStats.orderCount - previousStats.orderCount;
    const unitDelta = operatorStats.unitCount - previousStats.unitCount;
    if (orderDelta > 0) setOrdersBump({ delta: orderDelta, key: Date.now() });
    if (unitDelta > 0) setUnitsBump({ delta: unitDelta, key: Date.now() + 1 });
    if (orderDelta !== 0 || unitDelta !== 0) {
      setPreviousStats(operatorStats);
    }
  }, [operatorStats, previousStats]);

  useEffect(() => {
    if (!ordersBump) return;
    const timer = setTimeout(() => setOrdersBump(null), BUMP_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [ordersBump]);

  useEffect(() => {
    if (!unitsBump) return;
    const timer = setTimeout(() => setUnitsBump(null), BUMP_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [unitsBump]);

  return (
    <div className="topbar">
      <button
        type="button"
        className="brand brand-button"
        onClick={onReset}
        aria-label="Novo pedido"
      >
        <div className="brand-mark">E</div>
        <span className="brand-name">Embalei</span>
      </button>
      <div className="crumbs">
        <span>{stationName}</span>
        <span className="sep">/</span>
        <span>Embalagem</span>
        {orderCode && (
          <>
            <span className="sep">/</span>
            <span className="cur mono">{orderCode}</span>
          </>
        )}
      </div>
      <div className="spacer" />
      <div className="operator-stats" aria-label="Embalagens de hoje">
        <div
          className={"operator-stat" + (ordersBump ? " operator-stat--bump" : "")}
          key={`orders-${ordersBump?.key ?? "static"}`}
        >
          <span className="value">{operatorStats.orderCount}</span>
          <span className="label">pedidos</span>
          {ordersBump && (
            <span className="operator-stat-bump" aria-hidden="true">
              +{ordersBump.delta}
            </span>
          )}
        </div>
        <div
          className={"operator-stat" + (unitsBump ? " operator-stat--bump" : "")}
          key={`units-${unitsBump?.key ?? "static"}`}
        >
          <span className="value">{operatorStats.unitCount}</span>
          <span className="label">itens</span>
          {unitsBump && (
            <span className="operator-stat-bump" aria-hidden="true">
              +{unitsBump.delta}
            </span>
          )}
        </div>
      </div>
      <div className="station">
        <span className="dot" />
        <span>{operatorName}</span>
      </div>
      {orderCode && (
        <Button className="btn ghost btn-new-order" onPress={onReset} aria-label="Novo pedido">
          <Icon.reset width={14} height={14} />
          <span className="btn-new-order-label">Novo pedido</span>
        </Button>
      )}
      <Button className="btn danger" onPress={onExit}>
        <Icon.logout width={14} height={14} />
        SAIR
      </Button>
    </div>
  );
}
