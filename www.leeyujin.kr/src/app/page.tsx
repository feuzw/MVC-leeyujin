export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Fast & Modern</h3>
            <p className="text-gray-600">
              Built with Next.js 14 and TypeScript for optimal performance
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Scalable Architecture</h3>
            <p className="text-gray-600">
              Microservices architecture with Spring Boot and FastAPI
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Integrated AI services for intelligent features
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

