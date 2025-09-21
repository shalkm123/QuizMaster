import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      {/* Header */}
      <header className="pt-8 pb-4">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome To Quiz<span className="text-blue-400">Master</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Hero Section */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl text-gray-200 mb-6 font-light">
              Transform Your PDFs into Interactive Quizzes
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Upload any PDF document and let our AI generate personalized multiple-choice questions. 
              Perfect for studying, training, and knowledge assessment.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-400">Smart question generation from your documents</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-white mb-2">PDF Upload</h3>
              <p className="text-gray-400">Support for any PDF document format</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Results</h3>
              <p className="text-gray-400">Get your quiz scores and feedback immediately</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
                Get Started
              </button>
            </Link>

            <Link href="/signup">
              <button className="bg-transparent border-2 border-gray-400 text-gray-300 hover:border-white hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 QuizMaster. Powered by AI technology.
          </p>
        </div>
      </footer>
    </div>
  );
}
