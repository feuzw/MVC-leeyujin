"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 인증 상태 확인 후 리다이렉트
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  // 로그인되어 있으면 리다이렉트 중 표시
  if (token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // 로그인 안 되어 있으면 랜딩 페이지
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Glass morphism header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">Admin</div>
          <button
            onClick={() => router.push("/login")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg",
              "bg-foreground text-background",
              "hover:opacity-90 transition-opacity",
              "shadow-sm"
            )}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Hero section */}
          <div className="text-center space-y-8 mb-20">
            <div
              className={cn(
                "inline-block px-4 py-2 rounded-full",
                "bg-muted/50 border border-border/50",
                "text-sm text-muted-foreground",
                "backdrop-blur-sm"
              )}
            >
              Portfolio Admin Dashboard
            </div>

            <h1
              className={cn(
                "text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
                "bg-clip-text text-transparent bg-gradient-to-r",
                "from-foreground to-foreground/60"
              )}
            >
              Modern Admin
              <br />
              <span className="text-foreground/80">Dashboard</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Elegant, powerful, and intuitive admin interface built with
              Next.js, TypeScript, and modern design principles.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => router.push("/login")}
                className={cn(
                  "px-8 py-3 text-base font-medium rounded-lg",
                  "bg-foreground text-background",
                  "hover:opacity-90 transition-all",
                  "shadow-lg hover:shadow-xl",
                  "transform hover:scale-[1.02]"
                )}
              >
                Get Started
              </button>
              <button
                onClick={() => router.push("/login")}
                className={cn(
                  "px-8 py-3 text-base font-medium rounded-lg",
                  "border border-border bg-background/50",
                  "hover:bg-muted/50 transition-all",
                  "backdrop-blur-sm"
                )}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-32">
            {[
              {
                title: "Fast & Secure",
                description:
                  "Built with Next.js App Router for optimal performance and security.",
                icon: "⚡",
              },
              {
                title: "Modern UI",
                description:
                  "Apple-inspired design with subtle animations and glass morphism.",
                icon: "✨",
              },
              {
                title: "Feature-Based",
                description:
                  "Scalable architecture that grows with your needs.",
                icon: "🚀",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 rounded-xl border border-border/50",
                  "bg-background/50 backdrop-blur-sm",
                  "hover:bg-muted/30 transition-all",
                  "hover:shadow-lg hover:border-border",
                  "group"
                )}
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-32">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2024 Portfolio Admin. Built with Next.js & TypeScript.
          </div>
        </div>
      </footer>
    </div>
  );
}

