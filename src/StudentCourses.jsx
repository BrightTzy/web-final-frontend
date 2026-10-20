// src/StudentCourses.jsx

import { useContext, useEffect, useState } from "react";
import { UserContext } from "./context/UserContext";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Grid,
  InputAdornment,
  CircularProgress,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";

export default function StudentCourses() {
  const { authFetch, user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Details dialog
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async (searchTerm = search) => {
    setLoading(true);
    try {
      const url = searchTerm
        ? `/api/course?search=${encodeURIComponent(searchTerm)}`
        : "/api/course";
      const res = await authFetch(url, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courseList || []);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Failed to load courses");
      }
    } catch {
      setErrorMsg("Network error loading courses");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCourses(search);
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await authFetch(`/api/course/${courseId}/enroll`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || "Enrolled successfully!");
        loadCourses();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(data.message || "Enrollment failed");
      }
    } catch {
      setErrorMsg("Network error during enrollment");
    } finally {
      setEnrollingId(null);
    }
  };

  const handleOpenDetails = (course) => {
    setSelectedCourse(course);
    setOpenDetails(true);
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Available Courses
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse open courses and enroll before seats run out.
        </Typography>
      </Box>

      {/* SEARCH / FILTER BAR */}
      <Paper component="form" onSubmit={handleSearchSubmit} sx={{ p: 2, mb: 3 }} elevation={1}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Filter courses by course name or teacher name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ minWidth: 110, fontWeight: "bold" }}
          >
            Search
          </Button>
          {search && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearch("");
                loadCourses("");
              }}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Paper>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#fafafa" }}>
          <Typography variant="h6" color="text.secondary">
            No courses found matching your criteria.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => {
            const enrolledCount = course.enrolledStudents ? course.enrolledStudents.length : 0;
            const isFull = enrolledCount >= course.maxStudents;
            const isOpen = course.status === "Open";
            const isAlreadyEnrolled =
              course.enrolledStudents &&
              course.enrolledStudents.some((s) => String(s.studentId) === String(user?.id));
            const canEnroll = isOpen && !isFull && !isAlreadyEnrolled;

            return (
              <Grid item xs={12} md={6} lg={4} key={course._id}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 2,
                    border: isAlreadyEnrolled ? "2px solid #4caf50" : "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {course.name}
                      </Typography>
                      <Chip
                        label={course.status}
                        size="small"
                        color={isOpen ? "success" : "warning"}
                      />
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Instructor: <strong>{course.teacherName}</strong>
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={0.5} mb={2}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Duration: {course.duration} days
                      </Typography>
                    </Stack>

                    <Box mb={2}>
                      <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                        Topics:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {Array.isArray(course.topics) &&
                          course.topics.map((t, i) => (
                            <Chip key={i} label={t} size="small" variant="outlined" />
                          ))}
                      </Stack>
                    </Box>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ backgroundColor: "#f5f5f5", p: 1.5, borderRadius: 1 }}
                    >
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        ${course.price}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Seats: <strong>{enrolledCount}</strong> / {course.maxStudents}
                        {isFull && <span style={{ color: "red" }}> (Full)</span>}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between" }}>
                    <Button size="small" onClick={() => handleOpenDetails(course)}>
                      Details
                    </Button>

                    {isAlreadyEnrolled ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Enrolled"
                        color="success"
                        variant="filled"
                      />
                    ) : !isOpen ? (
                      <Chip
                        icon={<BlockIcon />}
                        label="Closed"
                        color="warning"
                        variant="outlined"
                      />
                    ) : isFull ? (
                      <Chip
                        icon={<BlockIcon />}
                        label="No Seats"
                        color="error"
                        variant="outlined"
                      />
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<HowToRegIcon />}
                        disabled={enrollingId === course._id}
                        onClick={() => handleEnroll(course._id)}
                      >
                        {enrollingId === course._id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Enroll"
                        )}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* COURSE DETAILS MODAL */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Course Details</DialogTitle>
        <DialogContent dividers>
          {selectedCourse && (
            <Box>
              <Typography variant="h6" color="primary.main" gutterBottom>
                {selectedCourse.name}
              </Typography>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                <Typography variant="body2">
                  <strong>Instructor:</strong> {selectedCourse.teacherName}
                </Typography>
                <Typography variant="body2">
                  <strong>Contact:</strong> {selectedCourse.teacherEmail}
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {selectedCourse.duration} days
                </Typography>
                <Typography variant="body2">
                  <strong>Price:</strong> ${selectedCourse.price}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong>{" "}
                  <Chip
                    label={selectedCourse.status}
                    size="small"
                    color={selectedCourse.status === "Open" ? "success" : "warning"}
                  />
                </Typography>
                <Typography variant="body2">
                  <strong>Available Seats:</strong>{" "}
                  {selectedCourse.maxStudents -
                    (selectedCourse.enrolledStudents
                      ? selectedCourse.enrolledStudents.length
                      : 0)}{" "}
                  remaining
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                <strong>Topics Covered:</strong>
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {Array.isArray(selectedCourse.topics) &&
                  selectedCourse.topics.map((t, i) => (
                    <Chip key={i} label={t} color="primary" variant="outlined" />
                  ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
