const Users = require('../models/Users');

checkDuplicateEmailorMobile = (req, res, next) => {
  // Email
  Users.findOne({
      email: req.body.email,
      is_deleted:false
  }).then(user => {
    if (user) {
      res.status(400).send({
        errors: { email: "Failed! Email is already in use!" }
      });
      return;
    }

    // Mobile
    Users.findOne({
        mobile: req.body.mobile,
        is_deleted:false
    }).then(user => {
      if (user) {
        res.status(400).send({
          errors: { mobile: "Failed! Mobile is already in use!" }
        });
        return;
      }

      next();
    });
  });
};


const verifySignUp = {
  checkDuplicateEmailorMobile: checkDuplicateEmailorMobile,
};

module.exports = verifySignUp;