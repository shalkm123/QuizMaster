
import { AlertCircle, Calendar, Eye, FileText, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from "react";

export default function McqsCards() {
  const [mcqsDocs, setMcqsDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      setError("No email found");
      setLoading(false);
      return;
    }

    // Simulating axios call for demo
    fetch(`/api/getMcqsbyEmail?email=${email}`)
      .then(res => res.json())
      .then((data) => {
        setMcqsDocs(data.mcqs || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch MCQs");
        setLoading(false);
      });
  }, []);

  const openMcqsInNewWindow = (doc) => {
    const newWindow = window.open("", "_blank", "width=800,height=600");
    const dateString = new Date(doc.createdAt).toLocaleDateString();

    const html = `
      <html>
        <head>
          <title>MCQs from ${dateString}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h2 { color: #333; }
            .question { background: #f5f5f5; padding: 10px; margin-bottom: 15px; border-radius: 6px; }
            ul { padding-left: 20px; }
            em { color: green; }
          </style>
        </head>
        <body>
          <h2>MCQs from ${dateString}</h2>
          ${doc.mcqs
            .map(
              (q, i) => `
            <div class="question">
              <p><strong>Q${i + 1}:</strong> ${q.question}</p>
              <ul>
                ${q.options.map((opt) => `<li>${opt}</li>`).join("")}
              </ul>
              <p><em>Answer: ${q.answer}</em></p>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    newWindow.document.write(html);
    newWindow.document.close();
  };

  // Filter MCQs based on search term
  const filteredMcqs = mcqsDocs.filter(doc => {
    const dateString = new Date(doc.createdAt).toLocaleDateString();
    return dateString.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your MCQs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading MCQs</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!mcqsDocs.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No MCQs Found</h2>
              <p className="text-gray-600 mb-6">
                You haven't generated any MCQs yet. Upload a PDF to get started!
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Generate MCQs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Test History</h1>
          <p className="text-gray-600">Click on any card to view and review your generated questions.</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total MCQ Sets</p>
                <p className="text-3xl font-bold text-gray-900">{mcqsDocs.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Questions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mcqsDocs.reduce((total, doc) => total + doc.mcqs.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Latest Set</p>
                <p className="text-lg font-bold text-gray-900">
                  {mcqsDocs.length > 0 
                    ? new Date(Math.max(...mcqsDocs.map(doc => new Date(doc.createdAt)))).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* MCQ Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMcqs.map(({ _id, createdAt, mcqs }) => {
            const dateString = new Date(createdAt).toLocaleDateString();
            const timeString = new Date(createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });

            return (
              <div
                key={_id}
                onClick={() => openMcqsInNewWindow({ _id, createdAt, mcqs })}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-indigo-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-all">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{timeString}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  MCQs from {dateString}
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{mcqs.length} questions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Click to view questions</p>
                  <div className="flex items-center space-x-1 text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">View</span>
                  </div>
                </div>

                {/* Preview of first question */}
                {mcqs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 truncate">
                      Preview: {mcqs[0].question.substring(0, 80)}...
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No results found */}
        {filteredMcqs.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">
                No MCQs found matching "{searchTerm}". Try a different search term.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
