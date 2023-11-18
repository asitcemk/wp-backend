var createError = require('http-errors');
const express = require('express');
var cors = require('cors')
const path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
 
// Initializations
const app = express();

// settings
app.set('port', process.env.PORT || 4000);


// middlewares
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));

app.use(cookieParser());
app.use(cors())
app.use(fileUpload());
app.use(bodyParser.json())
app.set('view engine', 'jade');

// routes
app.options('*', cors());

require('./routes/index')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
}); 

app.use((err, req, res, next) => {
   // set locals, only providing error in development
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});




module.exports = app;