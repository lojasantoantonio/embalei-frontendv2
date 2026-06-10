import type { ScannedItem } from "@/types";

interface Props {
  item: ScannedItem;
  picked: number;
  onPick: () => void;
}

function itemLabel(skuName: string): string {
  return skuName.trim().slice(0, 4).toUpperCase() || "ITEM";
}

export function ItemRow({ item, picked, onPick }: Props) {
  const done = picked >= item.quantity;
  return (
    <div className={"item" + (done ? " done" : "")} onClick={onPick}>
      <div className="item-photo" title={item.skuName}>
        <div
          className="ph"
          style={{ background: "linear-gradient(135deg, #dbeafe, #e5e7eb)" }}
        />
        <div className="label">{itemLabel(item.skuName)}</div>
      </div>
      <div className="item-meta">
        <div className="item-name">{item.skuName}</div>
        <div className="item-sku">SKU · {item.idSku}</div>
      </div>
      <div className="check">
        <span className="mono" style={{ fontSize: 16 }}>
          {item.quantity}×
        </span>
      </div>
    </div>
  );
}
