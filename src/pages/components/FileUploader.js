import { useState, useEffect } from "react";
import axios from "axios";

export default function FileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [checkingServer, setCheckingServer] = useState(true); // Spinner for server status check

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const result = await axios.get(`${apiBaseUrl}/status`);
        if (result.status === 200) {
          setServerReady(true);
        } else {
          setServerReady(false);
        }
      } catch {
        setServerReady(false);
      } finally {
        setCheckingServer(false);
      }
    };

    checkServerStatus();
  }, [apiBaseUrl]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResponse(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true);
    setError(null);

    try {
      const result = await axios.post(`${apiBaseUrl}/parse-ticket`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResponse(result.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred while processing the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Upload Ticket Image</h1>
      {checkingServer ? (
        <p className="text-gray-500">Checking server status...</p>
      ) : serverReady ? (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm border rounded-lg border-gray-300 p-2 cursor-pointer focus:outline-none mb-4"
          />
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`px-4 py-2 text-white font-semibold rounded ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </>
      ) : (
        <p className="text-red-500">Server is not available. Please try again later.</p>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {response && (
        <div className="mt-8 text-left">
          <h3 className="text-lg font-semibold mb-2">Parsed Ticket Data:</h3>
          <pre className="p-4 bg-gray-100 rounded-lg text-sm">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
