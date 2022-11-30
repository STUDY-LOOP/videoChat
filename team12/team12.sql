-- DB 정보
-- host: 'localhost',
-- port: 3306,
-- user: 'root',
-- password: "rootpw", //'rootpw', //jinseo00
-- database: "team12"

CREATE DATABASE `team12`; -- !40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_bin */ /*!80016 DEFAULT ENCRYPTION='N';
USE `team12`;

CREATE TABLE `user` (
  `u_id` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY(u_id)
) charset=utf8mb4;

CREATE TABLE `chat` (
  `msg_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `u_id` varchar(20) NOT NULL,
  `notice` tinyint NOT NULL,
  `content` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`msg_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


INSERT INTO `user`(u_id, password) VALUES ('team12', 'team12');
INSERT INTO `user`(u_id, password) VALUES ('jinseo', 'jinseopw');
INSERT INTO `user`(u_id, password) VALUES ('jisu', 'jisupw');
INSERT INTO `user`(u_id, password) VALUES ('jane', 'janepw');