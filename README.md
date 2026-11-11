Web Notepad
-----------

### 소개
* Web에서 소스 코드를 편집할 수 있는 note pad 입니다.
* 같은 문서를 다른 사용자가 열고 있을 경우 실시간으로 편집 내용이 갱신 됩니다.
* Ace Editor가 지원하는 [100여개 언어](public/javascripts/support_extension.js)의 syntax highlighting을 지원 합니다.
* `sz`로 글자 크기를, `pwd`로 문서 비밀번호를 지정할 수 있습니다.
* note.js를 스터디 하고자 하는 목적으로 시작했습니다.

### 사용법
1. http://note.newtype.pe.kr/DOCUMENT-NAME.FORMAT-EXTENSION 으로 접속 합니다.
   ( 예, http://note.newtype.pe.kr/test1.js )
2. DOCUMENT-NAME에 해당하는 문서가 열리거나 생성됩니다.
3. FORMAT-EXTENSION로 문서가 syntax highlighting 됩니다.
4. 같은 문서를 다른 사용자가 열고 있을 경우 실시간으로 편집 내용이 갱신 됩니다.
> 예를 들어 http://note.newtype.pe.kr/test1.js, http://note.newtype.pe.kr/test1.cpp 두개의 링크는 문서 내용은 같고, syntax highlighting만 다르게 됩니다.
> http://note.newtype.pe.kr/test1.js 내용을 수정하면, http://note.newtype.pe.kr/test1.cpp 의 내용도 실시간으로 수정됩니다.

### 쿼리 옵션
* `sz`: 편집기 글자 크기입니다. 기본값은 16이고, 8 이상 72 이하로 맞춥니다.
* `pwd`: 문서 비밀번호입니다.
  * `data/문서이름.pwd`가 없거나 0바이트이면 아직 비밀번호가 없는 상태입니다. 이때 `pwd`를 주면 그 값이 비밀번호로 저장됩니다. 이미 내용이 있는 문서도 같습니다.
  * 비밀번호가 저장된 뒤에는 같은 `pwd`로만 열립니다. 값이 다르거나 빠지면 페이지가 열리지 않고, 본문도 전달되지 않습니다.
  * 비밀번호를 주지 않은 문서는 그대로 열리며, `.pwd` 파일은 만들어지지 않습니다.
  * 같은 DOCUMENT-NAME은 확장자가 달라도 비밀번호를 공유합니다.
  * 예: http://note.newtype.pe.kr/test1.js?pwd=secret&sz=20

비밀번호는 `data/문서이름.pwd`에 해시로 저장되며, 파일에는 비밀번호 원문이 남지 않습니다. 문서 내용은 `data/문서이름.dat`, 커서 위치는 `data/문서이름.pos`에 저장됩니다.

### 실행
```
npm install
npm start
```
기본 포트는 8080 입니다. `PORT`로 바꿀 수 있습니다.

### 환경 변수
* `PORT`: 수신 포트. 기본값은 8080 입니다.
* `GA_MEASUREMENT_ID`: GA4 측정 ID (`G-`로 시작). 없거나 형식이 다르면 추적 코드를 넣지 않습니다.

### 동작환경
* Node.js
* ace-builds 1.45.2
* ejs 3.1.10
* express 4.22.3
* socket.io 4.8.3

### 참고사이트
* [Ace Editor](https://ace.c9.io/)
* [Node.js](https://nodejs.org/api/)
* [socket.io](https://socket.io/)
