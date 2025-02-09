import { useState, useEffect } from "react";
import axios from "axios";

// Separate Modal Component
const ChallanModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  initialData, 
  isIssuing 
}) => {
  const [localDetails, setLocalDetails] = useState(initialData);

  useEffect(() => {
    setLocalDetails(initialData);
  }, [initialData]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(localDetails);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Issue Challan</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number (User ID)
            </label>
            <input
              type="text"
              value={localDetails.user_id}
              onChange={(e) => setLocalDetails({
                ...localDetails,
                user_id: e.target.value
              })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reason
            </label>
            <input
              type="text"
              value={localDetails.reason}
              onChange={(e) => setLocalDetails({
                ...localDetails,
                reason: e.target.value
              })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fine Amount (₹)
            </label>
            <input
              type="number"
              value={localDetails.fine_amount}
              onChange={(e) => setLocalDetails({
                ...localDetails,
                fine_amount: parseFloat(e.target.value)
              })}
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isIssuing}
              className={`px-4 py-2 text-white rounded ${
                isIssuing
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isIssuing ? "Issuing..." : "Issue Challan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
export default function FileUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [checkingServer, setCheckingServer] = useState(true);
  const [issuingChallan, setIssuingChallan] = useState(false);
  const [challanMessage, setChallanMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [challanDetails, setChallanDetails] = useState({
    user_id: "",
    reason: "Invalid ticket",
    fine_amount: 500.00
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const whatsappApiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL;

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
    setChallanMessage("");
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

  const openChallanModal = () => {
    setChallanDetails({
      ...challanDetails,
      user_id: response?.phone_number || response?.userId || "",
    });
    setShowModal(true);
  };

  const handleChallanSubmit = async (details) => {
    if (!response) return;

    try {
      setIssuingChallan(true);
      setChallanMessage("Issuing challan...");

      const challanResponse = await axios.post(`${apiBaseUrl}/issue-challan`, {
        ...details,
        ticket_id: response.ticket_id || response.id,
      });

      if (challanResponse.data.payment_link) {
        try {
          const phoneNumber = details.user_id.replace(/\D/g, ""); // Ensure only digits
          const paymentMessage = encodeURIComponent(
            `Please pay your challan using this link: ${challanResponse.data.payment_link}\nAmount: ₹${challanResponse.data.amount}`
          );
        
          const waLink = `https://wa.me/${phoneNumber}?text=${paymentMessage}`;
        
          window.open(waLink, "_blank");
        
          setChallanMessage("Challan issued and payment link sent via WhatsApp!");
        }
        catch (error) {
          console.error("WhatsApp API Error:", error);
          setChallanMessage("Challan issued but couldn't send WhatsApp message. Payment link: " + challanResponse.data.payment_link);
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setChallanMessage(
        `Failed to issue challan: ${error.response?.data?.detail || error.message}`
      );
    } finally {
      setIssuingChallan(false);
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
            capture="environment"
            onChange={handleFileChange}
            className="block w-full text-sm cursor-pointer mb-4"
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
          <h3 className="text-lg font-semibold mb-2">Ticket Data:</h3>
          <pre className="p-4 border-2 border-dashed border-gray-400 shadow-md bg-gray-100 rounded-lg text-sm mb-4">
            {JSON.stringify(response, null, 2)}
          </pre>
          
          <div className="text-center">
            <button
              onClick={openChallanModal}
              disabled={issuingChallan}
              className={`px-6 py-2 text-white font-semibold rounded-lg ${
                issuingChallan 
                  ? "bg-red-400 cursor-not-allowed" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Issue Challan
            </button>
            
            {challanMessage && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                challanMessage.includes("Failed") 
                  ? "bg-red-100 text-red-700" 
                  : "bg-green-100 text-green-700"
              }`}>
                {challanMessage}
              </div>
            )}
          </div>
        </div>
      )}

      <ChallanModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleChallanSubmit}
        initialData={challanDetails}
        isIssuing={issuingChallan}
      />
    </div>
  );
}