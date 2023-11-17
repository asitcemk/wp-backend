const authCtrl = {};
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const config = require("../config/auth.config.js");
const Users = require("../models/Users");
const commonFun = require("./common-function");
const emailFun = require("./email");

authCtrl.signup = async (req, res) => {
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
  return await newUser
    .save()
    .then((user) => {
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
      emailFun.transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return res
            .status(400)
            .send({ errors: { email: "Error in send mail!" } });
        } else {
          const accessToken = jwt.sign({ userId: user._id }, config.secret);
          Users.findByIdAndUpdate(user._id, { otp: otp }).then(() => {
            res.status(200).send({
              message: "OTP successfully updated.",
            });
          });
          return res.status(201).send({
            result: accessToken,
            message: "Account created successfully.",
          });
        }
      });
      //end email send
    })
    .catch((error) => res.status(400).send({ errors: error }));
};
authCtrl.admin_login = (req, res) => {
  const { email, password } = req.body;
  return Users.findOne({
    email: email,
    user_type: 1,
    is_deleted: false,
  })
    .then((user) => {
      if (!user) {
        return res.status(400).send({
          errors: { email: "User not found!" },
        });
      }
      if (user.password !== password) {
        return res.status(400).send({
          errors: { password: "Incorrect password!" },
        });
      }
      // Generate an access token
      const d = new Date();
      const n = d.getTime();
      const auth_token = md5(n);
      Users.findByIdAndUpdate(user._id, { auth_token: auth_token }).then(() => {
        res.status(200).send({
          message: "Token successfully updated.",
        });
      });
      const accessToken = jwt.sign(
        { userId: user._id, auth_token: auth_token },
        config.secret
      );
      return res.status(200).send(accessToken);
    })
    .catch((error) => res.status(400).send({ errors: error }));
};

authCtrl.forgot_password = (req, res) => {
  const { email, user_type } = req.body;
  return Users.findOne({
    email: email,
    is_deleted: false,
    user_type: user_type,
  })
    .then((user) => {
      if (!user) {
        return res.status(400).send({
          errors: { email: "User Not Found!" },
        });
      } else {
        //email send
        let subject = "Forgot Password";
        let otp = commonFun.generateOtp();
        let body = "Your forgot password OTP " + otp;
        var mailOptions = {
          from: "wowbridge.business@gmail.com",
          to: user.email,
          subject: subject,
          text: body,
        };
        emailFun.transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            return res
              .status(400)
              .send({ errors: { email: "Error in send mail!" } });
          } else {
            const accessToken = jwt.sign({ userId: user.id }, config.secret);
            Users.findByIdAndUpdate(user._id, { otp: otp }).then(() => {
              res.status(200).send({
                message: "OTP successfully updated.",
              });
            });
            return res.status(200).send({
              result: accessToken,
              message: "Email successfully sent.",
            });
          }
        });
        //end email send
      }
    })
    .catch((error) => res.status(400).send({ errors: error }));
};

authCtrl.verify_otp = (req, res) => {
  const { otp, type } = req.body;
  return Users.findById({ _id: req.user.userId })
    .then((user) => {
      if (!user) {
        return res.status(400).send({
          errors: { otp: "You have no access!" },
        });
      }
      if (user.otp !== otp) {
        return res.status(400).send({
          errors: { otp: "OTP does not match!" },
        });
      }
      if (type === "forgot") {
        return res.status(200).send({ message: "OTP successfully verified!" });
      } else {
        Users.findByIdAndUpdate(user._id, { status: true })
          .then(() => {
            res.status(200).send({
              message: "User successfully updated.",
            });
          })
          .catch((error) => res.status(400).send({ errors: error }));
        let logged_user = {
          first_name: user.first_name,
          last_name: user.last_name,
          image: user.image,
        };
        return res
          .status(200)
          .send({ user: logged_user, message: "User successfully activated!" });
      }
    })
    .catch((error) => res.status(400).send({ errors: error }));
};

authCtrl.reset_password = (req, res) => {
  const { token, password } = req.body;
  return Users.findById({ _id: req.user.userId })
    .then((user) => {
      if (!user) {
        return res.status(400).send({
          errors: { password: "You have no access!" },
        });
      }

      return Users.findByIdAndUpdate(user._id, {
        password: password || user.password,
        otp: "",
        reset_password_token: "",
      })
        .then(() =>
          res.status(200).send({ message: "Password successfully updated!" })
        ) // Send back the updated todo.
        .catch((error) => res.status(400).send({ errors: error }));
    })
    .catch((error) => res.status(400).send({ errors: error }));
};

authCtrl.resend_otp = (req, res) => {
  return Users.findById({ _id: req.user.userId })
    .then((user) => {
      if (user) {
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
              return res.status(400).send({ message: "Error in send mail!" });
            } else {
              return Users.findByIdAndUpdate(user._id, { otp: otp })
                .then(() =>
                  res.status(200).send({
                    message: "Your OTP successfully sent in your email.",
                  })
                )
                .catch((error) => res.status(400).send({ errors: error }));
            }
          }
        );
        //end email send
      } else {
        return res.status(400).send({
          message: "You have no access!",
        });
      }
    })
    .catch((error) => res.status(400).send({ errors: error }));
};

module.exports = authCtrl;
