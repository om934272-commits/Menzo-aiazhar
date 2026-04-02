import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-[150px] font-bold text-gradient-cosmic leading-none">404</h1>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-primary/20 rounded-full blur-xl" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-4">الصفحة غير موجودة</p>
        </div>

        {/* Message */}
        <div className="glass rounded-2xl p-8 mb-6">
          <p className="text-muted-foreground mb-4">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
          </p>
          <p className="text-sm text-muted-foreground">
            يمكنك العودة للصفحة الرئيسية أو محاولة البحث عن ما تريده.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> العودة للخلف
          </Button>
          <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 shadow-glow">
            <Home className="h-4 w-4" /> الصفحة الرئيسية
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={() => navigate("/chat")} className="glass rounded-xl p-4 hover:border-primary/40 transition-colors">
            <div className="text-2xl mb-1">💬</div>
            <p className="text-xs text-muted-foreground">المحادثة</p>
          </button>
          <button onClick={() => navigate("/messages")} className="glass rounded-xl p-4 hover:border-primary/40 transition-colors">
            <div className="text-2xl mb-1">✉️</div>
            <p className="text-xs text-muted-foreground">الرسائل</p>
          </button>
          <button onClick={() => navigate("/forum")} className="glass rounded-xl p-4 hover:border-primary/40 transition-colors">
            <div className="text-2xl mb-1">👥</div>
            <p className="text-xs text-muted-foreground">المنتدى</p>
          </button>
          <button onClick={() => navigate("/books")} className="glass rounded-xl p-4 hover:border-primary/40 transition-colors">
            <div className="text-2xl mb-1">📚</div>
            <p className="text-xs text-muted-foreground">الكتب</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
