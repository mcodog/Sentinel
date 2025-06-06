import React, { useEffect } from "react";
import DashboardOverview from "../../components/sentiment/dashboard-overview";
import { backendActor } from "../../ic/actor";
import { useSelector } from "react-redux";
import { selectUserId } from "../../features/user/userSelector";
import { encryptData } from "../../utils/blockchain.utils";

const SentimentAnalyticsPage = () => {
  const userId = useSelector(selectUserId);

  useEffect(() => {
    const logActivity = async () => {
      try {
        const encrypted = await encryptData(
          {
            action: "Doctor accessed sentiment analytics page",
            userId: userId,
            details: [],
          },
          "audit-log"
        );

        await backendActor.addActivityLog(encrypted);
      } catch (err) {
        console.error("Error logging activity:", err);
      }
    };

    logActivity();
  }, [userId]);
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardOverview />
    </div>
  );
};

export default SentimentAnalyticsPage;
