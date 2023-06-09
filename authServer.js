require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

let refreshTokens = []; // can be store in DB
const PORT = 4000;

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/login", (req, res) => {
  //Authenticate User
  const username = req.body.username;
  const user = { name: username };

  // const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  return res.json({ accessToken: accessToken, refreshToken: refreshToken });
  // res.json({ accessToken: accessToken });
});

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
};

app.listen(PORT);
