"use client";

import { useEffect } from "react";

// O iOS Safari ignora `user-scalable=no` / `maximum-scale` no viewport por
// acessibilidade, então o CSS `touch-action` sozinho não basta. A estação de
// embalagem roda em aparelho fixo e o zoom desalinha a operação, então aqui
// cancelamos explicitamente os gestos de zoom do WebKit e o double-tap.
const DOUBLE_TAP_MAX_INTERVAL_MS = 300;

export default function DisableZoom() {
  useEffect(() => {
    const preventGesture = (event: Event) => event.preventDefault();

    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    let lastTouchEndTime = 0;
    const preventDoubleTap = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEndTime <= DOUBLE_TAP_MAX_INTERVAL_MS) {
        event.preventDefault();
      }
      lastTouchEndTime = now;
    };

    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("gesturechange", preventGesture);
    document.addEventListener("gestureend", preventGesture);
    document.addEventListener("touchmove", preventMultiTouch, {
      passive: false,
    });
    document.addEventListener("touchend", preventDoubleTap, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
      document.removeEventListener("touchmove", preventMultiTouch);
      document.removeEventListener("touchend", preventDoubleTap);
    };
  }, []);

  return null;
}
