import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-text-primary">
              Welcome to{" "}
              <span className="font-normal text-text-primary">
                Portfolio Project
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl font-light text-text-secondary max-w-2xl mx-auto leading-relaxed">
              A scalable full-stack application template
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a
              href="/login"
              className="px-8 py-3.5 border border-border-subtle text-text-secondary rounded-lg 
                       hover:border-accent-primary/40 hover:text-text-primary transition-all duration-300 ease-out
                       bg-surface backdrop-blur-sm
                       hover:bg-surface-hover font-light text-sm tracking-wide"
            >
              Login
            </a>
            <a
              href="/upload"
              className="px-8 py-3.5 bg-accent-primary text-white rounded-lg
                       hover:bg-accent-secondary transition-all duration-300 ease-out
                       font-light text-sm tracking-wide"
            >
              Upload
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

