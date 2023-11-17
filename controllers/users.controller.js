const usersCtrl = {};
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const config = require("../config/auth.config.js");
const Users = require("../models/Users");
const commonFun = require("./common-function");
const emailFun = require("./email");

usersCtrl.create = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    countrycode,
    mobile,
    gender,
    password,
    user_type,
  } = req.body;
  // Saving a New User
  const newUser = new Users({
    first_name,
    last_name,
    email,
    mobile,
    password,
    user_type,
    countrycode,
    gender,
  });
  await newUser
    .save()
    .then((user) => {
      res.status(201).json({
        message: "User created successfully.",
      });
    })
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.update = (req, res) => {
  const { first_name, last_name, email, countrycode, mobile, gender } =
    req.body;
  Users.findByIdAndUpdate(req.params.Id, {
    first_name: first_name,
    last_name: last_name,
    email: email,
    mobile: mobile,
    countrycode: countrycode,
    gender: gender,
  })
    .then((user) =>
      res.status(200).send({ message: "User updated successfully." })
    )
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.retrieve = (req, res) => {
  return Users.findById({ _id: req.params.Id })
    .then((user) => res.status(200).send(user))
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.retrieve_by_email = (req, res) => {
  return Users.findOne({
    email: req.body.email,
    is_deleted: false,
  })
    .then((user) => {
      if (!user) {
        return res.status(202).send({
          message: "Email Not Found",
        });
      }
      return res.status(200).send(user);
    })
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.user_login = (req, res) => {
  const { email, password } = req.body;
  return Users.findOne({
    $and: [
      { is_deleted: false, user_type: 2 },
      {
        $or: [{ email: email }, { mobile: email }],
      },
    ],
  })
    .then((user) => {
      if (!user) {
        return res.status(400).send({
          errors: { email: "User not found!" },
        });
      }
      if (user.status === false) {
        //email send
        let subject = "Account Activation";
        let otp = commonFun.generateOtp();
        let body = "Your Account Activation OTP is " + otp;
        var mailOptions = {
          from: "wowbridge.business@gmail.com",
          to: user.email,
          subject: subject,
          text: body,
        };
        return emailFun.transporter.sendMail(
          mailOptions,
          function (error, info) {
            if (error) {
              return res
                .status(400)
                .send({ errors: { email: "User not activated!" } });
            } else {
              const accessToken = jwt.sign({ userId: user._id }, config.secret);
              Users.findByIdAndUpdate(user._id, { otp: otp }).then(() => {
                res.status(400).send({
                  message: "OTP update fail.",
                });
              });
              return res.status(203).send({
                result: accessToken,
                message: "Your OTP successfully sent in your email.",
              });
            }
          }
        );
        //end email send
      }
      if (user.password !== password) {
        return res.status(400).send({
          errors: { password: "Incorrect password!" },
        });
      }
      // Generate an access token
      let d = new Date();
      let n = d.getTime();
      let auth_token = md5(n);
      let logged_user = {
        first_name: user.first_name,
        last_name: user.last_name,
        image: user.image,
        type: user.user_type,
      };
      Users.findByIdAndUpdate(user._id, { auth_token: auth_token }).then(() => {
        res.status(400).send({
          message: "Token update fail.",
        });
      });
      const accessToken = jwt.sign(
        { userId: user._id, auth_token: user.auth_token },
        config.secret
      );
      return res.status(200).send({ token: accessToken, user: logged_user });
    })
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.status_update = (req, res) => {
  var ids = req.body.ids.split(",");
  var status = req.body.status ? true : false;
  Users.updateMany(
    { _id: { $in: ids } },
    { $set: { status: status, updatedAt: new Date() } }
  )
    .then(() =>
      res.status(200).send({
        message: status
          ? "User activated successfully."
          : "User deactivated successfully.",
      })
    )
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.delete = (req, res) => {
  var ids = req.body.ids.split(",");
  Users.updateMany({ _id: { $in: ids } }, { $set: { is_deleted: true } })
    .then(() => res.status(200).send({ message: "User deleted successfully." }))
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.list = (req, res) => {
  const { page, limit, order, orderBy, status, search } = req.query;
  const offset = Number(limit) * (Number(page) - 1);
  const sort = order === "asc" ? 1 : -1;
  const searchTxt = search ? search : "";

  var sortObject = {};
  sortObject[orderBy] = sort;
  const filter = {
    $and: [
      { is_deleted: false, user_type: 2 },
      {
        $or: [
          { first_name: { $regex: `${searchTxt}`, $options: "i" } },
          { last_name: { $regex: `${searchTxt}`, $options: "i" } },
          { email: { $regex: `${searchTxt}`, $options: "i" } },
          { gender: { $regex: `${searchTxt}`, $options: "i" } },
          { mobile: { $regex: `${searchTxt}`, $options: "i" } },
        ],
      },
    ],
  };
  Users.countDocuments(filter, function (err, count) {
    Users.find(filter, function (err, result) {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ count: count, result: result });
    })
      .sort(sortObject)
      .skip(offset)
      .limit(Number(limit));
  });
};

usersCtrl.update_profile_image = (req, res) => {
  const { url } = req.body;
  return Users.findById({ _id: req.user.userId })
    .then((user) => {
      if (!user) {
        return res.status(400).send({
          message: "You have no access!",
        });
      }
      return Users.findByIdAndUpdate(user._id, {
        image: url,
      })
        .then(() =>
          res
            .status(200)
            .send({ message: "Profile image successfully updated!" })
        ) // Send back the updated todo.
        .catch((error) =>
          res
            .status(400)
            .send({ message: "Errors in upload please try again!" })
        );
    })
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.profile_details = (req, res) => {
  const { url } = req.body;
  return Users.findById(
    { _id: req.user.userId },
    {
      image: 1,
      updatedAt: 1,
      first_name: 1,
      last_name: 1,
      email: 1,
      countrycode: 1,
      mobile: 1,
      gender: 1,
      status: 1,
      _id: 0,
    }
  )
    .then((user) => res.status(200).send(user))
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.update_profile = (req, res) => {
  const { first_name, last_name, email, countrycode, mobile, gender } =
    req.body;
  Users.findByIdAndUpdate(req.user.userId, {
    first_name: first_name,
    last_name: last_name,
    email: email,
    mobile: mobile,
    countrycode: countrycode,
    gender: gender,
  })
    .then((user) =>
      res.status(200).send({ message: "Profile updated successfully." })
    )
    .catch((error) => res.status(400).send({ errors: error }));
};

usersCtrl.users_data = (req, res) => {
  const { page, limit, order, orderBy, status, search } = req.query;
  const offset = Number(limit) * (Number(page) - 1);
  const sort = order === "asc" ? 1 : -1;
  const searchTxt = search ? search : "";

  var sortObject = {};
  sortObject[orderBy] = sort;
  const filter = {
    $and: [
      { is_deleted: false, user_type: 2 },
      {
        $or: [
          { first_name: { $regex: `${searchTxt}`, $options: "i" } },
          { last_name: { $regex: `${searchTxt}`, $options: "i" } },
          { email: { $regex: `${searchTxt}`, $options: "i" } },
          { gender: { $regex: `${searchTxt}`, $options: "i" } },
          { mobile: { $regex: `${searchTxt}`, $options: "i" } },
        ],
      },
    ],
  };
  Users.countDocuments(filter, function (err, count) {
    Users.find(
      filter,
      {
        _id: 0,
        password: 0,
        auth_token: 0,
        otp: 0,
        reset_password_token: 0,
        user_type: 0,
      },
      function (err, result) {
        if (err) return res.status(500).json(err);
        return res.status(200).json({ count: count, result: result });
      }
    )
      .sort(sortObject)
      .skip(offset)
      .limit(Number(limit));
  });
};

module.exports = usersCtrl;
