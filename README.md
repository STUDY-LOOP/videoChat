# 화상 스터디 플랫폼 test

## 목차
1. [프로젝트 소개](#프로젝트-소개) <br>
1. [실행 환경](#실행-환경)<br>
1. [실행 방법 (local)](#실행-방법-local)<br>
1. [실행 방법 (외부 접속)](#실행-방법-외부-접속)<br>
1. [파일 구조](#파일-구조)
1. [참고](#참고)


<br>

---

## 프로젝트 소개

2022-1 캡스톤디자인과창업프로젝트A를 수강하며 진행한 토이프로젝트입니다.

화상회의, 채팅, 로그인 기능이 구현되어 사용 가능하고 <br>
스터디 홈, 회차별 세부 페이지, 과제함, 스터디원 정보, 아카이브에 대한 프로토타입이 포함되어 있습니다. 

<br>

---

<br>

## 실행 환경
NodeJS 및 MySQL에 대한 사전 설치가 필요합니다.
Chrome을 통해 접속할 것을 권장합니다.

<br>

---

## 실행 방법 (local)

깃허브 리포지토리를 다운받고 압축을 해제합니다. 

<br>

MySQL에 접속해 데이터베이스를 생성합니다.
* 본인의 MySQL 계정 정보를 videoChat/server.js 파일의 25번째 줄의 `const connectDB = mysql.createConnection({ ... })`에 업데이트 해야 합니다.
```sql
mysql -u root -p
> password: rootpw

CREATE DATABASE `team12`;
USE `team12`;
```

videoChat/team12/team12.sql 파일을 실행합니다. (파일 경로를 확인해주세요)
```cmd
source C:\videoChat\team12\team12.sql

> Query OK, 0 rows affected (0.06 sec)
...

exit
```

다운받은 videoChat 폴더로 이동합니다.
```cmd
cd C:\videoChat
```

필요한 Dependency를 설치합니다.
```cmd
npm install
```

서버를 실행합니다.
```cmd
node server.js
```

아래 주소에 접속합니다. 
```cmd
localhost:3000
```

<br>

---

## 실행 방법 (외부 접속)

local 실행 방법에서 Dependency 설치까지 진행합니다.

videoChat\server.js 의 마지막 줄 코드의 포트번호를 3000에서 443으로 수정합니다.
```js
server.listen(process.env.PORT || 443, handleListen);
```

videoChat\public\videoChatScript.js에서 11번째 줄의 포트번호를 3000에서 443으로 수정합니다.
```js
const myPeer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443"
});
```

서버를 실행합니다. <br>
(이미 실행중인 서버가 있다면 우선 Ctrl+C로 종료 후 재실행합니다)
```cmd
node server.js
```

새로운 터미널을 열어 localtunnel을 실행합니다.
```cmd
lt --port 443
```

localtunnel 실행 결과로 출력된 주소에 접속합니다. 

<br>

---

## 파일 구조 
<br>

|   |**back-end**|**front-end script**|**views**      |**비고**|
|:-:|------------|--------------------|---------------|--------|
|FOLDER|/        |/public             |/views         |        |
|01 |server.js   |                    |main.ejs       |        |
|02 |server.js   |                    |signup.ejs     |        |
|03 |server.js   |                    |studyList.ejs  |        |
|04 |server.js   |studyHomeChatScript.js|studyHome.ejs|        |
|05 |server.js   |videoChatScript.js|videoChat.ejs    |        |
|06 |server.js   |                    |studyArchive.ejs     |프로토타입|
|07 |server.js   |                    |studyAssignment.ejs  |프로토타입|
|08 |server.js   |                    |studyDetail.ejs      |프로토타입|
|09 |server.js   |                    |studyMember.ejs      |프로토타입|


<br>

---

## 참고

- 각 프로토타입은 studyHome 페이지에서 접속 가능합니다.

![readme_studyhome](https://user-images.githubusercontent.com/71037606/206397176-a9c7e415-03df-4110-a879-fba5d2d75d43.jpg)