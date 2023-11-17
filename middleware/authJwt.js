const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const Users = require("../models/Users");
const Roles = require("../models/roles");

verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, config.secret, (err, user) => {
      if (err) {
        return res.status(403).send({
          errors: {
            message: "Access Forbidden!",
          },
        });
      }
      req.user = user;
      next();
      return;
    });
  } else {
    return res.status(401).send({
      errors: {
        message: "Unauthorized to Access!",
      },
    });
  }
};

isAdmin = (req, res, next) => {
  Users.findById({ _id: req.user.userId }).then((user) => {
    if (req.user.auth_token === user.auth_token) {
      if (user.user_type === 1) {
        next();
        return;
      } else {
        return res.status(403).send({
          errors: {
            message: "Require Admin Role!",
          },
        });
      }
    } else {
      return res.status(401).send({
        errors: {
          message: "Unauthorized to Access!",
        },
      });
    }
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};
module.exports = authJwt;
