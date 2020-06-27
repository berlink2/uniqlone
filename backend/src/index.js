const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const cookieParser = require("cookie-parser");
const db = require("./db");

const server = createServer();

//Handle cookies
server.express.use(cookieParser());

//Take user id from cookie and add it to cookie
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }

  next();
});

//middleware that populates user on each request
server.express.use(async (req, res, next) => {
  if (!req.userId) {
    return next();
  }
  const user = await db.query.user(
    { where: { id: req.userId } },
    "{id,permissions,name,email}"
  );
  req.user = user;
  next();
});

//TODO populate current users

server.start(
  {
    cors: { credentials: true, origin: process.env.FRONTEND_URL },
  },
  (deets) => {
    console.log(`Server running on port ${deets.port}`);
  }
);
