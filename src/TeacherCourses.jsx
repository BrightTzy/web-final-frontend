// src/TeacherCourses.jsx

import { useContext, useEffect, useState } from "react";
import { UserContext } from "./context/UserContext";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupIcon from "@mui/icons-material/Group";

export default function TeacherCourses() {
  const { authFetch, user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create / Edit modal state
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    topics: "",
    price: "",
    maxStudents: "",
    status: "Open",
  });
  const [formError, setFormError] = useState("");

  // View Details modal state
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Delete confirmation modal state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/course", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courseList || []);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Failed to load courses");
      }
    } catch (err) {
      setErrorMsg("Network error loading courses");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditCourseId(null);
    setFormData({
      name: "",
      duration: "",
      topics: "",
      price: "",
      maxStudents: "",
      status: "Open",
    });
    setFormError("");
    setOpenFormDialog(true);
  };

  const handleOpenEdit = (course) => {
    setIsEditing(true);
    setEditCourseId(course._id);
    setFormData({
      name: course.name,
      duration: course.duration,
      topics: Array.isArray(course.topics)
        ? course.topics.join(", ")
        : course.topics,
      price: course.price,
      maxStudents: course.maxStudents,
      status: course.status,
    });
    setFormError("");
    setOpenFormDialog(true);
  };

  const handleOpenDetails = async (courseId) => {
    try {
      const res = await authFetch(`/api/course/${courseId}`, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setSelectedCourse(data.course);
        setOpenDetailsDialog(true);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Failed to fetch course details");
      }
    } catch {
      setErrorMsg("Error loading course details");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Course name is required");
      return;
    }
    if (!formData.duration || Number(formData.duration) <= 0) {
      setFormError("Duration must be a positive number of days");
      return;
    }
    if (!formData.topics.trim()) {
      setFormError("At least one topic is required");
      return;
    }
    if (formData.price === "" || Number(formData.price) < 0) {
      setFormError("Price must be a valid non-negative number");
      return;
    }
    if (!formData.maxStudents || Number(formData.maxStudents) <= 0) {
      setFormError("Max Student must be a positive number");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      duration: Number(formData.duration),
      topics: formData.topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      price: Number(formData.price),
      maxStudents: Number(formData.maxStudents),
      status: formData.status,
    };

    try {
      const url = isEditing ? `/api/course/${editCourseId}` : "/api/course";
      const method = isEditing ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setOpenFormDialog(false);
        setSuccessMsg(
          isEditing
            ? "Course updated successfully!"
            : "Course created successfully!",
        );
        loadCourses();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setFormError(data.message || "Operation failed");
      }
    } catch {
      setFormError("Network error occurred");
    }
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      const res = await authFetch(`/api/course/${courseToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setOpenDeleteDialog(false);
        setCourseToDelete(null);
        setSuccessMsg("Course deleted successfully!");
        loadCourses();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(data.message || "Failed to delete course");
        setOpenDeleteDialog(false);
      }
    } catch {
      setErrorMsg("Network error deleting course");
      setOpenDeleteDialog(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "success";
      case "Close":
        return "warning";
      case "Cancel":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <div>
          <Typography variant="h5" fontWeight="bold">
            My Courses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your courses, view enrolled students, and update course
            details.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ fontWeight: "bold" }}
        >
          Create Course
        </Button>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMsg("")}
        >
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#fafafa" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't created any courses yet.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Create your first course
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Course Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Topics</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Enrollment</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => {
                const enrolledCount = course.enrolledStudents
                  ? course.enrolledStudents.length
                  : 0;
                const canDelete = enrolledCount === 0;

                return (
                  <TableRow key={course._id} hover>
                    <TableCell>
                      <Tooltip title="Click to view details & enrolled students">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "primary.main",
                            cursor: "pointer",
                            display: "inline-block",
                            "&:hover": {
                              textDecoration: "underline",
                              color: "primary.dark",
                            },
                          }}
                          onClick={() => handleOpenDetails(course._id)}
                        >
                          {course.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{course.duration} days</TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        gap={0.5}
                      >
                        {Array.isArray(course.topics) &&
                          course.topics.map((topic, i) => (
                            <Chip
                              key={i}
                              label={topic}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                      </Stack>
                    </TableCell>
                    <TableCell>${course.price}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<GroupIcon />}
                        label={`${enrolledCount} / ${course.maxStudents}`}
                        size="small"
                        color={
                          enrolledCount >= course.maxStudents
                            ? "error"
                            : "primary"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={course.status}
                        size="small"
                        color={getStatusColor(course.status)}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Tooltip title="View Details & Enrolled Students">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleOpenDetails(course._id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit Course">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenEdit(course)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            canDelete
                              ? "Delete Course"
                              : "Cannot delete course: Students already enrolled"
                          }
                        >
                          <span>
                            <IconButton
                              color="error"
                              size="small"
                              disabled={!canDelete}
                              onClick={() => {
                                setCourseToDelete(course);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* CREATE / EDIT COURSE DIALOG */}
      <Dialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {isEditing ? "Update Course" : "Create New Course"}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent dividers>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                label="Course Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Duration (days)"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
                <TextField
                  label="Price ($)"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </Stack>

              <TextField
                label="Topics (comma separated)"
                placeholder="e.g. React, Next.js, MongoDB"
                fullWidth
                required
                helperText="Separate multiple topics with commas"
                value={formData.topics}
                onChange={(e) =>
                  setFormData({ ...formData, topics: e.target.value })
                }
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Max Student"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData({ ...formData, maxStudents: e.target.value })
                  }
                />

                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Close">Close</MenuItem>
                  <MenuItem value="Cancel">Cancel</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenFormDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {isEditing ? "Save Changes" : "Create Course"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* VIEW DETAILS & ENROLLED STUDENTS DIALOG */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Course Details</DialogTitle>
        <DialogContent dividers>
          {selectedCourse && (
            <Box>
              <Typography variant="h6" color="primary.main" gutterBottom>
                {selectedCourse.name}
              </Typography>

              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={3}>
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
                    color={getStatusColor(selectedCourse.status)}
                  />
                </Typography>
                <Typography variant="body2">
                  <strong>Capacity:</strong>{" "}
                  {selectedCourse.enrolledStudents
                    ? selectedCourse.enrolledStudents.length
                    : 0}{" "}
                  / {selectedCourse.maxStudents} students
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Topics:</strong>
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {Array.isArray(selectedCourse.topics) &&
                    selectedCourse.topics.map((t, idx) => (
                      <Chip
                        key={idx}
                        label={t}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                </Stack>
              </Box>

              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                sx={{ mt: 3 }}
              >
                Enrolled Students (
                {selectedCourse.enrolledStudents
                  ? selectedCourse.enrolledStudents.length
                  : 0}
                )
              </Typography>

              {!selectedCourse.enrolledStudents ||
              selectedCourse.enrolledStudents.length === 0 ? (
                <Paper
                  sx={{ p: 3, textAlign: "center", backgroundColor: "#f9f9f9" }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No students have enrolled in this course yet.
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Username
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Enrolled Date
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedCourse.enrolledStudents.map((st, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{st.username}</TableCell>
                          <TableCell>{st.email}</TableCell>
                          <TableCell>
                            {st.enrolledAt
                              ? new Date(st.enrolledAt).toLocaleString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete course "
            <strong>{courseToDelete?.name}</strong>"?
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 1 }}
          >
            Note: Only courses with zero enrolled students can be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
