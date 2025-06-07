import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../utils/axios";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableChartIcon from "@mui/icons-material/TableChart";

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
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Link } from "react-router-dom";
import { backendActor } from "../../ic/actor.js";
import { useSelector } from "react-redux";
import { selectUserId } from "../../features/user/userSelector.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
} from "react-icons/fi";

export default function Users() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const userId = useSelector(selectUserId);

  const itemsPerPage = 9;

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
        await backendActor.addAuditLog({
          action: "viewed users list",
          user_id: userId,
          details: [],
        });
      } catch (err) {
        console.error("Error logging activity:", err);
      }
    };

    logActivity();
  }, [userId]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender =
        genderFilter === "all" || user.gender === genderFilter;

      const userAge =
        new Date().getFullYear() - new Date(user.dob).getFullYear();
      const matchesAge =
        ageFilter === "all" ||
        (ageFilter === "18-30" && userAge >= 18 && userAge <= 30) ||
        (ageFilter === "31-50" && userAge >= 31 && userAge <= 50) ||
        (ageFilter === "51+" && userAge >= 51);

      const matchesActivity =
        activityFilter === "all" || user.status === activityFilter;

      return matchesSearch && matchesGender && matchesAge && matchesActivity;
    });
  }, [users, searchTerm, genderFilter, ageFilter, activityFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, genderFilter, ageFilter, activityFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4 ml-5">
      <div className="flex items-center justify-between mb-4 mt-2 m-4">
        {isLoading ? (
          <Skeleton variant="text" sx={{ fontSize: "2rem", width: "250px" }} />
        ) : (
          <div variant="h4" component="h1" className="text-3xl font-black">
            Users List ({filteredUsers.length})
          </div>
        )}

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newView) => newView && setViewMode(newView)}
          size="small"
        >
          <ToggleButton value="card">
            <ViewModuleIcon sx={{ mr: 1 }} />
            <Typography sx={{ textTransform: "initial" }}>Card View</Typography>
          </ToggleButton>
          <ToggleButton value="table">
            <TableChartIcon sx={{ mr: 1 }} />
            <Typography sx={{ textTransform: "initial" }}>
              Table View
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-gray-500" />
            <Typography variant="h6" className="text-gray-700">
              Filters
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ages</option>
              <option value="18-30">18-30 years</option>
              <option value="31-50">31-50 years</option>
              <option value="51+">51+ years</option>
            </select>

            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setGenderFilter("all");
                setAgeFilter("all");
                setActivityFilter("all");
              }}
              className="px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>
      )}

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
                <AnimatePresence>
                  {paginatedUsers.map((user, index) => (
                    <motion.tr
                      key={user.auth_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      component={TableRow}
                    >
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
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <motion.div
          className="grid grid-cols-3 gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence>
            {paginatedUsers.map((user, index) => (
              <motion.div
                key={user.auth_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-4 mb-5 border-b border-gray-300 pb-2">
                  <div className=" bg-black rounded-full h-10 w-10">
                    <Typography
                      variant="h6"
                      color="white"
                      className="flex items-center justify-center h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
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
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </p>
                  </div>

                  <div>
                    <Link to={`/doctor/users/${user.auth_id}`}>
                      <p className="text-green-400 underline">View Sessions</p>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!isLoading && filteredUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Typography variant="h6" color="textSecondary">
            No users found matching your criteria
          </Typography>
        </motion.div>
      )}

      {!isLoading && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{" "}
            {filteredUsers.length} users
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-600 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white"
              } transition-all duration-200`}
            >
              <FiChevronLeft />
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                      currentPage === page
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-600 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white"
              } transition-all duration-200`}
            >
              <FiChevronRight />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
