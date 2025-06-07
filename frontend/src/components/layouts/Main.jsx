import React, { useState } from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { FaPhone } from "react-icons/fa6";
import CallModal from "../modals/CallModal";
import ChatComponent from "../chat";
import axiosInstance from "@/utils/axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { selectUser } from "@/features/user/userSelector";
import speakingCue from "@/assets/speaking.png";
import notSpeakingCue from "@/assets/notspeaking.png";
import ButtonLink from "@/components/buttons/ButtonLink";
import { AnimatePresence, motion } from "framer-motion";

const Main = () => {
  const user = useSelector(selectUser);
  const [callActive, setCallActive] = useState(false);
  const [confirmationDialogue, setConfirmationDialogue] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const initializeSession = async () => {
    setConfirmationDialogue(false);
    try {
      const response = await axiosInstance.post("/conversation/initialize", {
        type: "call",
        user_id: user.id,
      });
      console.log("Session response:", response.data);
      if (response.data.message) {
        await setSessionId(response.data.data[0].id);
        console.log("Session initialized:", response.data.data[0].id);
        setCallActive(true);
      } else {
        console.error("Failed to initialize session:", response.data.error);
        Swal.fire({
          icon: "error",
          title: "Session Error",
          text: "Failed to initialize session. Please try again later.",
        });
        return;
      }
    } catch (error) {
      console.error("Error initializing session:", error);
    }
  };

  return (
    <div>
      <div className="fixed z-50 top-0 left-0 h-26 w-full flex items-center justify-center header-shadow bg-white">
        <Header />
      </div>
      <div className="relative z-0 min-h-screen pt-26">
        <Outlet />
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 md:bottom-10 right-4 md:right-20 flex flex-col md:flex-row gap-4 items-end md:items-center z-50">
        {/* Chat Component */}
        <ChatComponent />

        {/* Call Button */}
        <div
          onClick={() => setConfirmationDialogue(true)}
          className="flex border-4 p-3 px-6 md:p-4 md:px-8 rounded-4xl bg-slate-700 text-white gap-2 items-center cursor-pointer hover:bg-green-600 transition-all duration-300"
        >
          <FaPhone color="white" size="16" className="md:hidden" />
          <FaPhone color="white" size="20" className="hidden md:block" />
          <p className="text-sm md:text-base">Call</p>
        </div>
      </div>

      <AnimatePresence>
        {confirmationDialogue && (
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
              <div className="h-full w-full flex flex-col justify-center">
                <div className="uppercase text-center text-2xl font-bold">
                  Welcome to Sentinel - Your AI Mental Health Companion
                </div>
                <div className="uppercase text-center text-2xl ">
                  Instructions and Visual Cues
                </div>
                <div className=" flex-grow grid grid-cols-2 p-2 gap-2 my-8">
                  <div>
                    <div className="flex flex-col justify-center items-center border-r-2 h-full">
                      <img src={speakingCue} className="h-50" />
                      <div>
                        <span className="font-bold">Blue/Colored ball </span>=
                        Sentinel is responding
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col justify-center h-full items-center">
                      <img src={notSpeakingCue} className="h-50" />
                      <div>
                        <span className="font-bold">White ball </span>= Your
                        turn to speak
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-4">
                  <ButtonLink onClick={initializeSession} variant="primary">
                    Continue
                  </ButtonLink>
                  <ButtonLink
                    onClick={() => setConfirmationDialogue(false)}
                    variant="secondary"
                  >
                    Go Back
                  </ButtonLink>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {callActive && (
        <CallModal
          sessionId={sessionId}
          setCallActive={setCallActive}
          isConversationActive={isConversationActive}
          setIsConversationActive={setIsConversationActive}
        />
      )}
    </div>
  );
};

export default Main;
