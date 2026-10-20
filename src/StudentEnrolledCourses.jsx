// src/StudentEnrolledCourses.jsx

import { useContext, useEffect, useState } from "react";
import { UserContext } from "./context/UserContext";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

export default function StudentEnrolledCourses() {
  const { authFetch, user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/course?enrolled=true", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courseList || []);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Failed to load enrolled courses");
      }
    } catch {
      setErrorMsg("Network error loading enrolled courses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">
          My Enrolled Courses
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Courses you are currently registered for.
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#fafafa" }}>
          <Typography variant="h6" color="text.secondary">
            You are not enrolled in any courses yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => {
            const myEnrollment = course.enrolledStudents?.find(
              (s) => String(s.studentId) === String(user?.id),
            );

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
                    borderTop: "4px solid #1976d2",
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {course.name}
                      </Typography>
                      <Chip label={course.status} size="small" color="primary" />
                    </Box>

                    <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Instructor: <strong>{course.teacherName}</strong> ({course.teacherEmail})
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

                    {myEnrollment?.enrolledAt && (
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{ backgroundColor: "#e3f2fd", p: 1, borderRadius: 1 }}
                      >
                        <EventAvailableIcon fontSize="small" color="primary" />
                        <Typography variant="caption" color="text.secondary">
                          Enrolled on: {new Date(myEnrollment.enrolledAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
