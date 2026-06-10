// Mock orders database
const ORDERS = {
  "PED-48217": {
    code: "PED-48217",
    customer: "Mariana Cordeiro",
    city: "Curitiba · PR",
    placedAt: "Hoje, 09:24",
    priority: "normal",
    items: [
      {
        id: 1, sku: "BRG-CHA-200",
        name: "Chá Orgânico Camomila · Caixa 20 sachês",
        qty: 2, tags: [],
        color: "#dbeafe",
        label: "CHÁ",
      },
      {
        id: 2, sku: "GRL-MEL-340",
        name: "Mel Silvestre Pote 340g",
        qty: 1, tags: ["frágil"],
        color: "#fef3c7",
        label: "MEL",
      },
      {
        id: 3, sku: "LAT-IOG-150",
        name: "Iogurte Natural Coco 150ml (pack 4)",
        qty: 3, tags: ["refrigerado"],
        color: "#e0f2fe",
        label: "IOG",
      },
      {
        id: 4, sku: "GRA-AVO-500",
        name: "Granola Avena Premium 500g",
        qty: 1, tags: [],
        color: "#fde68a",
        label: "GRAN",
      },
      {
        id: 5, sku: "OLE-AZE-500",
        name: "Azeite Extra Virgem 500ml",
        qty: 1, tags: ["frágil"],
        color: "#bbf7d0",
        label: "AZE",
      },
    ],
    box: { name: "Caixa M (Reforçada)", dim: "32 × 24 × 18 cm", fill: 78 },
    carrier: { name: "Loggi Express", svc: "Refrigerado · Entrega no mesmo dia", logo: "L", eta: "Entrega até hoje, 19h00", color: "#1d4ed8" },
    temperature: { city: "Curitiba, PR", value: 14, condition: "Garoa leve · sensação 12°", forecast: "Refrigeração mantida até 8h" },
  },
  "PED-99014": {
    code: "PED-99014",
    customer: "Heitor Sampaio",
    city: "Salvador · BA",
    placedAt: "Hoje, 11:08",
    priority: "express",
    items: [
      {
        id: 1, sku: "CSM-SAB-100",
        name: "Sabonete Vegetal Lavanda 100g",
        qty: 4, tags: [],
        color: "#ede9fe",
        label: "SAB",
      },
      {
        id: 2, sku: "CSM-CRM-200",
        name: "Creme Hidratante Karité 200ml",
        qty: 2, tags: [],
        color: "#fce7f3",
        label: "CRM",
      },
      {
        id: 3, sku: "CSM-OIL-30",
        name: "Óleo Essencial Eucalipto 30ml",
        qty: 1, tags: ["frágil"],
        color: "#d1fae5",
        label: "ÓLE",
      },
    ],
    box: { name: "Caixa P (Padrão)", dim: "22 × 16 × 12 cm", fill: 64 },
    carrier: { name: "Jadlog Premium", svc: "Expresso aéreo · 24h", logo: "J", eta: "Entrega amanhã até 12h00", color: "#dc2626" },
    temperature: { city: "Salvador, BA", value: 31, condition: "Sol forte · UV alto", forecast: "Atenção a derretimento" },
  },
  "PED-73650": {
    code: "PED-73650",
    customer: "Renata Yoshida",
    city: "Porto Alegre · RS",
    placedAt: "Hoje, 08:51",
    priority: "normal",
    items: [
      {
        id: 1, sku: "VIN-MAL-750",
        name: "Vinho Tinto Malbec Reserva 750ml",
        qty: 2, tags: ["frágil"],
        color: "#fee2e2",
        label: "VIN",
      },
      {
        id: 2, sku: "QJO-PRM-180",
        name: "Queijo Parmesão Curado 180g",
        qty: 1, tags: ["refrigerado"],
        color: "#fef3c7",
        label: "QJO",
      },
      {
        id: 3, sku: "PAN-ITL-300",
        name: "Pão Italiano Artesanal 300g",
        qty: 1, tags: [],
        color: "#fde68a",
        label: "PÃO",
      },
      {
        id: 4, sku: "AZE-OLI-180",
        name: "Azeitonas Pretas Premium 180g",
        qty: 2, tags: [],
        color: "#a7f3d0",
        label: "OLI",
      },
    ],
    box: { name: "Caixa G (Vinhos)", dim: "38 × 28 × 22 cm", fill: 82 },
    carrier: { name: "Total Express", svc: "Padrão refrigerado", logo: "T", eta: "Entrega em 2 dias úteis", color: "#0f766e" },
    temperature: { city: "Porto Alegre, RS", value: 9, condition: "Frente fria · 78% umidade", forecast: "Condição ideal para vinho" },
  },
};

// Make available globally for app.jsx
window.ORDERS = ORDERS;
window.SUGGESTED_CODES = Object.keys(ORDERS);
