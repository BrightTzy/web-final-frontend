// src/Home.jsx

import { useContext, useEffect, useState } from "react";
import { UserContext } from "./context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import TeacherCourses from "./TeacherCourses";
import StudentCourses from "./StudentCourses";
import StudentEnrolledCourses from "./StudentEnrolledCourses";

export default function Home() {
  const { user, isLoggedIn, isInitializing, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [studentTab, setStudentTab] = useState("all"); // "all" | "enrolled"

  useEffect(() => {
    if (!isInitializing && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, isInitializing, navigate]);

  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoggedIn || !user) {
    return null;
  }

  const isTeacher = user.role === "Teacher";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" sx={{ backgroundColor: "#1e293b" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <SchoolIcon sx={{ fontSize: 30 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>
              CourseHub
            </Typography>
          </Box>

          {/* Role specific navigation tabs */}
          {!isTeacher && (
            <Stack direction="row" spacing={1}>
              <Button
                color="inherit"
                startIcon={<MenuBookIcon />}
                variant={studentTab === "all" ? "outlined" : "text"}
                onClick={() => setStudentTab("all")}
                sx={{
                  borderColor: "white",
                  backgroundColor: studentTab === "all" ? "rgba(255,255,255,0.15)" : "transparent",
                }}
              >
                Browse Courses
              </Button>
              <Button
                color="inherit"
                startIcon={<BookmarkAddedIcon />}
                variant={studentTab === "enrolled" ? "outlined" : "text"}
                onClick={() => setStudentTab("enrolled")}
                sx={{
                  borderColor: "white",
                  backgroundColor: studentTab === "enrolled" ? "rgba(255,255,255,0.15)" : "transparent",
                }}
              >
                My Enrolled Courses
              </Button>
            </Stack>
          )}

          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                {user.username}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                color={isTeacher ? "primary" : "secondary"}
                sx={{ fontWeight: "bold" }}
              />
            </Stack>

            <Button
              color="inherit"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {isTeacher ? (
          <TeacherCourses />
        ) : studentTab === "enrolled" ? (
          <StudentEnrolledCourses />
        ) : (
          <StudentCourses />
        )}
      </Container>

      <Box component="footer" sx={{ py: 2, textAlign: "center", backgroundColor: "#e2e8f0", mt: "auto" }}>
        <Typography variant="caption" color="text.secondary">
          Vincent Mary School of Engineering, Science and Technology | CSX4107 Final Exam
        </Typography>
      </Box>
    </Box>
  );
}
