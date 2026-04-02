import { useCallback, useRef, useEffect, useState } from "react";

// Predefine notification sounds as base64 (simple beep sounds)
const sounds = {
  notification: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU", // Placeholder - would need actual audio
  message: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU",
  success: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU",
  error: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU",
};

interface NotificationSoundOptions {
  volume?: number;
  enabled?: boolean;
}

export function useNotificationSound(options: NotificationSoundOptions = {}) {
  const { volume = 0.5, enabled = true } = options;
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(async (type: keyof typeof sounds = "notification") => {
    if (!enabled) return;

    try {
      // Create audio context on first use
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      // Create oscillator for simple beep
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different frequencies for different sounds
      const frequencies = {
        notification: 800,
        message: 600,
        success: 1000,
        error: 400,
      };

      oscillator.frequency.setValueAtTime(frequencies[type], ctx.currentTime);
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (err) {
      console.warn("Could not play notification sound:", err);
    }
  }, [enabled, volume]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { playSound };
}

// Hook for managing notification preferences
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    desktopNotifications: false,
    soundVolume: 50,
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notification_preferences");
    if (saved) {
      try {
        setPreferences({ ...preferences, ...JSON.parse(saved) });
      } catch {}
    }
  }, []);

  // Save to localStorage
  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("notification_preferences", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { preferences, updatePreference };
}
