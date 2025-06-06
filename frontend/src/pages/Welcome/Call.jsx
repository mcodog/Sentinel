import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../utils/axios";
import { backendActor } from "../../ic/actor";
import { encryptData } from "../../utils/blockchain.utils";
import { useSelector } from "react-redux";
import { selectUserId } from "../../features/user/userSelector";

const Call = () => {
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [onLoad, setOnLoad] = useState(true);
  const userId = useSelector(selectUserId);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const logActivity = async () => {
      try {
        const encrypted = await encryptData({
          action: "User started a call session",
          userId: userId,
          details: [],
        });

        await backendActor.addActivityLog(encrypted);
      } catch (err) {
        console.error("Error logging activity:", err);
      }
    };

    if (onLoad) {
      startConversation();
      setOnLoad(false);
      logActivity();
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
        if (isConversationActive && !isProcessing) {
          setTimeout(startListening, 500);
        }
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

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
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
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const res = await fetch(
          "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128",
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

        audio.onended = () => {
          console.log("Audio finished playing");
          startListening();
          resolve();
        };

        audio.onerror = (error) => {
          console.error("Audio playback error:", error);
          reject(error);
        };

        audio.play();
      } catch (error) {
        console.error("TTS Error:", error);
        reject(error);
      }
    });
  };

  const generateResponse = async (input, currentChatLog) => {
    try {
      const response = await axiosInstance.post("/conversation", { input });

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

  const startConversation = () => {
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
    <div className="flex w-full h-screen justify-center items-center">
      <div className="w-7xl flex flex-col justify-center items-center">
        <div className="mb-5 text-xl font-bold">Chat Simulator</div>
        <div className="mb-4 flex space-x-4 text-sm">
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

        <div className="w-1/2">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your message here..."
              className="flex-grow h-10 border rounded px-2"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
            />
            <button
              className="bg-blue-500 text-white px-4 rounded disabled:bg-gray-400"
              onClick={() => handleSendMessage()}
              disabled={isProcessing}
            >
              Send
            </button>
            <button
              className={`px-4 rounded text-white ${
                isConversationActive
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              onClick={
                isConversationActive ? stopConversation : startConversation
              }
            >
              {isConversationActive ? "Stop Chat" : "Start Chat"}
            </button>
            <button
              className="bg-red-600 text-white px-4 rounded hover:bg-red-700"
              onClick={stopAudio}
            >
              Stop Audio
            </button>
          </div>

          <div className="border w-full h-[300px] mt-5 rounded-2xl p-4 overflow-y-auto flex flex-col">
            <div className="mt-auto flex flex-col">
              {chatLog.map((message) => (
                <div
                  key={message.id}
                  className={`w-full min-h-[50px] p-2 flex ${
                    message.sender === "doctor"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`${
                      message.sender === "doctor" ? "bg-red-500" : "bg-gray-500"
                    } inline-block p-2 px-6 rounded-full text-white max-w-xs`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Call;
