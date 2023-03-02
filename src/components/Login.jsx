import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Container } from "@mui/system";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  TextField,
  FormHelperText,
  Typography,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  Stack,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import YupPassword from "yup-password";

import CustomAlert from "./CustomAlert";
import { loadFromLocalStorage, saveToLocalStorage } from "../utils";

YupPassword(yup);

const TEST_USERNAME = "testuser1";
const TEST_EMAIL = "testuser@gmail.com";
const TEST_PASSWORD = "Testpass1!";

const Login = ({ setLoginToken }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginView, setLoginView] = useState(true);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);

  const [open, setOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState({});
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

  const inputChangeHandler = (value) => {
    setUserData(value);
  };
  const showPasswordClickedHandler = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const toggleViewClickedHandler = (bool) => {
    setLoginView(bool);
  };

  const loginButtonClickedHandler = () => {
    if (
      userData.username === TEST_USERNAME &&
      userData.email === TEST_EMAIL &&
      userData.password === TEST_PASSWORD
    ) {
      setAlertOptions({
        severity: "success",
        message: "Login successful!",
      });

      setOpen(true);
      return handleAuthentication();
    } else {
      let users = loadFromLocalStorage("users");
      if (users) {
        const filteredUsers = users.filter((user) => {
          return (
            userData.username === user.username &&
            userData.email === user.email &&
            userData.password === user.password
          );
        });

        if (filteredUsers.length > 0) {
          setAlertOptions({
            severity: "success",
            message: "Login successful!",
          });

          setOpen(true);
          return handleAuthentication();
        }

        console.log(filteredUsers);
      }

      setAlertOptions({
        severity: "error",
        message: "Credentials are not valid. Register a new user first!",
      });
      setOpen(true);
    }
  };

  const registerButtonClickedHandler = () => {
    // Get current users in localStorage.
    if (!loadFromLocalStorage("users")) saveToLocalStorage("users", []);
    let savedUsers = loadFromLocalStorage("users");

    // Check if current userData is not present in savedUsers
    // already, specifically we check if email is present.
    const foundUsers = savedUsers.find((user) => user.email === userData.email);

    if (foundUsers) {
      console.log(
        `User with email ${userData.email} already found on localStorage!`
      );

      setAlertOptions({
        severity: "warning",
        message: "A user with that email is already registered!",
      });
    } else {
      console.log(
        `User with email ${userData.email} NOT found on localStorage, registering!`
      );
      savedUsers.push(userData);
      saveToLocalStorage("users", savedUsers);

      setAlertOptions({
        severity: "success",
        message: "Registering user!",
      });

      console.log("User successfully registered!");
      console.log("Current localStorage users: ");
      console.log(loadFromLocalStorage("users"));
      handleAuthentication();
    }
    setOpen(true);
  };

  const handleAuthentication = () => {
    // Save user's credentials on localStorage under "lastLoginCredentials".
    // This will be used for Remember Me and logout features.
    rememberMe && saveToLocalStorage("lastLoginCredentials", userData);

    // Show loading spinner for one second.
    setTimeout(() => {
      setShowLoadingSpinner(true);
      setTimeout(() => {
        // Show the app.
        setLoginToken(true);
      }, 1000);
    }, 1000);
  };

  const validationSchema = yup.object().shape({
    username: yup
      .string()
      .required()
      .min(6, "Username must be at least 6 characters"),
    email: yup.string().required().email(),
    password: yup.string().password().required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  return (
    <Container
      sx={{
        marginTop: "200px",
      }}
    >
      {showLoadingSpinner ? (
        <Box
          sx={{
            position: "relative",
            top: "100px",
            display: "flex",
            justifyContent: "center",
            mx: "auto",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box
          component="form"
          sx={{
            mx: "auto",
            maxWidth: "500px",
          }}
        >
          <Stack spacing={2}>
            <CustomAlert
              severity={alertOptions.severity}
              message={alertOptions.message}
              open={open}
              setOpen={setOpen}
            />

            <TextField
              id="username"
              placeholder="Enter username"
              label="Username"
              variant="outlined"
              required
              {...register("username")}
              error={errors.username ? true : false}
              helperText={errors.username?.message}
              onChange={(event) =>
                inputChangeHandler({
                  ...userData,
                  username: event.target.value,
                })
              }
            />

            <TextField
              id="email"
              placeholder="Enter email"
              label="Email"
              variant="outlined"
              required
              {...register("email")}
              error={errors.email ? true : false}
              helperText={errors.email?.message}
              onChange={(event) =>
                inputChangeHandler({ ...userData, email: event.target.value })
              }
            />

            <FormControl required={true} error={errors.password ? true : false}>
              <InputLabel htmlFor="outlined-adornment-password">
                Password
              </InputLabel>

              <OutlinedInput
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter password"
                {...register("password")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={showPasswordClickedHandler}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                onChange={(event) =>
                  inputChangeHandler({
                    ...userData,
                    password: event.target.value,
                  })
                }
              />
              <FormHelperText>{errors.password?.message}</FormHelperText>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) => {
                    setRememberMe(event.target.checked);
                  }}
                />
              }
              label="Remember me"
            />

            <Box>
              <Button
                variant="contained"
                style={{
                  margin: "10px auto 20px",
                  width: "200px",
                  backgroundColor: "#ffc93d",
                }}
                onClick={handleSubmit(
                  isLoginView
                    ? loginButtonClickedHandler
                    : registerButtonClickedHandler
                )}
              >
                {isLoginView ? "Login" : "Register"}
              </Button>

              {isLoginView ? (
                <p onClick={() => toggleViewClickedHandler(false)}>
                  <Typography align="center">
                    You don&apos;t have an account?{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "orange",
                        cursor: "pointer",
                      }}
                    >
                      Register here!
                    </span>
                  </Typography>
                </p>
              ) : (
                <p onClick={() => toggleViewClickedHandler(true)}>
                  <Typography align="center">
                    You already have an account?{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "orange",
                        cursor: "pointer",
                      }}
                    >
                      Login here!
                    </span>
                  </Typography>
                </p>
              )}
            </Box>
          </Stack>
        </Box>
      )}
    </Container>
  );
};

Login.propTypes = {
  setLoginToken: PropTypes.func,
};

export default Login;
