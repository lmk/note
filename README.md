Web Notepad
-----------

### 소개
* Web에서 소스 코드를 편집할 수 있는 note pad 입니다.
* 같은 문서를 다른 사용자가 열고 있을 경우 실시간으로 편집 내용이 갱신 됩니다.
* Ace Editor가 지원하는 [100여개 언어](https://github.com/lmk/note/blob/master/public/javascripts/support_extension.js)의 syntax highlighting을 지원 합니다.
* note.js를 스터디 하고자 하는 목적으로 시작했습니다.

### 사용법
1. http://note.newtype.pe.kr/:document.:format 으로 접속 합니다.
   ( 예, http://note.newtype.pe.kr/test1.js )
2. :document에 해당하는 문서가 열리거나 생성됩니다.
3. :format로 문서가 syntax highlighting 됩니다.
4. 같은 문서를 다른 사용자가 열고 있을 경우 실시간으로 편집 내용이 갱신 됩니다.

### 동작환경
* node.js v0.10.22
* ejs@0.8.3
* express@3.4.4
* socket.io@0.9.16

### 참고사이트
* [Ace Editor](http://ace.c9.io/#nav=about)
* [Node.js](http://www.nodejs.org/api/)
* [socket.io](http://socket.io/)
