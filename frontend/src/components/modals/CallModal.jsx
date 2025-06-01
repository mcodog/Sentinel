import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import { selectUser } from "../../features/user/userSelector";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CallModal = ({
  sessionId,
  setCallActive,
  isConversationActive,
  setIsConversationActive,
}) => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [systemResponse, setSystemResponse] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [onLoad, setOnLoad] = useState(true);
  const [audioDuration, setAudioDuration] = useState(0);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!user || !user.id) {
      Swal.fire({
        icon: "error",
        title: "Session Error",
        text: "User is not authenticated. Please log in to start a session.",
      });

      setTimeout(() => navigate("/login"), 500);
      return;
    }

    if (onLoad) {
      startConversation();
      setOnLoad(false);
      console.log("Conversation started");
    }
    if (typeof window !== "undefined" && window.webkitSpeechRecognition) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      let transcript = "";

      recognitionRef.current.onresult = (event) => {
        transcript = event.results[0][0].transcript;
        console.log("Transcript:", transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (isConversationActive && !isProcessing) {
          setTimeout(startListening, 1000);
        }
      };

      recognitionRef.current.onend = () => {
        handleSendMessage(transcript);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSendMessage = async (input) => {
    const messageText = input || inputValue;
    if (!messageText.trim()) return;

    setIsProcessing(true);
    stopListening();

    const newMessage = {
      id: Date.now(),
      text: messageText,
      sender: "patient",
    };

    const updatedChat = [...chatLog, newMessage];
    setChatLog(updatedChat);
    setInputValue("");

    try {
      const systemResponse = await generateResponse(messageText, updatedChat);
      await playTTS(systemResponse);
    } catch (error) {
      console.error("Error in conversation:", error);
    }

    setIsProcessing(false);

    if (isConversationActive) {
      setTimeout(startListening, 500);
    }
  };

  const playTTS = async (text) => {
    return new Promise(async (resolve, reject) => {
      setSystemResponse(text);
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const res = await fetch(
          "https://api.elevenlabs.io/v1/text-to-speech/nPczCjzI2devNBz1zQrb?output_format=mp3_44100_128",
          {
            method: "POST",
            headers: {
              "xi-api-key":
                "sk_384bb4d1fbc7df06c6ee3e752ce72e5463fec891ec4acdd5",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          }
        );

        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audioRef.current = audio;
        setCurrentAudio(audio);

        audio.addEventListener("loadedmetadata", () => {
          console.log("TTS Duration:", audio.duration, "seconds");
        });

        audio.play();

        audio.onended = () => {
          console.log("Audio finished playing");
          setTimeout(() => {
            startListening();
          }, 100);
          resolve();
        };

        audio.onerror = (error) => {
          console.error("Audio playback error:", error);
          reject(error);
        };
      } catch (error) {
        console.error("TTS Error:", error);
        reject(error);
      }
    });
  };

  const generateResponse = async (input, currentChatLog) => {
    if (!sessionId) {
      Swal.fire({
        icon: "error",
        title: "Session Error",
        text: "Session ID is not available. Please start a new conversation.",
      });
      return;
    }
    console.log("Session", sessionId);
    try {
      const response = await axiosInstance.post("/conversation", {
        input,
        session_id: sessionId,
      });

      const newMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: "doctor",
      };

      const updatedChat = [...currentChatLog, newMessage];
      setChatLog(updatedChat);

      return response.data.response;
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = "Sorry, I couldn't process that.";

      const errorResponse = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: "doctor",
      };

      setChatLog([...currentChatLog, errorResponse]);
      return errorMessage;
    }
  };

  const startConversation = async () => {
    setIsConversationActive(true);
    startListening();
  };

  const stopConversation = () => {
    setIsConversationActive(false);
    stopListening();
    stopAudio();
    setIsProcessing(false);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentAudio(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  return (
    <div className="relative bg-white p-4 rounded-lg shadow-lg w-6xl flex flex-col items-center justify-center h-96">
      <AnimatePresence mode="wait">
        <motion.h2
          key={systemResponse}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold origin-top"
        >
          {systemResponse}
        </motion.h2>
      </AnimatePresence>
      <div className="absolute bottom-10">
        <div className=" mb-4 flex space-x-4 text-sm">
          <span
            className={`px-2 py-1 rounded ${
              isConversationActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Conversation: {isConversationActive ? "Active" : "Inactive"}
          </span>
          <span
            className={`px-2 py-1 rounded ${
              isListening
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Listening: {isListening ? "ON" : "OFF"}
          </span>
          <span
            className={`px-2 py-1 rounded ${
              isProcessing
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Processing: {isProcessing ? "ON" : "OFF"}
          </span>
        </div>

        <div>
          <button
            onClick={() => {
              setCallActive(false);
              stopConversation();
              stopAudio();
            }}
            className=" px-4 py-2 bg-red-500 text-white rounded w-full hover:bg-red-600 transition-colors duration-300"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
