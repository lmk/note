
var fs = require('fs');
var io = null;
var dataDir = null;
var notes = [];

/* @brif Get Index in notes Array by Name
 * @param[in] name name
 * @retval index
 */
function getNoteIdByName(name) {
  for(var i in notes) {
    if( notes[i].name === name ) return i;
  }

  return -1;
}

function normalizePosition(position) {
  position = position || {};
  var column = position.column != null ? position.column : position.col;
  return {
    row: position.row || 0,
    column: column || 0
  };
}

/* @brif server initinailize 
 * @param[in] cfg option
 * @remark default load
 */
exports.init = function (cfg) {
  io = cfg.io;
  dataDir = cfg.dataDir;
  const fs = require('fs');
  !fs.existsSync(dataDir) && fs.mkdirSync(dataDir);
}

exports.connection = function(socket){

  console.log("in exports.connection")
  socket.on('disconnect', function(){
    console.log("disconnect "+ socket.data.noteId);
  });

  socket.on('init', function(data){

    var note;

    // notes check
    var noteId = getNoteIdByName(data.name);

    if ( noteId === -1 ) {

      noteId = notes.length;

      note = {
        id: noteId,
        name: data.name,
        position: {row: 0, column: 0},
        content: ''
      };

      notes.push(note);
    } else {
      note = notes[noteId];
    };
    
    // grouping page name 
    socket.join(''+noteId);
    socket.data.noteId = noteId;

    // data file open
    fs.readFile(dataDir+'/'+data.name+'.pos'
      , {'encoding': 'utf8'}
      , function(error, raw){
          if ( error ) {
            if ( error.code !== 'ENOENT' ) console.log(error);
            return;
          }
          if ( !raw || !String(raw).trim() ) return;
          try {
            notes[noteId].position = normalizePosition(JSON.parse(raw));
          } catch (e) {
            console.log('invalid position file', data.name, e.message);
          }
    });

    fs.readFile(dataDir+'/'+data.name+'.dat'
      , {'encoding': 'utf8'}
      , function(error, raw){
          if ( error ) {
            if ( error.code !== 'ENOENT' ) console.log(error);
          } else if ( typeof raw === 'string' ) {
            notes[noteId].content = raw;
          }

          socket.emit('initAck', { 
            'id': socket.id, 
            'content': notes[noteId].content != null ? notes[noteId].content : '',
            'position': normalizePosition(notes[noteId].position)
          });
    });
  });

  socket.on('send', function(data){
    var noteId = socket.data.noteId
      var note = notes[noteId];
      if ( !note ) return;

      if ( data.position ) {
        note.position = normalizePosition(data.position);  
        fs.writeFile(dataDir + '/' + note.name + '.pos'
          , JSON.stringify( note.position, null, 2)
          , {'encoding': 'utf8'},
          function(error) {
            if (error) console.log(error);
        });
      }

      /* content가 바뀌면 저장 (빈 문자열 포함) */
      if ( typeof data.content === 'string' && note.content !== data.content ){
        note.content = data.content; 
        fs.writeFile(dataDir + '/' + note.name + '.dat'
          , note.content
          , {'encoding': 'utf8'}
          , function(error){
          if (error) console.log(error);
        });

        io.sockets.in(''+noteId).emit('recv', data);
      }
  });
};
