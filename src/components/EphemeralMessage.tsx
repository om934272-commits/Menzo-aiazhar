import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Clock, EyeOff, X, Check, AlertTriangle } from "lucide-react";

interface EphemeralMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  expiresIn: number; // seconds
  type: "view_once" | "timer" | "read";
}

interface EphemeralOptions {
  id?: string;
  type: "view_once" | "timer" | "read";
  duration?: number; // for timer type: seconds
  onExpire?: () => void;
  onScreenshot?: () => void;
}

interface EphemeralMessageProps {
  message: EphemeralMessage;
  isMine: boolean;
  onOpen?: () => void;
  onDelete?: () => void;
}

const FORMATTERS = {
  seconds: (s: number) => s,
  minutes: (s: number) => Math.floor(s / 60),
  hours: (s: number) => Math.floor(s / 3600),
  days: (s: number) => Math.floor(s / 86400),
};

function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) return `${seconds} ثانية`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ساعة`;
  return `${Math.floor(seconds / 86400)} يوم`;
}

export function EphemeralMessage({ message, isMine, onOpen, onDelete }: EphemeralMessageProps) {
  const [isOpen, setIsOpen] = useState(message.type !== "view_once");
  const [timeRemaining, setTimeRemaining] = useState(
    Math.max(0, new Date(message.expiresIn * 1000).getTime() - Date.now()) / 1000
  );
  const [isExpired, setIsExpired] = useState(timeRemaining <= 0);

  useEffect(() => {
    if (message.type === "view_once" && isOpen) return;
    if (message.type === "read") return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, new Date(message.expiresIn * 1000).getTime() - Date.now()) / 1000;
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [message.expiresIn, message.type, isOpen]);

  // Detect screenshot
  useEffect(() => {
    if (message.type !== "view_once") return;

    const detectScreenshot = () => {
      // This is a simplified detection - real implementation would use native APIs
      console.log("Screenshot attempted on ephemeral message:", message.id);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) detectScreenshot();
    });

    return () => {
      document.removeEventListener("visibilitychange", detectScreenshot);
    };
  }, [message.type, message.id]);

  const handleOpen = () => {
    if (message.type === "view_once" && !isOpen) {
      setIsOpen(true);
      onOpen?.();
    }
  };

  if (isExpired) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground text-sm", isMine && "justify-end")}>
        <AlertTriangle className="h-4 w-4" />
        <span>انتهت صلاحية الرسالة</span>
      </div>
    );
  }

  if (!isOpen && message.type === "view_once") {
    return (
      <div 
        onClick={handleOpen}
        className={cn(
          "relative group cursor-pointer",
          isMine ? "items-end" : "items-start"
        )}
      >
        <div className={cn(
          "glass rounded-2xl p-4 flex flex-col items-center gap-2",
          isMine ? "bg-primary/10" : "bg-secondary/50"
        )}>
          <EyeOff className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">اضغط للفتح</span>
          <span className="text-xs text-muted-foreground">مشاهدة واحدة فقط</span>
        </div>
      </div>
    );
  }

  if (message.type === "timer" || message.type === "read") {
    return (
      <div className={cn("group relative", isMine && "justify-end")}>
        <div className={cn(
          "glass rounded-2xl p-3 relative",
          isMine ? "bg-primary/10" : "bg-secondary/50"
        )}>
          {message.content}
          
          {/* Timer indicator */}
          {(message.type === "timer" || message.type === "read") && timeRemaining > 0 && (
            <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-card px-2 py-0.5 rounded-full text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimeRemaining(timeRemaining)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default - show content normally
  return (
    <div className={cn("group relative", isMine && "justify-end")}>
      {message.content}
    </div>
  );
}

// Ephemeral message composer
export function useEphemeralMessage(options: EphemeralOptions) {
  const [message, setMessage] = useState<{
    type: "view_once" | "timer" | "read";
    duration?: number;
    isEphemeral: boolean;
  }>({
    type: options.type,
    duration: options.duration,
    isEphemeral: !!options.type,
  });

  const setType = (type: "view_once" | "timer" | "read") => {
    setMessage(prev => ({ ...prev, type, isEphemeral: true }));
  };

  const setDuration = (duration: number) => {
    setMessage(prev => ({ ...prev, duration }));
  };

  const clearEphemeral = () => {
    setMessage({ type: "read", duration: undefined, isEphemeral: false });
  };

  return {
    ...message,
    setType,
    setDuration,
    clearEphemeral,
  };
}

// Ephemeral settings UI
export function EphemeralSettings({ onSelect }: { onSelect: (option: EphemeralOptions) => void }) {
  const [selectedType, setSelectedType] = useState<EphemeralOptions["type"]>("read");
  const [duration, setDuration] = useState(30); // seconds

  return (
    <div className="glass rounded-2xl p-4 w-72 space-y-4">
      <h3 className="font-bold text-foreground">رسائل مؤقتة</h3>

      {/* Type options */}
      <div className="space-y-2">
        <button
          onClick={() => setSelectedType("view_once")}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right",
            selectedType === "view_once" ? "bg-primary/20 border border-primary/30" : "hover:bg-secondary"
          )}
        >
          <EyeOff className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">مشاهدة واحدة</p>
            <p className="text-xs text-muted-foreground">تحذف بعد المشاهدة</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedType("timer")}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right",
            selectedType === "timer" ? "bg-primary/20 border border-primary/30" : "hover:bg-secondary"
          )}
        >
          <Clock className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">مؤقت</p>
            <p className="text-xs text-muted-foreground">تحذف بعد مدة معينة</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedType("read")}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-right",
            selectedType === "read" ? "bg-primary/20 border border-primary/30" : "hover:bg-secondary"
          )}
        >
          <Check className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">عادية</p>
            <p className="text-xs text-muted-foreground">رسالة عادية</p>
          </div>
        </button>
      </div>

      {/* Duration selection for timer */}
      {selectedType === "timer" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">مدة الصلاحية</p>
          <div className="grid grid-cols-3 gap-2">
            {[30, 60, 300].map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  "p-2 rounded-lg text-sm transition-colors",
                  duration === d ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                )}
              >
                {formatTimeRemaining(d)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Apply button */}
      <button
        onClick={() => onSelect({ type: selectedType, duration: selectedType === "timer" ? duration : undefined })}
        className="w-full bg-primary text-primary-foreground rounded-xl py-2"
      >
        تطبيق
      </button>
    </div>
  );
}

export default EphemeralMessage;
