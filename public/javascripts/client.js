var editor;

$(document).ready(function(){
  var editorReady = false;
  var hasConnectedOnce = false;
  var pendingFlush = false;
  var isComposing = false;
  var hideBannerTimer = null;
  var socket = io.connect('/', {
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
  });

  var $banner = $('#connection-status');
  var $bannerText = $('#connection-status-text');
  var $bannerAction = $('#connection-status-action');

  function setConnectionStatus(state, message, showReload) {
    if (hideBannerTimer) {
      clearTimeout(hideBannerTimer);
      hideBannerTimer = null;
    }

    $banner
      .removeClass('is-hidden is-offline is-reconnecting is-online is-failed')
      .addClass('is-' + state);

    $bannerText.text(message || '');

    if (showReload) {
      $bannerAction.removeClass('is-hidden');
    } else {
      $bannerAction.addClass('is-hidden');
    }

    if (state === 'online') {
      hideBannerTimer = setTimeout(function(){
        $banner.addClass('is-hidden');
      }, 1500);
    }
  }

  function requestSession() {
    socket.emit('init', info);
  }

  function emitCurrentDocument() {
    if (!editor || !socket.connected || !info.id || isComposing) return;

    var position = editor.getCursorPosition();
    socket.emit('send', {
      'tid': '' + info.id + new Date().getTime(),
      'owner': info.id,
      'document': info.document,
      'content': editor.getSession().getValue(),
      'position': {
        'row': position.row,
        'column': position.column
      }
    });
    pendingFlush = false;
  }

  function scheduleEmit(e) {
    if (isComposing || (e && e.originalEvent && e.originalEvent.isComposing)) {
      pendingFlush = true;
      return;
    }
    if (!socket.connected || !info.id) {
      pendingFlush = true;
      return;
    }
    emitCurrentDocument();
  }

  function applyRemoteUpdate(data) {
    if ( typeof data.content === 'string' && editor.getSession().getValue() !== data.content ) {
      editor.getSession().setValue(data.content);
    }

    if ( data.position ) {
      editor.moveCursorToPosition({
        row: data.position.row || 0,
        column: (data.position.column != null ? data.position.column : data.position.col) || 0
      });
    }
  }

  function bindEditorEvents() {
    var editorDom = document.getElementById('editor');

    // Capture on the editor root so Ace's inner textarea is covered.
    editorDom.addEventListener('compositionstart', function(){
      isComposing = true;
    }, true);

    editorDom.addEventListener('compositionend', function(){
      isComposing = false;
      // Commit after IME finishes so intermediate jamo are not synced,
      // and so Ace can finish its own composition cleanup first.
      setTimeout(function(){
        if (!isComposing && pendingFlush) emitCurrentDocument();
      }, 0);
    }, true);

    $('#editor').on('keyup.noteSync', scheduleEmit);
  }

  function ensureEditor(data) {
    info.id = data.id;

    if (editorReady) {
      if (pendingFlush) emitCurrentDocument();
      return;
    }

    ace.config.set('basePath', '/javascripts/ace-editor');
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.setFontSize(info.sz || 16);
    editor.session.setMode("ace/mode/" + getFileType(document.URL.split('.').pop()));
    editor.session.setTabSize(2);

    var content = (data && data.content != null) ? data.content : '';
    var position = {
      row: (data.position && data.position.row) || 0,
      column: (data.position && (data.position.column != null ? data.position.column : data.position.col)) || 0
    };

    editor.getSession().setValue(content);
    editor.moveCursorToPosition(position);
    bindEditorEvents();
    editorReady = true;
  }

  socket.on('connect', function(){
    requestSession();

    if (hasConnectedOnce) {
      setConnectionStatus('online', '연결됨');
    }
    hasConnectedOnce = true;
  });

  socket.on('disconnect', function(){
    pendingFlush = true;
    setConnectionStatus('offline', '연결이 끊겼습니다. 재연결 중…');
  });

  socket.on('reconnect_attempt', function(){
    setConnectionStatus('reconnecting', '재연결 중…');
  });

  socket.on('reconnect_failed', function(){
    setConnectionStatus('failed', '연결할 수 없습니다.', true);
  });

  socket.on('connect_error', function(){
    if (!hasConnectedOnce) {
      setConnectionStatus('reconnecting', '서버에 연결하는 중…');
    }
  });

  socket.on('session_required', function(){
    requestSession();
  });

  socket.on('initAck', function(data){
    ensureEditor(data);
  });

  socket.on('recv', function(data){
    if (!editorReady) return;

    /* 내가 요청한 content를 갱신할 필요 없다. */
    if ( data && data.owner && data.owner !== info.id ) {
      // Applying setValue mid-IME breaks composition and can duplicate chars.
      if (isComposing) return;
      applyRemoteUpdate(data);
    }
  });

  $bannerAction.on('click', function(e){
    e.preventDefault();
    window.location.reload();
  });
});
