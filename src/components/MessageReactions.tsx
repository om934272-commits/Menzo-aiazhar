import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Plus } from "lucide-react";

// WhatsApp-style reactions
const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "👍", "👎", "😡", "🙏", "🎉", "🤩", "😍", "🥰"];

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions?: Reaction[];
  onReact?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  className?: string;
}

export function MessageReactions({ messageId, reactions = [], onReact, onRemoveReaction, className }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectEmoji = (emoji: string) => {
    const existing = reactions.find(r => r.emoji === emoji);
    if (existing?.userReacted && onRemoveReaction) {
      onRemoveReaction(emoji);
    } else if (onReact) {
      onReact(emoji);
    }
    setShowPicker(false);
  };

  const displayReactions = showAll ? reactions : reactions.slice(0, 3);
  const hasReactions = reactions.length > 0;

  return (
    <div ref={pickerRef} className={cn("relative inline-flex items-center", className)}>
      {/* Existing Reactions */}
      {hasReactions && (
        <div 
          className="flex items-center gap-0.5"
          onClick={() => setShowPicker(true)}
        >
          {displayReactions.map((reaction, idx) => (
            <button
              key={reaction.emoji}
              onClick={(e) => {
                e.stopPropagation();
                if (reaction.userReacted && onRemoveReaction) {
                  onRemoveReaction(reaction.emoji);
                }
              }}
              className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-secondary/80 hover:bg-secondary transition-colors text-xs",
                reaction.userReacted && "bg-primary/20 border border-primary/30"
              )}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 1 && (
                <span className="text-muted-foreground">{reaction.count}</span>
              )}
            </button>
          ))}
          
          {/* Expand button */}
          {reactions.length > 3 && !showAll && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
              className="flex items-center px-1.5 py-0.5 rounded-full bg-secondary/80 hover:bg-secondary transition-colors text-xs text-muted-foreground"
            >
              +{reactions.length - 3}
            </button>
          )}
        </div>
      )}

      {/* Add Reaction Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full bg-secondary/50 hover:bg-secondary transition-colors",
          !hasReactions && "absolute -bottom-1 -right-1 border border-background bg-card"
        )}
      >
        {!hasReactions ? (
          <span className="text-xs">😀</span>
        ) : (
          <Plus className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

      {/* Reaction Picker */}
      {showPicker && (
        <div className="absolute bottom-full mb-2 left-0 glass rounded-2xl p-2 z-50 animate-scale-in">
          <div className="flex items-center gap-1 flex-wrap w-48 justify-center">
            {REACTION_EMOJIS.map((emoji) => {
              const existing = reactions.find(r => r.emoji === emoji);
              const count = existing?.count || 0;
              const userReacted = existing?.userReacted || false;
              
              return (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  className={cn(
                    "p-2 hover:bg-secondary rounded-lg text-xl transition-all hover:scale-125",
                    userReacted && "bg-primary/20"
                  )}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          
          {/* Close button */}
          <button
            onClick={() => setShowPicker(false)}
            className="absolute top-1 right-1 p-1 hover:bg-secondary rounded"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}

// Reaction Badge for showing in message list
export function ReactionBadge({ count, emoji }: { count: number; emoji: string }) {
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-xs">
      <span>{emoji}</span>
      {count > 1 && <span className="text-muted-foreground">{count}</span>}
    </div>
  );
}

export default MessageReactions;
