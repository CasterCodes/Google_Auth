const express = require("express");

const cookieParser = require("cookie-parser");

const dotenv = require("dotenv");

dotenv.config({});

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();

// Middleware
app.set("view engine", "ejs");

app.use(express.json());

app.use(cookieParser());

app.post("/login-user", async (req, res) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    res.cookie("session_token", req.body.token);

    res.send("success");
  } catch (error) {
    console.log(process.env.GOOGLE_CLIENT_ID);
    console.log(error);
  }
});

const isAutheticated = async (req, res, next) => {
  try {
    let token = req.cookies["session_token"];

    let user = {};

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    user.name = payload.name;

    user.email = payload.email;

    user.picture = payload.picture;

    req.user = user;

    next();
  } catch (error) {
    res.redirect("/login");
  }
};

// Routes

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/dashboard", isAutheticated, (req, res) => {
  const user = req.user;

  res.render("dashboard", { user });
});

app.get("/profile", isAutheticated, (req, res) => {
  const user = req.user;
  res.render("profile", { user });
});

app.get("/logout", (req, res) => {
  res.clearCookie("session-token");
  res.redirect("/login");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
