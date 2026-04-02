import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="glass rounded-2xl p-8">
              <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">حدث خطأ ما</h1>
              <p className="text-muted-foreground mb-6">
                عذراً، يبدو أن هناك مشكلة تقنية. يمكنك محاولة إعادة الصفحة أو العودة للرئيسية.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => window.location.reload()} className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" /> إعادة تحميل الصفحة
                </Button>
                <Button onClick={() => { this.setState({ hasError: false }); }} variant="outline" className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" /> محاولة مرة أخرى
                </Button>
                <Button onClick={() => window.location.href = "/"} variant="ghost" className="w-full gap-2">
                  <Home className="h-4 w-4" /> الصفحة الرئيسية
                </Button>
              </div>
              {this.state.error && (
                <details className="mt-4 text-right">
                  <summary className="text-xs text-muted-foreground cursor-pointer">تفاصيل الخطأ</summary>
                  <pre className="mt-2 text-[10px] text-muted-foreground bg-black/30 p-2 rounded overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
