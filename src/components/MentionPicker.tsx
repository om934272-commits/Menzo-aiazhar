import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AtSign, User, Search, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MentionUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MentionPickerProps {
  onSelect: (username: string, userId?: string) => void;
  onClose?: () => void;
  query?: string;
  excludeUserId?: string;
  className?: string;
}

export function MentionPicker({ onSelect, onClose, query = "", excludeUserId, className }: MentionPickerProps) {
  const [search, setSearch] = useState(query.replace("@", ""));
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const searchUsers = async () => {
      if (!search) {
        // Show all users when no search
        const { data } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .neq("id", excludeUserId || "")
          .order("display_name")
          .limit(10);
        
        if (data) setUsers(data as MentionUser[]);
        return;
      }

      // Search by name
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .ilike("display_name", `%${search}%`)
        .neq("id", excludeUserId || "")
        .order("display_name")
        .limit(10);

      if (data) setUsers(data as MentionUser[]);
    };

    searchUsers();
  }, [search, excludeUserId]);

  const filteredUsers = useMemo(() => {
    return users.slice(0, 8);
  }, [users]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredUsers.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredUsers[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    } else if (e.key === "Escape") {
      onClose?.();
    }
  };

  const handleSelect = (mentionUser: MentionUser) => {
    onSelect(`@${mentionUser.display_name || mentionUser.id}`, mentionUser.id);
    onClose?.();
  };

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (filteredUsers.length === 0) {
    return (
      <div className={cn("glass rounded-2xl p-4 text-center text-muted-foreground text-sm", className)}>
        لا توجد نتائج
      </div>
    );
  }

  return (
    <div 
      className={cn("glass rounded-2xl border border-border/40 w-72 max-h-64 overflow-hidden", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b border-border/30">
        <AtSign className="h-4 w-4 text-primary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن مستخدم..."
          className="flex-1 bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          autoFocus
        />
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Users List */}
      <div ref={listRef} className="max-h-48 overflow-y-auto custom-scrollbar p-1">
        {filteredUsers.map((mentionUser, idx) => (
          <button
            key={mentionUser.id}
            onClick={() => handleSelect(mentionUser)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-right",
              selectedIndex === idx ? "bg-primary/20" : "hover:bg-secondary"
            )}
          >
            {mentionUser.avatar_url ? (
              <img src={mentionUser.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {mentionUser.display_name || mentionUser.id}
              </p>
            </div>
            {idx === selectedIndex && (
              <span className="text-xs text-muted-foreground">اضغط Enter</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Hook for handling @ mentions in input
export function useMentions(input: string, cursorPosition: number) {
  const [mentionQuery, setMentionQuery] = useState<string>("");
  const [mentionRange, setMentionRange] = useState<{ start: number; end: number } | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Detect @ mention when typing
  useEffect(() => {
    const textBeforeCursor = input.slice(0, cursorPosition);
    const lastAt = textBeforeCursor.lastIndexOf("@");
    
    if (lastAt !== -1) {
      // Check if there's a space after @
      const textAfterAt = textBeforeCursor.slice(lastAt);
      const hasSpace = textAfterAt.includes(" ");
      
      if (!hasSpace && lastAt >= cursorPosition - 20) {
        setMentionQuery(textAfterAt.slice(1));
        setMentionRange({ start: lastAt, end: cursorPosition });
        setShowPicker(true);
      } else {
        setShowPicker(false);
      }
    } else {
      setShowPicker(false);
    }
  }, [input, cursorPosition]);

  const insertMention = (username: string, userId?: string) => {
    if (!mentionRange) return input;
    
    const before = input.slice(0, mentionRange.start);
    const after = input.slice(mentionRange.end);
    
    setShowPicker(false);
    return before + username + after;
  };

  return {
    query: mentionQuery,
    showPicker,
    insertMention,
    closePicker: () => setShowPicker(false),
  };
}

export default MentionPicker;
