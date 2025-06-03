import React, { useEffect } from "react";
import DashboardOverview from "../../components/sentiment/dashboard-overview";
import { backendActor } from "../../ic/actor";
import { useSelector } from "react-redux";
import { selectUserId } from "../../features/user/userSelector";

const SentimentAnalyticsPage = () => {
  const userId = useSelector(selectUserId);

  useEffect(() => {
    const logActivity = async () => {
      try {
        await backendActor.addAuditLog({
          action: "viewed semantic anayltics dashboard",
          user_id: userId,
          details: [],
        });
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
