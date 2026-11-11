
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
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

function isSafeNoteName(name) {
  return typeof name === 'string'
    && name.length > 0
    && name.indexOf('/') === -1
    && name.indexOf('\\') === -1
    && name.indexOf('\0') === -1
    && name !== '.'
    && name !== '..';
}

function normalizePwd(pwd) {
  if (Array.isArray(pwd)) pwd = pwd[0];
  if (typeof pwd !== 'string') return '';
  return pwd;
}

function passwordPath(name) {
  return path.join(dataDir, name + '.pwd');
}

function hashPassword(salt, pwd) {
  return crypto.createHash('sha256').update(salt + '\n' + pwd, 'utf8').digest('hex');
}

function passwordMatches(stored, pwd) {
  var parts = String(stored).trim().split(':');
  if (parts.length !== 2 || !pwd) return false;

  var actual = hashPassword(parts[0], pwd);
  var expectedBuf = Buffer.from(parts[1]);
  var actualBuf = Buffer.from(actual);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

function createPasswordRecord(pwd) {
  if (!pwd) return '';
  var salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + hashPassword(salt, pwd);
}

function readPasswordRecord(name) {
  try {
    return fs.readFileSync(passwordPath(name), 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    console.log(e);
    return false;
  }
}

function passwordIsSet(stored) {
  return stored != null && String(stored).trim() !== '';
}

function decidePassword(stored, pwd) {
  if (passwordMatches(stored, pwd)) return { ok: true };
  return { ok: false };
}

/* pwd 파일이 없거나 비어 있으면 아직 비밀번호가 없다.
 * 이때 pwd 옵션을 주면 기존 노트에도 비밀번호를 저장한다.
 */
function authorize(name, pwd) {
  pwd = normalizePwd(pwd);
  if (!isSafeNoteName(name) || !dataDir) return { ok: false };

  var file = passwordPath(name);
  var stored = readPasswordRecord(name);
  if (stored === false) return { ok: false };
  if (passwordIsSet(stored)) return decidePassword(stored, pwd);
  if (!pwd) return { ok: true };

  var record = createPasswordRecord(pwd);
  if (stored == null) {
    try {
      fs.writeFileSync(file, record, { encoding: 'utf8', flag: 'wx' });
      return { ok: true };
    } catch (e) {
      if (e.code !== 'EEXIST') {
        console.log(e);
        return { ok: false };
      }
    }

    stored = readPasswordRecord(name);
    if (stored === false || stored == null) return { ok: false };
    if (passwordIsSet(stored)) return decidePassword(stored, pwd);
  }

  try {
    fs.writeFileSync(file, record, { encoding: 'utf8' });
  } catch (e) {
    console.log(e);
    return { ok: false };
  }
  return { ok: true };
}

exports.authorize = authorize;

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
  socket.on('disconnect', function(reason){
    console.log('disconnect', socket.data && socket.data.noteId, reason);
  });

  socket.on('init', function(data){
    data = data || {};

    var access = authorize(data.name, data.pwd);
    if (!access.ok) {
      socket.data.denied = true;
      socket.emit('access_denied');
      return;
    }
    socket.data.denied = false;

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
    if (socket.data && socket.data.denied) {
      socket.emit('access_denied');
      return;
    }

    var noteId = socket.data.noteId
      var note = notes[noteId];
      if ( !note ) {
        socket.emit('session_required');
        return;
      }

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
