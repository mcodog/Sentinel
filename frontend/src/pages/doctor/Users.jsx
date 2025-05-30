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

export default function Users() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

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

  return (
    <div className="p-4">
      <div className="mb-4">
        {isLoading ? (
          <Skeleton variant="text" sx={{ fontSize: "2rem", width: "250px" }} />
        ) : (
          <Typography variant="h4" component="h1">
            Users
          </Typography>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton variant="rectangular" width="100%" height={50} />
          <Skeleton variant="rectangular" width="100%" height={50} />
          <Skeleton variant="rectangular" width="100%" height={50} />
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.auth_id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </TableCell>
                  <TableCell>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </TableCell>
                  <TableCell>{user.firstname}</TableCell>
                  <TableCell>{user.lastname}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
