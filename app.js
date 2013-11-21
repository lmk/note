
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , note = require('./routes/note')
  , http = require('http')
  , path = require('path')
  , server = require('./controller/server');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/:id.:format', routes.index);
//app.get('/list', note.list);

/*http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
*/
var serverSocket = require('socket.io').listen(app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
}));

server.init({
  dataDir: __dirname + '/data', 
  serverSocket: serverSocket
});
serverSocket.sockets.on('connection', server.connection );

