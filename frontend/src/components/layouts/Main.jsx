import React, { useState } from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { FaPhone } from "react-icons/fa6";
import CallModal from "../modals/CallModal";
import ChatComponent from "../chat";
import axiosInstance from "../../utils/axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/user/userSelector";

const Main = () => {
  const user = useSelector(selectUser);
  const [callActive, setCallActive] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const initializeSession = async () => {
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
          onClick={initializeSession}
          className="flex border-4 p-3 px-6 md:p-4 md:px-8 rounded-4xl bg-slate-700 text-white gap-2 items-center cursor-pointer hover:bg-green-600 transition-all duration-300"
        >
          <FaPhone color="white" size="16" className="md:hidden" />
          <FaPhone color="white" size="20" className="hidden md:block" />
          <p className="text-sm md:text-base">Call</p>
        </div>
      </div>
      
      {callActive && (
        <div className="fixed bottom-0 right-0 left-0 top-0 bg-black/50 z-50 flex items-center justify-center">
          <CallModal
            sessionId={sessionId}
            setCallActive={setCallActive}
            isConversationActive={isConversationActive}
            setIsConversationActive={setIsConversationActive}
          />
        </div>
      )}
    </div>
  );
};

export default Main;
