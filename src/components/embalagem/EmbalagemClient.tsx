"use client";

import { useEffect, useRef, useState } from "react";
import { Toast, toast } from "@heroui/react";
import type { OperatorStats, ScannedOrder, ToastKind } from "@/types";
import {
  abrirEmbalagem,
  cancelarEmbalagem,
  clearSession,
  enviarHeartbeat,
  fetchOperatorStats,
  finalizarEmbalagem,
  getSession,
  liberarEstacao,
  type EmbaleiSession,
} from "@/lib/api";
import { TopBar } from "./TopBar";
import { ScanStrip } from "./ScanStrip";
import { EmptyState } from "./EmptyState";
import { OrderDetail } from "./OrderDetail";
import { OrderLoading } from "./OrderLoading";
import { OrderNotFound } from "./OrderNotFound";

// Guard de auth e logout do quiosque usam navegação "dura" (window.location)
// em vez do router do App Router: redirect num efeito remontado pelo Strict
// Mode aborta a transição do router (InvalidStateError) — e aqui sair da tela
// deve resetar o estado por completo de qualquer forma.
function leaveToLogin() {
  window.location.replace("/");
}

export function EmbalagemClient() {
  const [session, setSession] = useState<EmbaleiSession | null>(null);
  const [order, setOrder] = useState<ScannedOrder | null>(null);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [scanning, setScanning] = useState(false);
  const [scannedKey, setScannedKey] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  // Contagem de bipagens de caixa após o pedido abrir. Cada bip soma 1; a
  // embalagem só é registrada quando o operador bipa a NF-e novamente (2º
  // bipe da chave da nota). Não há finalização automática por contagem.
  const [boxScanCount, setBoxScanCount] = useState(0);
  const [finalizing, setFinalizing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // Total de pedidos / itens embalados hoje pelo operador — atualizado a cada
  // novo bip de NF-e e quando a sessão monta. "0/0" enquanto a 1ª resposta
  // não chega.
  const [operatorStats, setOperatorStats] = useState<OperatorStats>({
    orderCount: 0,
    unitCount: 0,
  });

  // Sem sessão (estação ocupada no login) não há o que embalar — volta ao login.
  useEffect(() => {
    const stored = getSession();
    if (!stored) {
      leaveToLogin();
      return;
    }
    setSession(stored);
  }, []);

  // Carrega as estatísticas do dia ao montar; depois disso, cada bipagem
  // bem-sucedida traz o valor atualizado dentro da resposta do pedido.
  useEffect(() => {
    if (!session) return;
    fetchOperatorStats(session.workstationId)
      .then(setOperatorStats)
      .catch(() => {
        /* rede indisponível — header mostra 0/0 até a próxima bipagem */
      });
  }, [session]);

  // Heartbeat: enquanto a estação está em uso, registra atividade no backend
  // no intervalo configurado. A estação só é liberada no logout (SAIR).
  useEffect(() => {
    if (!session) return;
    enviarHeartbeat(session.workstationId);
    const intervalMs = Math.max(5, session.heartbeatIntervalSeconds) * 1000;
    const timer = setInterval(() => {
      enviarHeartbeat(session.workstationId);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [session]);

  const exiting = useRef(false);

  // Defere o reset do pedido para o próximo tick. Sem isso, react-aria/pressable
  // dispara "InvalidStateError: Transition was aborted because of invalid state"
  // porque o botão Cancelar (e o Input do ScanStrip) podem estar no meio de uma
  // transição de press/focus quando `setOrder(null)` os desmonta/troca de modo.
  const resetOrderState = () => {
    setTimeout(() => {
      setOrder(null);
      setPicks({});
      setBoxScanCount(0);
    }, 0);
  };

  const pushToast = (msg: string, kind: ToastKind = "") => {
    const opts = { timeout: 2400 };
    if (kind === "success") toast.success(msg, opts);
    else if (kind === "warn") toast.warning(msg, opts);
    else if (kind === "error") toast.danger(msg, opts);
    else toast(msg, opts);
  };

  // A chave de acesso da NF-e tem 44 dígitos — distingue "bipar o pedido"
  // (consulta a IDWorks) de "bipar um item" (confere SKU do pedido aberto).
  const isChaveAcesso = (code: string) => /^\d{44}$/.test(code);

  const abrir = async (chaveAcesso: string) => {
    if (!session || scanning) return;
    setScannedKey(chaveAcesso);
    setScanError(null);
    setScanning(true);
    setBoxScanCount(0);
    try {
      const carregado = await abrirEmbalagem({
        workstationId: session.workstationId,
        chaveAcesso,
      });
      setOrder(carregado);
      setOperatorStats(carregado.operatorStats);
      const initial: Record<string, number> = {};
      carregado.items.forEach((item) => {
        initial[item.idSku] = item.quantity;
      });
      setPicks(initial);
      if (carregado.alreadyPacked && carregado.packedBy) {
        const estacao = carregado.packedBy.workstationName
          ? ` (${carregado.packedBy.workstationName})`
          : "";
        pushToast(
          `Pedido ${carregado.numPedido} JÁ FOI EMBALADO por ${carregado.packedBy.username}${estacao}`,
          "warn"
        );
      } else if (carregado.session.status === "open" && !carregado.session.isMine) {
        pushToast(
          `Pedido ${carregado.numPedido} em embalagem por ${carregado.session.busyBy ?? "outro operador"}`,
          "warn"
        );
      } else {
        pushToast(
          `Pedido ${carregado.numPedido} aberto · bipe ${carregado.volumeCount} volume(s) e a NF-e para finalizar`,
          "success"
        );
      }
    } catch (error: unknown) {
      setScanError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o pedido."
      );
    } finally {
      setScanning(false);
    }
  };

  const finalizar = async () => {
    if (!session || !order || finalizing) return;
    if (order.alreadyPacked || !order.session.isMine) {
      pushToast("Sessão não está aberta neste operador.", "error");
      return;
    }
    setFinalizing(true);
    pushToast(
      `Fechando embalagem do pedido ${order.numPedido}…`,
      "warn"
    );
    try {
      const result = await finalizarEmbalagem({
        workstationId: session.workstationId,
        chaveAcesso: order.chaveAcesso,
        volumeCount: boxScanCount,
      });
      setOperatorStats(result.operatorStats);
      pushToast(
        `Pedido ${order.numPedido} embalado · ${boxScanCount} volume(s)`,
        "success"
      );
      resetOrderState();
      // Garante que o TopBar reflita o estado mais atual do banco após o
      // fechamento (defesa em profundidade: se a resposta do finalizar trouxer
      // contagem defasada por qualquer race, esta chamada corrige).
      fetchOperatorStats(session.workstationId)
        .then(setOperatorStats)
        .catch(() => {
          /* falha de rede — o próximo bipe atualiza */
        });
    } catch (error: unknown) {
      pushToast(
        error instanceof Error ? error.message : "Falha ao finalizar a embalagem.",
        "error"
      );
    } finally {
      setFinalizing(false);
    }
  };

  const handleCancel = async () => {
    if (!session || !order || cancelling) return;
    if (!order.session.isMine) {
      // Sessão de outro operador — só limpa a tela.
      resetOrderState();
      return;
    }
    setCancelling(true);
    try {
      await cancelarEmbalagem({
        workstationId: session.workstationId,
        numPedido: order.legacyNumPedido,
      });
      pushToast(`Embalagem do pedido ${order.numPedido} cancelada.`, "warn");
      resetOrderState();
    } catch (error: unknown) {
      pushToast(
        error instanceof Error ? error.message : "Falha ao cancelar a embalagem.",
        "error"
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleScan = (code: string) => {
    if (finalizing || cancelling) {
      pushToast("Aguarde o término da operação atual…", "warn");
      return;
    }
    if (isChaveAcesso(code)) {
      // 2º bipe da MESMA NF-e: finaliza a sessão aberta.
      if (order && code === order.chaveAcesso) {
        void finalizar();
        return;
      }
      // Bipou uma NF-e diferente com sessão aberta: bloqueia (operador precisa
      // finalizar ou cancelar antes de abrir outra).
      if (order && order.session.isMine && !order.alreadyPacked) {
        pushToast(
          "Finalize ou cancele a embalagem atual antes de bipar outra NF-e.",
          "error"
        );
        return;
      }
      void abrir(code);
      return;
    }
    if (!order) {
      pushToast("Bipe a chave de acesso da NF-e do pedido.", "error");
      return;
    }
    if (order.alreadyPacked || !order.session.isMine) {
      pushToast("Sessão não está aberta neste operador.", "warn");
      return;
    }
    const nextCount = boxScanCount + 1;
    setBoxScanCount(nextCount);
    const totalVolumes = Math.max(order.volumeCount, 1);
    pushToast(`Caixa ${nextCount}/${totalVolumes} bipada`, "success");
  };

  const handlePickItem = (idSku: string) => {
    if (!order) return;
    const item = order.items.find((i) => i.idSku === idSku);
    if (!item) return;
    setPicks((p) => ({
      ...p,
      [idSku]: Math.min(item.quantity, (p[idSku] || 0) + 1),
    }));
  };

  const handleReset = () => {
    setScanError(null);
    resetOrderState();
  };

  const handleExit = async () => {
    if (exiting.current || !session) return;
    exiting.current = true;
    pushToast("Encerrando sessão…", "warn");
    try {
      await liberarEstacao(session.workstationId);
    } finally {
      clearSession();
      leaveToLogin();
    }
  };

  if (!session) return null;

  return (
    <>
      <TopBar
        orderCode={order?.numPedido ?? null}
        stationName={session.workstationName}
        operatorName={session.username}
        operatorStats={operatorStats}
        onExit={handleExit}
        onReset={handleReset}
      />
      <div className="stage">
        <ScanStrip
          onScan={handleScan}
          hasOrder={!!order}
          boxScanCount={boxScanCount}
          volumeCount={order?.volumeCount ?? 0}
          scannerVariant="a"
        />
        {order && order.session.isMine && !order.alreadyPacked && (
          <div className="embalagem-actions">
            <button
              type="button"
              className="btn-cancelar-embalagem"
              onClick={handleCancel}
              disabled={cancelling || finalizing}
            >
              {cancelling ? "Cancelando…" : "Cancelar embalagem"}
            </button>
          </div>
        )}
        {finalizing ? (
          <OrderLoading code={order?.chaveAcesso ?? null} mode="finalizando" />
        ) : scanning ? (
          <OrderLoading code={scannedKey} mode="buscando" />
        ) : scanError ? (
          <OrderNotFound message={scanError} code={scannedKey} />
        ) : order ? (
          <OrderDetail order={order} picks={picks} onPick={handlePickItem} />
        ) : (
          <EmptyState />
        )}
      </div>
      <Toast.Provider placement="bottom" />
    </>
  );
}
