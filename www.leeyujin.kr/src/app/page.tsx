export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Portfolio Project
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A scalable full-stack application template
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/login"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Login
            </a>
            <a
              href="/upload"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Upload
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

