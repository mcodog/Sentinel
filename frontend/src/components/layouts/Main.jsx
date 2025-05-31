import React, { useState } from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { FaPhone } from "react-icons/fa6";
import CallModal from "../modals/CallModal";
import ChatComponent from "../chat";

const Main = () => {
  const [callActive, setCallActive] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);
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
          onClick={() => setCallActive(true)}
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
