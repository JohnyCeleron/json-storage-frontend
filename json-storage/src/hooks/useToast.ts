import { useCallback, useEffect, useRef, useState } from "react";
import { TOAST_TIMINGS } from "../constants/ui";

export type ToastState = {
  message: string;
  type?: "error" | "success";
  fading?: boolean;
} | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    fadeTimerRef.current = null;
    hideTimerRef.current = null;
  };

  useEffect(() => clearTimers, []);

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    clearTimers();
    setToast({ message, type });

    fadeTimerRef.current = window.setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, fading: true } : prev));
    }, TOAST_TIMINGS.VISIBLE_MS);

    hideTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, TOAST_TIMINGS.VISIBLE_MS + TOAST_TIMINGS.FADE_MS);
  }, []);

  return { toast, showToast };
}
