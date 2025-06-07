import { useEffect, useState, useRef, useMemo } from "react";
import axiosInstance from "../../utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import { selectUser } from "../../features/user/userSelector";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import ButtonLink from "@/components/buttons/ButtonLink";
import { backendActor } from "../../ic/actor";

const BlobSphere = ({ analyser, isListening, isSpeaking }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const dataArray = useRef(new Uint8Array(64));
  const timeRef = useRef(0);

  // Create custom shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        lowFreq: { value: 0 },
        midFreq: { value: 0 },
        highFreq: { value: 0 },
        color: { value: new THREE.Color(1, 1, 1) },
        emissive: { value: new THREE.Color(0.231, 0.51, 0.965) }, // #3b82f6
        emissiveIntensity: { value: 1 },
      },
      vertexShader: `
        uniform float time;
        uniform float lowFreq;
        uniform float midFreq;
        uniform float highFreq;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normal;
          vPosition = position;
          vec3 pos = position;
          float displacement = 0.0;
          
          // Low frequency waves (big rolling movements)
          displacement += sin(pos.x * 1.5 + time * 0.8) * cos(pos.y * 1.2 + time * 0.6) * lowFreq * 0.6;
          displacement += cos(pos.z * 1.8 + time * 0.4) * sin(pos.x * 1.0 + time * 0.5) * lowFreq * 0.5;
          
          // Mid frequency waves (medium ripples)
          displacement += sin(pos.x * 3.0 + pos.y * 2.0 + time * 1.5) * midFreq * 0.35;
          displacement += cos(pos.y * 2.5 + pos.z * 3.0 + time * 1.2) * midFreq * 0.25;
          
          // High frequency ripples (fine details)
          displacement += sin(pos.x * 6.0 + pos.z * 4.0 + time * 3.0) * highFreq * 0.15;
          
          // Base breathing motion
          displacement += sin(time * 0.3) * 0.08;
          
          pos += normal * displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 emissive;
        uniform float emissiveIntensity;
        uniform float time;
        uniform float midFreq;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          
          // Basic lighting
          vec3 lightDir = normalize(vec3(2.0, 2.0, 5.0));
          float diff = max(dot(normal, lightDir), 0.0);
          
          // Ambient light
          vec3 ambient = color * 0.3;
          
          // Diffuse light
          vec3 diffuse = color * diff * 0.7;
          
          // Emissive based on audio
          vec3 emissiveColor = emissive * emissiveIntensity;
          
          // Add some animated emissive variation
          float pulseEffect = sin(time * 3.0 + vPosition.x * 5.0) * 0.1 + 0.9;
          emissiveColor *= pulseEffect;
          
          gl_FragColor = vec4(ambient + diffuse + emissiveColor, 1.0);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      // When listening, show white sphere with no movement
      if (isListening && !isSpeaking) {
        materialRef.current.uniforms.lowFreq.value = 0;
        materialRef.current.uniforms.midFreq.value = 0;
        materialRef.current.uniforms.highFreq.value = 0;
        materialRef.current.uniforms.color.value = new THREE.Color(1, 1, 1);
        materialRef.current.uniforms.emissive.value = new THREE.Color(1, 1, 1);
        materialRef.current.uniforms.emissiveIntensity.value = 0.2;
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.x += 0.002;
        return;
      }

      // When speaking, show reactive visualization
      if (analyser && isSpeaking) {
        analyser.getByteFrequencyData(dataArray.current);

        timeRef.current += 0.05;

        // Split frequency data into different ranges
        const lowFreq = dataArray.current.slice(0, 8);
        const midFreq = dataArray.current.slice(8, 32);
        const highFreq = dataArray.current.slice(32, 64);

        const lowAvg =
          lowFreq.reduce((a, b) => a + b, 0) / lowFreq.length / 255;
        const midAvg =
          midFreq.reduce((a, b) => a + b, 0) / midFreq.length / 255;
        const highAvg =
          highFreq.reduce((a, b) => a + b, 0) / highFreq.length / 255;

        // Update shader uniforms
        materialRef.current.uniforms.time.value = timeRef.current;
        materialRef.current.uniforms.lowFreq.value = lowAvg;
        materialRef.current.uniforms.midFreq.value = midAvg;
        materialRef.current.uniforms.highFreq.value = highAvg;

        // Use the specified colors #3b82f6 and #8b5cf6
        const blueColor = new THREE.Color(0.231, 0.51, 0.965); // #3b82f6
        const purpleColor = new THREE.Color(0.545, 0.361, 0.965); // #8b5cf6

        // Interpolate between blue and purple based on frequency
        const color = blueColor.clone().lerp(purpleColor, midAvg);
        materialRef.current.uniforms.color.value = color;

        // Dynamic emissive intensity
        const emissiveIntensity = 0.5 + highAvg * 2;
        materialRef.current.uniforms.emissiveIntensity.value =
          emissiveIntensity;
        materialRef.current.uniforms.emissive.value = purpleColor;

        // Gentle rotation
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.x += 0.002;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 128, 128]} />
      <primitive object={shaderMaterial} ref={materialRef} />
    </mesh>
  );
};

const CallModal = ({
  sessionId,
  setCallActive,
  isConversationActive,
  setIsConversationActive,
}) => {
  // alert(import.meta.env.VITE_ELEVEN_LABS_API);
  const isTesting = false;
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [systemResponse, setSystemResponse] = useState("");
  const [consentDialogue, setConsentDialogue] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [onLoad, setOnLoad] = useState(true);
  const [audioDuration, setAudioDuration] = useState(0);
  const [analyser, setAnalyser] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const handleAnalyzeConversation = async () => {
    console.log("analysis");
    try {
      const res = await axiosInstance.get(`conversation/session/${sessionId}`);
      const analysisData = res.data.analyzeData[0];
      console.log(analysisData);
      const blockchain = await backendActor.addBlock({
        sentimentScore: analysisData.sentiment_score,
        tags: analysisData.keywords,
        summary: analysisData.summary,
        sentimentCategory: analysisData.sentiment_category,
      });

      console.log(blockchain);
      // http://localhost:5000/api/conversation/session/197
      Swal.fire({
        title: "Analysis Succesful!",
        text: "Your data is ready to be reviewed by your psychologist.",
        icon: "success",
      });

      // setTimeout(() => {
      //   navigate("/");
      // }, 1000);
    } catch (e) {
      console.log(e);
      Swal.fire({
        title: "Something went wrong",
        text: "Please try again later.",
        icon: "error",
      });
    }
  };

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
      setIsSpeaking(true);
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
              "xi-api-key": import.meta.env.VITE_ELEVEN_LABS_API,
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

        // Create audio context and analyser
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 128;

        source.connect(analyserNode);
        analyserNode.connect(audioContext.destination);

        setAnalyser(analyserNode);

        audioRef.current = audio;
        setCurrentAudio(audio);

        audio.addEventListener("loadedmetadata", () => {
          console.log("TTS Duration:", audio.duration, "seconds");
        });

        audio.play();

        audio.onended = () => {
          console.log("Audio finished playing");
          setIsSpeaking(false);
          setTimeout(() => {
            startListening();
          }, 100);
          resolve();
        };

        audio.onerror = (error) => {
          console.error("Audio playback error:", error);
          setIsSpeaking(false);
          reject(error);
        };
      } catch (error) {
        console.error("TTS Error:", error);
        setIsSpeaking(false);
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

  const hasPlayedRef = useRef(false);

  const startConversation = async () => {
    if (hasPlayedRef.current) return;

    hasPlayedRef.current = true; // Mark as played to prevent reruns
    await playTTS("Hello, I am Sentinel! How may I help you");

    setTimeout(() => {
      setIsConversationActive(true);
      startListening();
    }, 1500);
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
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleEndCall = () => {
    stopConversation();
    stopAudio();
    setConsentDialogue(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 right-0 left-0 top-0 bg-black/70 z-50 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative -top-50 z-[1001] w-[500px] h-[500px]"
      >
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[2, 2, 5]} intensity={0.8} />
          <BlobSphere
            analyser={analyser}
            isListening={isListening}
            isSpeaking={isSpeaking}
          />
          <OrbitControls enabled={false} />
        </Canvas>
      </motion.div>
      <div className="relative p-4 w-6xl flex flex-col items-center justify-center -mt-60 min-h-20 bg-white rounded-2xl">
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />
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
        <div
          className={`absolute bottom-10 ${
            isTesting ? "" : "hidden opacity-0"
          }`}
        >
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
        </div>
      </div>
      <div>
        <button
          onClick={handleEndCall}
          className="absolute top-10 right-10 inline-block text-lg px-8 py-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
        >
          End Call
        </button>
      </div>

      {consentDialogue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 z-[1002] w-screen h-screen bg-black/50 flex items-center justify-center"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-max-[700px] w-[1200px] bg-white rounded-2xl shadow-2xl p-12"
          >
            <div className="font-black text-2xl text-center">
              You have ended the call. Thank you for using Sentinel!
            </div>
            <div className="text-center">
              We'd like to ask for your consent in running our models to analyze
              your conversation. Please confirm if this is okay with you.
            </div>
            <div className="mt-8">
              <div className="flex justify-center items-center gap-4">
                <ButtonLink
                  onClick={handleAnalyzeConversation}
                  variant="primary"
                >
                  I Consent
                </ButtonLink>
                <ButtonLink
                  onClick={() => {
                    setCallActive(false);
                  }}
                  variant="secondary"
                >
                  Decline
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CallModal;
