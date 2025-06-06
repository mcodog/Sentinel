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
import {
  IconButton,
  Modal,
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Link } from "react-router-dom";
import { backendActor } from "../../ic/actor.js";
import { useSelector } from "react-redux";
import { selectUserId } from "../../features/user/userSelector.js";
import { encryptData } from "../../utils/blockchain.utils.js";

export default function Users() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [viewMode, setViewMode] = useState("card");
  const userId = useSelector(selectUserId);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const logActivity = async () => {
      try {
        const encrypted = await encryptData(
          {
            action: "Doctor accessed users page",
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 mt-10">
        {isLoading ? (
          <Skeleton variant="text" sx={{ fontSize: "2rem", width: "250px" }} />
        ) : (
          <Typography variant="h4" component="h1">
            Users
          </Typography>
        )}

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newView) => newView && setViewMode(newView)}
          size="small"
        >
          <ToggleButton value="card">
            <Typography sx={{ textTransform: "initial" }}>Card View</Typography>
          </ToggleButton>
          <ToggleButton value="table">
            <Typography sx={{ textTransform: "initial" }}>
              Table View
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-5">
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
        </div>
      ) : viewMode === "table" ? (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Registered At</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Last Sign In</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.auth_id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.gender.charAt(0).toUpperCase() +
                        user.gender.slice(1)}
                    </TableCell>
                    <TableCell>
                      {new Date().getFullYear() -
                        new Date(user.dob).getFullYear()}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </TableCell>
                    <TableCell>
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{user.auth_identity?.provider}</TableCell>
                    <TableCell>{user.auth_identity?.last_sign_in}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {users.map((user) => (
            <div
              key={user.auth_id}
              className="bg-white border border-gray-300 p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-start gap-4 mb-5 border-b border-gray-300 pb-2">
                <div className=" bg-black rounded-full h-10 w-10">
                  <Typography
                    variant="h6"
                    color="white"
                    className="flex items-center justify-center h-full w-full"
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Typography>
                </div>
                <div>
                  <Typography variant="h6">{user.username}</Typography>
                  <Typography variant="subtitle2">{user.email}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {user.auth_identity?.provider} |{" "}
                    {user.auth_identity?.last_sign_in}
                  </Typography>
                </div>
              </div>

              <div>
                <div className="flex gap-5">
                  <p className="text-gray-500">Gender: </p>{" "}
                  {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                </div>

                <div className="flex gap-12">
                  <p className="text-gray-500">Age</p>
                  <p>
                    {new Date().getFullYear() -
                      new Date(user.dob).getFullYear()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 ">
                <div
                  className={`flex items-center bg-[#DBFCE7] rounded-full px-2 py-1 text-xs`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-1 ${
                      user.status === "active"
                        ? "bg-[#00C950]"
                        : user.status === "inactive"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>

                  <p className="text-xs font-semibold text-green-800">
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </p>
                </div>

                <div>
                  <Link to={`/doctor/users/${user.auth_id}`}>
                    <p className="text-cyan-400">View Sessions</p>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
