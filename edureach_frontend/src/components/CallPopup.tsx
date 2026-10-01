import { useState } from "react";
import { X, Phone, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { initiateCall } from "../services/vapi.service";
import { vapiFormContent } from "../data/content";

interface CallPopupProps {
  open: boolean;
  onClose: () => void;
}

type CallStatus = "form" | "calling" | "done" | "error";

export default function CallPopup({ open, onClose }: CallPopupProps) {
  const { user } = useAuth();

  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<CallStatus>("form");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!phone || !course || !topic) {
      toast.error("Please fill in all fields");
      return;
    }

    setStatus("calling");

    try {
      console.log("========== CALL REQUEST ==========");
      console.log({
        phone,
        course,
        topic,
      });

      const result = await initiateCall({
        phone,
        course,
        topic,
      });

      console.log("========== CALL SUCCESS ==========");
      console.log(result);

      setStatus("done");
      toast.success("Call initiated!");
    } catch (error: any) {
      console.error("========== FRONTEND ERROR ==========");
      console.error(error);

      if (error?.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);

        alert(
          JSON.stringify(
            error.response.data,
            null,
            2
          )
        );

        toast.error(
          error.response.data?.message ||
            "Failed to initiate call."
        );
      } else {
        alert(error?.message || "Unknown Error");
        toast.error("Failed to initiate call.");
      }

      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("form");
    setPhone("");
    setCourse("");
    setTopic("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-maroon rounded-t-2xl px-6 py-5">
          <h3 className="text-xl font-bold text-white">
            Talk to Our AI Counselor
          </h3>
          <p className="text-white/70 text-sm mt-1">
            Get personalized guidance on courses, admissions & more
          </p>
        </div>

        <div className="p-6">
          {status === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={user?.name || ""}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Interested Course *
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Course</option>

                  {vapiFormContent.courses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Topic *
                </label>

                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Topic</option>

                  {vapiFormContent.topics.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-maroon text-white py-3 rounded-lg"
              >
                Call Me Now
              </button>
            </form>
          )}

          {status === "calling" && (
            <div className="text-center py-10">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-maroon mb-3" />
              <h3 className="text-lg font-bold">
                Calling you now...
              </h3>
              <p className="text-gray-500">
                Ava is dialing {phone}
              </p>
            </div>
          )}

          {status === "done" && (
            <div className="text-center py-10">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold">
                Call Initiated!
              </h3>
              <p className="text-gray-500 mb-4">
                You will receive a call shortly.
              </p>

              <button
                onClick={reset}
                className="text-maroon font-semibold"
              >
                Request Another Call
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-10">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />

              <h3 className="text-lg font-bold">
                Call Failed
              </h3>

              <p className="text-gray-500 mb-4">
                Something went wrong. Please try again.
              </p>

              <button
                onClick={reset}
                className="bg-maroon text-white px-5 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}