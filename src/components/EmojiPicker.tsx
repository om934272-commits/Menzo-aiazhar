import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Recent, Smile, Heart, Animals, Food, Activity, Travel, Objects, Symbols, Flags } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  className?: string;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  { id: "recent", name: "الأخيرة", icon: <Recent className="h-4 w-4" />, emojis: [] },
  { id: "smileys", name: "ابتسامات", icon: <Smile className="h-4 w-4" />, emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕"] },
  { id: "hearts", name: "قلوب", icon: <Heart className="h-4 w-4" />, emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "😻", "💌", "💍", "💎", "🎁", "🌹", "🌷", "🌸", "💐"] },
  { id: "animals", name: "حيوانات", icon: <Animals className="h-4 w-4" />, emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐆", "🐅", "🐃", "🐂", "🐄", "🦬", "🦣", "🦫", "🦦", "🦥", "🐘", "🦧"] },
  { id: "food", name: "طعام", icon: <Food className="h-4 w-4" />, emojis: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🫓", "🌮", "🌯", "🫔", "🥙", "🥚", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍹", "🧉", "🍾", "🧊"] },
  { id: "activity", name: "أنشطة", icon: <Activity className="h-4 w-4" />, emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "🤺", "⛹️", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉", "🎖️", "🏅", "🎪", "🤹", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎲", "♟️", "🎯", "🎳", "🎮️", "🎰"] },
  { id: "travel", name: "سفر", icon: <Travel className="h-4 w-4" />, emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🛺", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚉", "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🪝", "⛽", "🚧", "🚦", "🚥", "🗺️", "🗿", "🗽", "🗼", "🏰", "🗿", "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏔️", "🗻", "🌋", "🗻", "🏔️", "⛰️", "🏕️", "⛺", "🛖", "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🛕", "🕌", "🕍", "🕋", "⛩️"] },
  { id: "objects", name: "أشياء", icon: <Objects className="h-4 w-4" />, emojis: ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🪛", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪚", "🔩", "⚙️", "🪤", "🕸️", "🧲", "🪣", "🧴", "🛎️", "🔑", "🗝️", "🚪", "🪑", "🛋️", "🛏️", "🛌", "🧸", "🪆", "🖼️", "🪞", "🪟", "🛍️", "🛒", "🎁", "🎈", "🎏", "🎀", "🪄", "🪅", "🎊", "🎉", "🎎", "🎐", "🏮", "🎍", "🪭", "🎎", "🎏", "🎌", "🗺️", "🧭", "🔇", "🔈", "🔉", "🔊", "📢", "📣", "💬", "💭", "🗯️", "♟️", "♠️", "♣️", "♥️", "♦️", "🎴", "🃏", "🀄", "🎰", "🧧", "🎲", "🧸", "🪄", "🧩", "🧪", "🧫", "🧬", "🔬", "🔭", "📱", "💊", "💉", "🩸", "🩹", "🩺", "🩻", "🩼", "🩿", "🩽"] },
  { id: "symbols", name: "رموز", icon: <Symbols className="h-4 w-4" />, emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "✅", "❌", "❓", "❗", "‼️", "⁉️", "💯", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🔺", "🔻", "🔸", "🔹", "🔶", "🔷", "💠", "🔘", "🔳", "🔲", "▪️", "▫️", "◾", "◽", "◼️", "◻️", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛", "⬜", "🟫", "🔈", "🔉", "🔊", "🔇", "🔔", "🔕", "🔕", "📣", "💬", "💭", "🗯️", "♠️", "♣️", "♥️", "♦️", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳", "🈶", "🈚️", "🈸", "🈺", "🈷️", "✴️", "🆚", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘", "❇️", "❎", "✅", "💮", "🕴️", "🗘️", "💯", "🔝", "🔜", "🈁", "🈷️", "🈵", "🈹", "🈲", "🅱️", "🈺", "🈚️"] },
];

// Recent emojis from localStorage
const getRecentEmojis = (): string[] => {
  try {
    const recent = localStorage.getItem("recent_emojis");
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
};

const saveRecentEmoji = (emoji: string) => {
  const recent = getRecentEmojis();
  const filtered = recent.filter(e => e !== emoji);
  const updated = [emoji, ...filtered].slice(0, 24);
  localStorage.setItem("recent_emojis", JSON.stringify(updated));
};

export function EmojiPicker({ onSelect, onClose, className }: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentEmojis(getRecentEmojis());
  }, []);

  const filteredEmojis = useMemo(() => {
    if (search) {
      // Simple search - just filter by any emoji that matches
      const allEmojis = EMOJI_CATEGORIES.flatMap(c => c.emojis);
      return allEmojis.filter(e => e.includes(search));
    }
    
    if (activeCategory === "recent") {
      return recentEmojis;
    }
    
    const category = EMOJI_CATEGORIES.find(c => c.id === activeCategory);
    return category?.emojis || [];
  }, [search, activeCategory, recentEmojis]);

  const handleSelect = (emoji: string) => {
    saveRecentEmoji(emoji);
    onSelect(emoji);
  };

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  return (
    <div className={cn("glass rounded-2xl border border-border/40 w-80 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b border-border/30">
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن إيموجي..."
          className="flex-1 bg-secondary/50 rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1 p-2 border-b border-border/30 overflow-x-auto scrollbar-hide">
        {EMOJI_CATEGORIES.filter(c => c.id !== "recent" || recentEmojis.length > 0).map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              activeCategory === category.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {category.icon}
          </button>
        ))}
      </div>

      {/* Emojis Grid */}
      <div className="p-2 h-64 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-8 gap-1">
          {filteredEmojis.length === 0 ? (
            <div className="col-span-8 text-center py-8 text-muted-foreground text-sm">
              لا توجد نتائج
            </div>
          ) : (
            filteredEmojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                onClick={() => handleSelect(emoji)}
                className="p-2 hover:bg-secondary rounded-lg text-xl transition-colors"
              >
                {emoji}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EmojiPicker;
