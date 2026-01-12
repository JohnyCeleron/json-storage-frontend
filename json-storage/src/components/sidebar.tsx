import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ToastState } from "../hooks/useToast";
import { TOAST_TIMINGS } from "../constants/ui";
import { apiCreateNamespace, apiFetchNamespaces } from "../api/documents";


export async function getNamespaces(): Promise<string[]> {
  return await apiFetchNamespaces();
}

export async function addNamespace(rawName: string, existsNamespaces: Set<string> | null = null): Promise<string[]> {
  const name = rawName.trim();
  if (!name)
    throw new Error("Namespace name is empty");

  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    throw new Error("Only letters, numbers, '-' and '_' are allowed");
  }
  if (name.startsWith('_') || name.startsWith('+') || name.startsWith('-')) {
    throw new Error("Namespace must not start with '-', '+' or '_'");
  }

  if (existsNamespaces !== null && existsNamespaces.has(name.toLowerCase())) {
    throw new Error("Namespace already exists");
  }
  
  return await apiCreateNamespace(name);
}

export function Sidebar({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={sidebarRef} className={`sidebar-container ${isVisible ? "" : "sidebar-hidden"}`}>
      <div className="sidebar-top">
        <button className="close-button" onClick={onClose}>
          <span className="close-glyph">+</span>
        </button>
      </div>

      <div className="sidebar-bottom">
        <Button title="Metrics" onClick={() => navigate("/metrics")} />
        <Button title="Logs" onClick={() => navigate("/logs")} />
        <NamespacesButton sidebarRef={sidebarRef} />
      </div>
    </div>
  );
}

function NamespacesButton({ sidebarRef }: { sidebarRef: React.RefObject<HTMLDivElement> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen((v) => !v);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getNamespaces()
      .then((items) => {
        if (!cancelled) setNamespaces(items);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load namespaces");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const onAdd = async () => {
    const value = newName.trim();
    if (!value) return;

    setError(null);
    setIsAdding(true);
    try {
      setIsLoading(true);
      const updated = await addNamespace(value, new Set(namespaces));
      setNewName("");
      setNamespaces(updated);
    } catch (e: any) {
      setError(e?.message ?? "Failed to add namespace");
      setNamespaces(namespaces);
    } finally {
      setIsAdding(false);
      setNewName("");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!isOpen) return;

      const sidebarEl = sidebarRef.current;
      if (!sidebarEl) return;

      const target = event.target as Node;
      const clickInsideSidebar = sidebarEl.contains(target);

      if (!clickInsideSidebar) {
        event.stopPropagation();
        (event as any).stopImmediatePropagation?.();

        if (!isAdding && newName.trim()) {
          void onAdd();
        }

        return;
      }
    };

    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [isOpen, newName, isAdding, sidebarRef]);
// eslint-disable-line react-hooks/exhaustive-deps

  const fadeTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearToastTimers = () => {
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    fadeTimerRef.current = null;
    hideTimerRef.current = null;
  };

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
      clearToastTimers();
      setToast({ message, type });
  
      fadeTimerRef.current = window.setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, fading: true } : prev));
      }, TOAST_TIMINGS.VISIBLE_MS);
  
      hideTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, TOAST_TIMINGS.VISIBLE_MS + TOAST_TIMINGS.FADE_MS);
    }, []);

  useEffect(() => {
    if (error) {
      showToast(error);
    }
  }, [error, showToast]);
  

  return (
    <div className="namespaces-container">
      <button type="button" className="sidebar-button" onClick={toggleDropdown}>
        Namespaces
      </button>

      {isOpen && (
        <div className="namespaces-dropdown">
          <div className="namespace-add-row">
            <input
              className="namespace-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="new-namespace"
              onKeyDown={(e) => {
                if (e.key === "Enter") onAdd();
              }}
              disabled={isAdding}
            />
          </div>
          {toast && (
            <div
              className={`toast toast--top ${toast.type ?? "error"} ${
                toast.fading ? "toast--fadeout" : ""
              }`}
            >
              {toast.message}
            </div>
          )}

          <div className="scrollable-section">
            {isLoading ? (
              <div className="namespace-loading">Loading...</div>
            ) : (
              <div className="scrollable-content">
                {namespaces.map((namespace) => (
                  <button
                    key={namespace}
                    className="namespace-item"
                    onClick={() => navigate(`/namespaces/${namespace}`)}
                  >
                    {namespace}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Button({ title, onClick }: { title: string; onClick?: () => void }) {
  return (
    <button type="button" className="sidebar-button" onClick={onClick}>
      {title}
    </button>
  );
}
