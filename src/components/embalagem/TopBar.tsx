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

export function TopBar({
  orderCode,
  stationName,
  operatorName,
  operatorStats,
  onExit,
  onReset,
}: Props) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">E</div>
        <span className="brand-name">Embalei</span>
      </div>
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
        <div className="operator-stat">
          <span className="value">{operatorStats.orderCount}</span>
          <span className="label">pedidos</span>
        </div>
        <div className="operator-stat">
          <span className="value">{operatorStats.unitCount}</span>
          <span className="label">itens</span>
        </div>
      </div>
      <div className="station">
        <span className="dot" />
        <span>{operatorName}</span>
      </div>
      {orderCode && (
        <Button className="btn ghost" onPress={onReset}>
          <Icon.reset width={14} height={14} />
          <span>Novo pedido</span>
        </Button>
      )}
      <Button className="btn danger" onPress={onExit}>
        <Icon.logout width={14} height={14} />
        SAIR
      </Button>
    </div>
  );
}
