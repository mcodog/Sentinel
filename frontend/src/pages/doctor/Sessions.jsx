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
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  return <div>Sessions</div>;
}
