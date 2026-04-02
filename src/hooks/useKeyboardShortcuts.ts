import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignore if typing in input/textarea
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
      // Allow some shortcuts even when typing
      if (e.key === "Escape") {
        target.blur();
        return;
      }
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Common shortcuts for the app
export const commonShortcuts = [
  { key: "n", ctrl: true, action: () => window.dispatchEvent(new CustomEvent("new-chat")), description: "محادثة جديدة" },
  { key: "k", ctrl: true, action: () => window.dispatchEvent(new CustomEvent("open-search")), description: "بحث" },
  { key: "s", ctrl: true, action: () => window.dispatchEvent(new CustomEvent("toggle-sidebar")), description: "إظهار/إخفاء الشريط الجانبي" },
  { key: "m", ctrl: true, action: () => window.dispatchEvent(new CustomEvent("toggle-model")), description: "اختيار النموذج" },
  { key: "/", action: () => window.dispatchEvent(new CustomEvent("focus-input")), description: "كتابة رسالة" },
  { key: "Escape", action: () => window.dispatchEvent(new CustomEvent("close-modals")), description: "إغلاق النافذة" },
];
