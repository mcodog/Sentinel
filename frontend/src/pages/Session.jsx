import React, { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import { selectUser } from "../features/user/userSelector";
import { useSelector } from "react-redux";

export default function Session() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const user = useSelector(selectUser);
  const userId = user.id;

  // const fetchSessions = async () => {
  //   try {
  //     await axiosInstance.get(`/sessions/${userId}`);
  //   } catch (err) {
  //     console.error("Error fetching sessions:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="container p-10">
      {isLoading ? (
        <Skeleton variant="text" sx={{ fontSize: "2rem", width: "250px" }} />
      ) : (
        <h1 className="text-2xl font-bold">History Sessions</h1>
      )}

      <div className="grid grid-cols-3 gap-5 ">
        {isLoading ? (
          <>
            <div>
              <Skeleton variant="rectangular" width="100%" height={280} />
            </div>
            <div>
              <Skeleton variant="rectangular" width="100%" height={280} />
            </div>
            <div>
              <Skeleton variant="rectangular" width="100%" height={280} />
            </div>
            <div>
              <Skeleton variant="rectangular" width="100%" height={280} />
            </div>
            <div>
              <Skeleton variant="rectangular" width="100%" height={280} />
            </div>
            <div>
              <Skeleton variant="rectangular" width="100%" height={280} />
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border border-black h-64 w-full "></div>
            <div className="bg-white border border-black h-64 w-full "></div>

            <div className="bg-white border border-black h-64 w-full "></div>
            <div className="bg-white border border-black h-64 w-full "></div>
            <div className="bg-white border border-black h-64 w-full "></div>
            <div className="bg-white border border-black h-64 w-full "></div>
          </>
        )}
      </div>
    </div>
  );
}
