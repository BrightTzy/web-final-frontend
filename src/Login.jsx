// src/Login.jsx

import { useContext, useEffect, useState } from "react";
import { UserContext } from "./context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Tabs,
  Tab,
  MenuItem,
  CircularProgress,
  Stack,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

export default function LoginPage() {
  const [tabIndex, setTabIndex] = useState(0); // 0: Login, 1: Register

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Student");
  const [regError, setRegError] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login, register, isLoggedIn, isLogInError, loginErrorMsg, isInitializing } =
    useContext(UserContext);

  useEffect(() => {
    if (!isInitializing && isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, isInitializing, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) return;
    setLoading(true);
    await login(loginIdentifier, loginPassword);
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");

    if (!regUsername.trim()) {
      setRegError("Username is required");
      return;
    }
    if (!regEmail.trim()) {
      setRegError("Email is required");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const result = await register(
      regUsername.trim(),
      regEmail.trim(),
      regPassword,
      regRole,
    );
    setLoading(false);

    if (!result.success) {
      setRegError(result.message || "Registration failed");
    }
  };

  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: "#f0f2f5", p: 2 }}
    >
      <Card sx={{ maxWidth: 460, width: "100%", boxShadow: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <SchoolIcon color="primary" sx={{ fontSize: 36 }} />
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              Online Course Service
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Assumption University Course Portal
          </Typography>

          <Tabs
            value={tabIndex}
            onChange={(e, val) => {
              setTabIndex(val);
              setRegError("");
            }}
            variant="fullWidth"
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Sign In" sx={{ fontWeight: "bold" }} />
            <Tab label="Register" sx={{ fontWeight: "bold" }} />
          </Tabs>

          {/* SIGN IN TAB */}
          {tabIndex === 0 && (
            <Box>
              {isLogInError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {loginErrorMsg}
                </Alert>
              )}

              <form onSubmit={handleLoginSubmit}>
                <TextField
                  fullWidth
                  label="Email or Username"
                  variant="outlined"
                  margin="normal"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  autoFocus
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, py: 1.2, fontWeight: "bold" }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                </Button>
              </form>

              <Box mt={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setTabIndex(1);
                      setRegError("");
                    }}
                    sx={{ textTransform: "none", fontWeight: "bold" }}
                  >
                    Register here
                  </Button>
                </Typography>
              </Box>
            </Box>
          )}

          {/* REGISTER TAB */}
          {tabIndex === 1 && (
            <Box>
              {regError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {regError}
                </Alert>
              )}

              <form onSubmit={handleRegisterSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                  autoFocus
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  margin="normal"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  helperText="Must be at least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />

                <TextField
                  select
                  fullWidth
                  label="Role"
                  variant="outlined"
                  margin="normal"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                >
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Teacher">Teacher</MenuItem>
                </TextField>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, py: 1.2, fontWeight: "bold" }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
                </Button>
              </form>

              <Box mt={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setTabIndex(0)}
                    sx={{ textTransform: "none", fontWeight: "bold" }}
                  >
                    Sign In
                  </Button>
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
