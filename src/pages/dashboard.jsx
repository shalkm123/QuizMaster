
'use client';
import axios from 'axios';
import { CheckCircle, CreditCard, FileText, History, Sparkles, Ticket, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import CryptoJS from "crypto-js";

export default function Dashboard() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [mcqCount, setMcqCount] = useState('');
  const [authorized, setAuthorized] = useState(true); // assumed already authenticated via middleware
  const [tickets, setTickets] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [email, setEmail] = useState(null);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Load email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    setEmail(storedEmail);
    setStorageLoaded(true);
  }, []);

  // Redirect if email is missing
  useEffect(() => {
    if (storageLoaded && !email) {
      router.replace('/login');
    }
  }, [storageLoaded, email]);

  // Fetch user's ticket count
  useEffect(() => {
    if (!storageLoaded || !email) return;

    axios
      .get(`/api/getUserTickets?email=${email}`)
      .then(({ data }) => setTickets(data.tickets))
      .catch(err => console.error('Error fetching tickets:', err));
  }, [storageLoaded, email]);

  useEffect(() => {
    // Push current page to history stack
    window.history.pushState(null, null, window.location.pathname)
    
    const handleBackButton = () => {
      // When back is pressed, push forward again
      window.history.pushState(null, null, window.location.pathname)
    }

    // Listen for back button press
    window.addEventListener('popstate', handleBackButton)

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleBackButton)
    }
  }, [])

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('Please upload a valid PDF file.');
        setFile(null);
      }
    }
  };

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid PDF file.');
      setFile(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (tickets <= 0) return alert('You need tickets to generate MCQs!');
    if (!file || !mcqCount || isNaN(mcqCount) || mcqCount <= 0) return alert('Invalid inputs.');

    if (!email) {
      alert('Please log in again.');
      return router.replace('/login');
    }

    setGenerating(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mcqCount', mcqCount);

    try {
      const { data } = await axios.post('/api/generateMcq', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await axios.post(`/api/deductTicket?email=${email}`);
      const encryptedMcqs = CryptoJS.AES.encrypt(JSON.stringify(data.mcqs), process.env.NEXT_PUBLIC_MCQSECRET).toString();
      localStorage.setItem("mcqs", encryptedMcqs);
      //localStorage.setItem('mcqs', JSON.stringify(data.mcqs));
      router.replace('/test');
    } catch (err) {
      console.error('MCQ error:', err);
      alert(err.response?.data?.error || 'Failed to generate MCQs.');
    } finally {
      setGenerating(false);
    }
  };

  const handleBuyTickets = async () => {
    if (!email) {
      alert('Please log in again.');
      return router.replace('/login');
    }

    setLoading(true);
    try {
      const { data: order } = await axios.post('/api/createOrder');
      new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'QuizMaster',
        description: '30 Tickets Package',
        order_id: order.id,
        handler: async resp => {
          try {
            const { data: verify } = await axios.post('/api/verifyPayment', { ...resp, email });
            setTickets(verify.tickets);
            alert('Payment successful!');
          } catch {
            alert('Payment verification failed.');
          }
        },
        prefill: { email },
        theme: { color: '#6366f1' },
      }).open();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = () => router.push('/history');

  // Show loading while checking authentication
  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render anything (will redirect)
  if (authorized === false) {
    return null;
  }

  // Show loading while storage is being loaded
  if (!storageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">


        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Upload a PDF document to generate multiple choice questions instantly.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Upload Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Generate MCQs</h3>
                      <p className="text-sm text-gray-500">Upload your PDF and specify question count</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload PDF Document
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragActive
                          ? 'border-indigo-400 bg-indigo-50'
                          : file
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      {file ? (
                        <div className="space-y-2">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                          <p className="text-green-700 font-medium">{file.name}</p>
                          <p className="text-sm text-green-600">Ready to generate MCQs</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-gray-600 font-medium">
                            Drop your PDF here or click to browse
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports PDF files up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MCQ Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      value={mcqCount}
                      onChange={(e) => setMcqCount(e.target.value)}
                      placeholder="Enter number of MCQs (e.g., 20)"
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    type="submit"
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" />
                        <span>Generating MCQs...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate MCQs</span>
                      </>
                    )}
                  </button>

                  {tickets <= 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-700 text-sm">
                        ⚠️ You need tickets to generate MCQs. Purchase tickets below to continue.
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tickets Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Your Tickets</h3>
                      <p className="text-sm text-gray-500">Available credits</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">{tickets}</div>
                  <p className="text-sm text-gray-500">tickets remaining</p>
                </div>

                <button
                  onClick={handleBuyTickets}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Buy More Tickets</span>
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  ₹100 for 30 tickets • 1 ticket per test
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleViewHistory}
                    className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <History className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">View Test History</p>
                      <p className="text-sm text-gray-500">See past results</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                <h3 className="font-semibold text-blue-900 mb-3">💡 Pro Tips</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Upload clear, well-formatted PDFs for best results</li>
                  <li>• Aim for 10-30 questions for optimal difficulty</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
