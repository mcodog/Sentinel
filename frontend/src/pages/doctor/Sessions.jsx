/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import Skeleton from "@mui/material/Skeleton";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
} from "@mui/material";

export default function Sessions() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);

  return (
    <div className="container p-10">
      <div className="my-2">
        {isLoading ? (
          <Skeleton variant="text" sx={{ fontSize: "2rem", width: "250px" }} />
        ) : (
          <h1 className="text-2xl font-bold">Sessions</h1>
        )}
      </div>

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
