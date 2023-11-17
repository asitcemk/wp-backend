const usersController = require('./../controllers/users.controller');
const authController = require('./../controllers/auth.controller');
const internationalizationController = require('./../controllers/internationalization.controller');
const columnsController = require('./../controllers/columns.controller');
const uploadsController = require('./../controllers/uploads.controller');
const { authJwt } = require("./../middleware");
const { verifySignUp } = require("./../middleware");



module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome Wowbridge API!',
  }));

  app.post('/api/signup',[authJwt.verifyToken, verifySignUp.checkDuplicateEmailorMobile], authController.signup);
  app.post('/api/check-duplicate-email', [authJwt.verifyToken], usersController.retrieve_by_email);
  app.post('/api/verify-otp', [authJwt.verifyToken], authController.verify_otp);
  app.post('/api/resend-otp', [authJwt.verifyToken], authController.resend_otp);
  app.post('/api/admin/login', [authJwt.verifyToken] , authController.admin_login);
  app.post('/api/forgot-password-email', [authJwt.verifyToken], authController.forgot_password);
  app.post('/api/reset-password', [authJwt.verifyToken], authController.reset_password);
  app.post('/api/login', [authJwt.verifyToken], usersController.user_login);
  app.get('/api/internationalization/en', [authJwt.verifyToken], internationalizationController.english);
  app.get('/api/internationalization/bn', [authJwt.verifyToken], internationalizationController.bengali);
  app.get('/api/internationalization/hindi', [authJwt.verifyToken], internationalizationController.hindi);
  app.post('/api/internationalization/save/en', [authJwt.verifyToken], internationalizationController.save);
  app.get('/api/internationalization', [authJwt.verifyToken, authJwt.isAdmin], internationalizationController.list);
  app.get('/api/internationalization/details/:internationalizationId', [authJwt.verifyToken, authJwt.isAdmin], internationalizationController.retrieve);
  app.put('/api/internationalization/update/:internationalizationId', [authJwt.verifyToken, authJwt.isAdmin], internationalizationController.update);

  app.put('/api/internationalization/delete', [authJwt.verifyToken, authJwt.isAdmin], internationalizationController.delete);
  app.put('/api/internationalization/status', [authJwt.verifyToken, authJwt.isAdmin], internationalizationController.status_update);

  app.get('/api/columns/details/:Id', [authJwt.verifyToken, authJwt.isAdmin], columnsController.retrieve);
  app.post('/api/columns/create', [authJwt.verifyToken, authJwt.isAdmin], columnsController.create);
  app.get('/api/columns/list', [authJwt.verifyToken, authJwt.isAdmin], columnsController.list);
  app.put('/api/columns/update/:Id', [authJwt.verifyToken, authJwt.isAdmin], columnsController.update);
  app.get('/api/columns/:list_name', [authJwt.verifyToken, authJwt.isAdmin], columnsController.details);
  app.put('/api/columns/status', [authJwt.verifyToken, authJwt.isAdmin], columnsController.status_update);

  app.get('/api/users', [authJwt.verifyToken, authJwt.isAdmin], usersController.list);
  app.post('/api/users/create', [authJwt.verifyToken, authJwt.isAdmin], usersController.create);
  app.put('/api/users/update/:Id', [authJwt.verifyToken, authJwt.isAdmin], usersController.update);
  app.get('/api/users/details/:Id', [authJwt.verifyToken, authJwt.isAdmin], usersController.retrieve);
  app.put('/api/users/delete', [authJwt.verifyToken, authJwt.isAdmin], usersController.delete);
  app.put('/api/users/status', [authJwt.verifyToken, authJwt.isAdmin], usersController.status_update);
  app.get('/api/users/profile-details', [authJwt.verifyToken], usersController.profile_details);
  app.post('/api/update-profile-image', [authJwt.verifyToken], usersController.update_profile_image);
  app.put('/api/update-profile', [authJwt.verifyToken], usersController.update_profile);
  app.get('/api/users-data', [authJwt.verifyToken], usersController.users_data);

  app.post('/api/image-upload', [authJwt.verifyToken], uploadsController.image_upload);
 

  // For any other request method on todo items, we're going to return "Method Not Allowed"
  app.all('/api', (req, res) =>
    res.status(405).send({
      message: 'Method Not Allowed',
  }));
};