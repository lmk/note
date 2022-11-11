var express = require('express')
  , routes = require('./routes')
  , favicon = require('serve-favicon')
  , loader = require('./controller/server');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile)
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(__dirname + '/public'));

app.get('/', routes.index);
app.get('/:name.:format', routes.index);

loader.init({
  dataDir: __dirname + '/data', 
  io: io
});

server.listen(app.get('port'), function() {
  console.log('Socket IO server listening on port '+ app.get('port'));
});

io.on('connection', loader.connection );
