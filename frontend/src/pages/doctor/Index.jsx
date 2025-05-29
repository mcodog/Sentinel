/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col p-10">
      {/* Widgets */}
      {isLoading && (
        <div className="flex items-center justify-between mr-5">
          <Skeleton variant="rectangular" width={400} height={200} />
          <Skeleton variant="rectangular" width={400} height={200} />

          <Skeleton variant="rectangular" width={400} height={200} />
        </div>
      )}

      {/* */}

      {/* Header */}
      <div className="mt-5">
        {isLoading ? (
          <Skeleton variant="text" sx={{ fontSize: "2rem", width: "250px" }} />
        ) : (
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
        )}
      </div>

      {/* Content */}
      <div className="mt-5">
        {isLoading && (
          <div className="flex justify-between items-center gap-5">
            <Skeleton variant="rectangular" width="75%" height={250} />
            <Skeleton variant="rectangular" width="25%" height={250} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
