var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');

//Include Sequelize
const { sequelize } = require('./models');

// Set up api routes
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

//set up bodyParser
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);



// Set up connection test
const authentication = async ()=>{
  try{
    await sequelize.authenticate();
    console.log('Connection successful');
  } catch(err){
      console.log('No connection', err);
  }  
}

authentication();

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';



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
  res.send('error');
});

// choose a port
app.set('port', process.env.PORT || 5000);

//Send message from server
const server = app.listen(app.get('port'), ()=>{
  console.log(`Express server is listening on port ${server.address().port}`);
});


module.exports = app;
