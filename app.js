var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')//for config partials
var db = require('./config/database-connection')//database config
var fileUpload = require('express-fileupload')//uploading files
var session = require('express-session')


var userRouter = require('./routes/user');
const { dirname } = require('path');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/',partialsDir:__dirname+'/views/partials/'}))

//middlewears
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())//uploading files
app.use(session({secret:"key",cookie:{maxAge:60000000}}))//session creation


//database connection
db.connect((err,)=>{
  if(err) 
  console.log(err);
  else
  console.log("Databae connection established........");
})




//routes
app.use('/', userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
