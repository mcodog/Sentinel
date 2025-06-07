import React, { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const getRandomMessage = () => {
  const words = [
    "Hello",
    "How are you",
    "Nice weather",
    "Good vibes",
    "Let's go",
  ];
  return words[Math.floor(Math.random() * words.length)];
};

const BlobSphere = ({ analyser }) => {
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
        emissive: { value: new THREE.Color(0.545, 0.361, 0.965) },
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
          
          // EDIT THESE VALUES TO CONTROL WAVE SIZE AND BEHAVIOR:
          
          // Low frequency waves (big rolling movements) - EDIT MULTIPLIERS HERE:
          displacement += sin(pos.x * 1.5 + time * 0.8) * cos(pos.y * 1.2 + time * 0.6) * lowFreq * 0.6;
          displacement += cos(pos.z * 1.8 + time * 0.4) * sin(pos.x * 1.0 + time * 0.5) * lowFreq * 0.5;
          
          // Mid frequency waves (medium ripples) - EDIT MULTIPLIERS HERE:
          displacement += sin(pos.x * 3.0 + pos.y * 2.0 + time * 1.5) * midFreq * 0.35;
          displacement += cos(pos.y * 2.5 + pos.z * 3.0 + time * 1.2) * midFreq * 0.25;
          
          // High frequency ripples (fine details) - EDIT MULTIPLIERS HERE:
          displacement += sin(pos.x * 6.0 + pos.z * 4.0 + time * 3.0) * highFreq * 0.15;
          
          // Base breathing motion - EDIT THIS FOR OVERALL PULSING:
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
    if (analyser && meshRef.current && materialRef.current) {
      analyser.getByteFrequencyData(dataArray.current);

      timeRef.current += 0.05; // Roughly 60fps

      // Split frequency data into different ranges
      const lowFreq = dataArray.current.slice(0, 8);
      const midFreq = dataArray.current.slice(8, 32);
      const highFreq = dataArray.current.slice(32, 64);

      const lowAvg = lowFreq.reduce((a, b) => a + b, 0) / lowFreq.length / 255;
      const midAvg = midFreq.reduce((a, b) => a + b, 0) / midFreq.length / 255;
      const highAvg =
        highFreq.reduce((a, b) => a + b, 0) / highFreq.length / 255;

      // Update shader uniforms
      materialRef.current.uniforms.time.value = timeRef.current;
      materialRef.current.uniforms.lowFreq.value = lowAvg;
      materialRef.current.uniforms.midFreq.value = midAvg;
      materialRef.current.uniforms.highFreq.value = highAvg;

      // Color shifting based on frequency data
      const hue = midAvg * 360;
      const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6);
      materialRef.current.uniforms.color.value = color;

      // Dynamic emissive color and intensity
      const emissiveIntensity = 0.5 + highAvg * 2;
      materialRef.current.uniforms.emissiveIntensity.value = emissiveIntensity;

      const emissiveHue = ((hue + 180) % 360) / 360;
      materialRef.current.uniforms.emissive.value = new THREE.Color().setHSL(
        emissiveHue,
        1,
        0.5
      );

      // Gentle rotation
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 128, 128]} />
      <primitive object={shaderMaterial} ref={materialRef} />
    </mesh>
  );
};

const AudioVisualizer = () => {
  const [analyser, setAnalyser] = useState(null);
  const [audio, setAudio] = useState(null);

  const fetchAudio = async () => {
    const text = getRandomMessage();

    const res = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/nPczCjzI2devNBz1zQrb?output_format=mp3_44100_128",
      {
        method: "POST",
        headers: {
          "xi-api-key": "sk_384bb4d1fbc7df06c6ee3e752ce72e5463fec891ec4acdd5",
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

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 128;

    source.connect(analyserNode);
    analyserNode.connect(ctx.destination);

    setAnalyser(analyserNode);
    setAudio(audio);
  };

  const playAudio = () => {
    if (audio) {
      audio.play();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[2, 2, 5]} intensity={0.8} />
        <BlobSphere analyser={analyser} />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>

      <div className="absolute bottom-10 space-x-4">
        <button
          onClick={fetchAudio}
          className="px-6 py-3 bg-white/90 backdrop-blur-sm text-black rounded-lg font-medium hover:bg-white transition-all duration-200 shadow-lg"
        >
          Generate & Load
        </button>
        <button
          onClick={playAudio}
          className="px-6 py-3 bg-white/90 backdrop-blur-sm text-black rounded-lg font-medium hover:bg-white transition-all duration-200 shadow-lg"
        >
          Play
        </button>
      </div>
    </div>
  );
};

export default AudioVisualizer;
