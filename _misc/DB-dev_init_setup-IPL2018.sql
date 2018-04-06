-- --------------------------------------------------------
-- Host:                         hamrocloud.com
-- Server version:               5.6.26-cll-lve - MySQL Community Server (GPL)
-- Server OS:                    Linux
-- HeidiSQL Version:             9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for hamroclo_nwa_ipl
CREATE DATABASE IF NOT EXISTS `hamroclo_nwa_ipldev` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `hamroclo_nwa_ipldev`;

-- Dumping structure for procedure hamroclo_nwa_ipl.lock_tables
DELIMITER //
CREATE DEFINER=`hamroclo`@`69.193.159.2` PROCEDURE `lock_tables`(
	IN `Threshold` INT

)
    COMMENT 'Stored procedure that locks all matches prior to the next ''''Threshold'''' minutes'
BEGIN
	-- lock all prior matches, including the one within the next 15 minutes
	UPDATE `match`
		SET isLocked = 1
		WHERE 
			MatchDate <= DATE_ADD(NOW(),INTERVAL 15 MINUTE);
END//
DELIMITER ;

-- Dumping structure for table hamroclo_nwa_ipl.match
CREATE TABLE IF NOT EXISTS `match` (
  `matchID` int(11) NOT NULL AUTO_INCREMENT,
  `isActive` smallint(5) DEFAULT '0' COMMENT 'For deciding the next upcoming matches',
  `MatchDate` datetime DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `Team1ID` int(11) NOT NULL,
  `Team2ID` int(11) unsigned zerofill NOT NULL,
  `matchPoints` int(11) DEFAULT '3' COMMENT 'Saves the point for each match',
  `isHidden` int(11) DEFAULT '0' COMMENT 'For deciding if predictions need to be hidden',
  `isLocked` int(1) DEFAULT NULL COMMENT 'For deciding if user is allowed to vote or not',
  `WinningTeamID` int(11) DEFAULT NULL COMMENT 'Can be null for matches that have not been decided yet',
  `Venue` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`matchID`)
) ENGINE=MyISAM AUTO_INCREMENT=58 DEFAULT CHARSET=latin1;

-- Dumping data for table hamroclo_nwa_ipl.match: 57 rows
/*!40000 ALTER TABLE `match` DISABLE KEYS */;
INSERT INTO `match` (`matchID`, `isActive`, `MatchDate`, `Time`, `Team1ID`, `Team2ID`, `matchPoints`, `isHidden`, `isLocked`, `WinningTeamID`, `Venue`, `createdAt`, `updatedAt`) VALUES
	(1, 1, '2018-04-07 14:30:00', '20:00:00', 4, 00000000001, 3, 0, 0, NULL, 'Mumbai', NULL, NULL),
	(2, 0, '2018-04-08 00:00:00', '16:00:00', 3, 00000000007, 3, 0, 0, NULL, 'Delhi', NULL, NULL),
	(3, 0, '2018-04-08 00:00:00', '20:00:00', 5, 00000000002, 3, 0, 0, NULL, 'Kolkata', NULL, NULL),
	(4, 0, '2018-04-09 00:00:00', '20:00:00', 8, 00000000006, 3, 0, 0, NULL, 'Hyderabad', NULL, NULL),
	(5, 0, '2018-04-10 00:00:00', '20:00:00', 1, 00000000005, 3, 0, 0, NULL, 'Chennai', NULL, NULL),
	(6, 0, '2018-04-11 00:00:00', '20:00:00', 6, 00000000003, 3, 0, 0, NULL, 'Jaipur', NULL, NULL),
	(7, 0, '2018-04-12 00:00:00', '20:00:00', 8, 00000000004, 3, 0, 0, NULL, 'Hyderabad', NULL, NULL),
	(8, 0, '2018-04-13 00:00:00', '20:00:00', 2, 00000000007, 3, 0, 0, NULL, 'Bengaluru', NULL, NULL),
	(9, 0, '2018-04-14 00:00:00', '16:00:00', 4, 00000000003, 3, 0, 0, NULL, 'Mumbai', NULL, NULL),
	(10, 0, '2018-04-14 00:00:00', '20:00:00', 5, 00000000008, 3, 0, 0, NULL, 'Kolkata', NULL, NULL),
	(11, 0, '2018-04-15 00:00:00', '20:00:00', 7, 00000000001, 3, 0, 0, NULL, 'Indore', NULL, NULL),
	(12, 0, '2018-04-16 00:00:00', '20:00:00', 5, 00000000003, 3, 0, 0, NULL, 'Kolkata', NULL, NULL),
	(13, 0, '2018-04-17 00:00:00', '20:00:00', 4, 00000000002, 3, 0, 0, NULL, 'Mumbai', NULL, NULL),
	(14, 0, '2018-04-18 00:00:00', '20:00:00', 6, 00000000005, 3, 0, 0, NULL, 'Jaipur', NULL, NULL),
	(15, 0, '2018-04-19 00:00:00', '20:00:00', 7, 00000000008, 3, 0, 0, NULL, 'Indore', NULL, NULL),
	(16, 0, '2018-04-20 00:00:00', '20:00:00', 1, 00000000006, 3, 0, 0, NULL, 'Chennai', NULL, NULL),
	(17, 0, '2018-04-21 00:00:00', '16:00:00', 5, 00000000007, 3, 0, 0, NULL, 'Kolkata', NULL, NULL),
	(18, 0, '2018-04-21 00:00:00', '20:00:00', 3, 00000000002, 3, 0, 0, NULL, 'Delhi', NULL, NULL),
	(19, 0, '2018-04-22 00:00:00', '16:00:00', 8, 00000000001, 3, 0, 0, NULL, 'Hyderabad', NULL, NULL),
	(20, 0, '2018-04-22 00:00:00', '20:00:00', 6, 00000000004, 3, 0, 0, NULL, 'Jaipur', NULL, NULL),
	(21, 0, '2018-04-23 00:00:00', '20:00:00', 7, 00000000003, 3, 0, 0, NULL, 'Indore', NULL, NULL),
	(22, 0, '2018-04-24 00:00:00', '20:00:00', 4, 00000000008, 3, 0, 0, NULL, 'Mumbai', NULL, NULL),
	(23, 0, '2018-04-25 00:00:00', '20:00:00', 2, 00000000001, 3, 0, 0, NULL, 'Bengaluru', NULL, NULL),
	(24, 0, '2018-04-26 00:00:00', '20:00:00', 8, 00000000007, 3, 0, 0, NULL, 'Hyderabad', NULL, NULL),
	(25, 0, '2018-04-27 00:00:00', '20:00:00', 3, 00000000005, 3, 0, 0, NULL, 'Delhi', NULL, NULL),
	(26, 0, '2018-04-28 00:00:00', '20:00:00', 1, 00000000004, 3, 0, 0, NULL, 'Chennai', NULL, NULL),
	(27, 0, '2018-04-29 00:00:00', '16:00:00', 6, 00000000008, 3, 0, 0, NULL, 'Jaipur', NULL, NULL),
	(28, 0, '2018-04-29 00:00:00', '20:00:00', 2, 00000000005, 3, 0, 0, NULL, 'Bengaluru', NULL, NULL),
	(29, 0, '2018-04-30 00:00:00', '20:00:00', 1, 00000000003, 3, 0, 0, NULL, 'Chennai', NULL, NULL),
	(30, 0, '2018-05-01 00:00:00', '20:00:00', 2, 00000000004, 3, 0, 0, NULL, 'Bengaluru', NULL, NULL),
	(31, 0, '2018-05-02 00:00:00', '20:00:00', 3, 00000000006, 3, 0, 0, NULL, 'Delhi', NULL, NULL),
	(32, 0, '2018-05-03 00:00:00', '20:00:00', 5, 00000000001, 3, 0, 0, NULL, 'Kolkata', NULL, NULL),
	(33, 0, '2018-05-04 00:00:00', '20:00:00', 7, 00000000004, 3, 0, 0, NULL, 'Mohali', NULL, NULL),
	(34, 0, '2018-05-05 00:00:00', '16:00:00', 1, 00000000002, 3, 0, 0, NULL, 'Chennai', NULL, NULL),
	(35, 0, '2018-05-05 00:00:00', '20:00:00', 8, 00000000003, 3, 0, 0, NULL, 'Hyderabad', NULL, NULL),
	(36, 0, '2018-05-06 00:00:00', '16:00:00', 4, 00000000005, 3, 0, 0, NULL, 'Mumbai', NULL, NULL),
	(37, 0, '2018-05-06 00:00:00', '20:00:00', 7, 00000000006, 3, 0, 0, NULL, 'Mohali', NULL, NULL),
	(38, 0, '2018-05-07 00:00:00', '20:00:00', 8, 00000000002, 3, 0, 0, NULL, 'Hyderabad', NULL, NULL),
	(39, 0, '2018-05-08 00:00:00', '20:00:00', 6, 00000000007, 3, 0, 0, NULL, 'Jaipur', NULL, NULL),
	(40, 0, '2018-05-09 00:00:00', '20:00:00', 5, 00000000004, 3, 0, 0, NULL, 'Kolkata', NULL, NULL),
	(41, 0, '2018-05-10 00:00:00', '20:00:00', 3, 00000000008, 3, 0, 0, NULL, 'Delhi', NULL, NULL),
	(42, 0, '2018-05-11 00:00:00', '20:00:00', 6, 00000000001, 3, 0, 0, NULL, 'Jaipur', NULL, NULL),
	(43, 0, '2018-05-12 00:00:00', '16:00:00', 7, 00000000005, 3, 0, 0, NULL, 'Mohali', NULL, NULL),
	(44, 0, '2018-05-12 00:00:00', '20:00:00', 2, 00000000003, 3, 0, 0, NULL, 'Bengaluru', NULL, NULL),
	(45, 0, '2018-05-13 00:00:00', '20:00:00', 4, 00000000006, 3, 0, 0, NULL, 'Mumbai', NULL, NULL),
	(46, 0, '2018-05-14 00:00:00', '20:00:00', 7, 00000000002, 3, 0, 0, NULL, 'Mohali', NULL, NULL),
	(47, 0, '2018-05-15 00:00:00', '20:00:00', 5, 00000000006, 3, 0, 0, NULL, 'Kolkata', NULL, NULL),
	(48, 0, '2018-05-16 00:00:00', '20:00:00', 4, 00000000007, 3, 0, 0, NULL, 'Mumbai', NULL, NULL),
	(49, 0, '2018-05-17 00:00:00', '20:00:00', 2, 00000000008, 3, 0, 0, NULL, 'Bengaluru', NULL, NULL),
	(50, 0, '2018-05-18 00:00:00', '20:00:00', 3, 00000000001, 3, 0, 0, NULL, 'Delhi', NULL, NULL),
	(51, 0, '2018-05-19 00:00:00', '16:00:00', 6, 00000000002, 3, 0, 0, NULL, 'Jaipur', NULL, NULL),
	(52, 0, '2018-05-20 00:00:00', '16:00:00', 3, 00000000004, 3, 0, 0, NULL, 'Delhi', NULL, NULL),
	(53, 0, '2018-05-20 00:00:00', '20:00:00', 1, 00000000007, 3, 0, 0, NULL, 'Chennai', NULL, NULL),
	(54, 0, '2018-05-22 00:00:00', '20:00:00', 90, 00000000090, 3, 0, 0, NULL, 'Mumbai', NULL, NULL),
	(55, 0, '2018-05-23 00:00:00', '20:00:00', 90, 00000000090, 3, 0, 0, NULL, '??', NULL, NULL),
	(56, 0, '2018-05-23 00:00:00', '20:00:00', 90, 00000000090, 3, 0, 0, NULL, '??', NULL, NULL),
	(57, 0, '2018-05-23 00:00:00', '20:00:00', 90, 00000000090, 3, 0, 0, NULL, 'Mumbai', NULL, NULL);
/*!40000 ALTER TABLE `match` ENABLE KEYS */;

-- Dumping structure for table hamroclo_nwa_ipl.prediction
CREATE TABLE IF NOT EXISTS `prediction` (
  `playerID` int(11) NOT NULL,
  `matchID` int(11) NOT NULL,
  `predictedTeamID` int(11) DEFAULT NULL,
  `predictionDate` date DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`playerID`,`matchID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Dumping data for table hamroclo_nwa_ipl.prediction: 13 rows
/*!40000 ALTER TABLE `prediction` DISABLE KEYS */;
INSERT INTO `prediction` (`playerID`, `matchID`, `predictedTeamID`, `predictionDate`, `createdAt`, `updatedAt`) VALUES
	(67, 1, 4, NULL, '2018-04-04 18:41:11', '2018-04-04 18:41:11'),
	(68, 1, 1, NULL, '2018-04-04 18:52:39', '2018-04-04 18:52:39'),
	(71, 1, 4, NULL, '2018-04-04 19:34:56', '2018-04-04 19:34:56'),
	(70, 1, 1, NULL, '2018-04-04 19:37:37', '2018-04-04 19:37:37'),
	(69, 1, 4, NULL, '2018-04-04 21:10:34', '2018-04-04 21:10:34'),
	(66, 1, 4, NULL, '2018-04-04 21:19:15', '2018-04-04 21:19:15'),
	(72, 1, 4, NULL, '2018-04-05 13:06:37', '2018-04-05 13:06:37'),
	(74, 1, 4, NULL, '2018-04-05 16:14:14', '2018-04-05 16:14:14'),
	(75, 1, 1, NULL, '2018-04-05 17:39:31', '2018-04-05 17:39:31'),
	(76, 1, 1, NULL, '2018-04-05 20:42:13', '2018-04-05 20:42:13'),
	(77, 1, 1, NULL, '2018-04-05 20:43:07', '2018-04-05 20:43:07'),
	(78, 1, 1, NULL, '2018-04-06 05:04:35', '2018-04-06 05:04:35'),
	(73, 1, 4, NULL, '2018-04-06 15:10:36', '2018-04-06 15:10:36');
/*!40000 ALTER TABLE `prediction` ENABLE KEYS */;

-- Dumping structure for procedure hamroclo_nwa_ipl.sp_activate_next_match
DELIMITER //
CREATE DEFINER=`hamroclo`@`69.193.159.2` PROCEDURE `sp_activate_next_match`()
    COMMENT 'Marks the status of matches that are coming up in the next day as active (to be run after running match updates for today''s match)'
BEGIN

-- caveat: this checks by adding a day to current day, so if matches are after a few days. this won't work 
UPDATE `match` 
SET isActive = 1
WHERE 
	MatchDate > DATE_SUB(NOW(),INTERVAL 1 DAY) AND 
	MatchDate <= DATE_ADD(NOW(),INTERVAL 1 DAY) AND 
	WinningTeamID IS NULL;
	
END//
DELIMITER ;

-- Dumping structure for table hamroclo_nwa_ipl.teams
CREATE TABLE IF NOT EXISTS `teams` (
  `teamID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `groupID` int(11) DEFAULT NULL,
  `logoURL` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`teamID`)
) ENGINE=MyISAM AUTO_INCREMENT=109 DEFAULT CHARSET=latin1;

-- Dumping data for table hamroclo_nwa_ipl.teams: 8 rows
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` (`teamID`, `Name`, `groupID`, `logoURL`, `createdAt`, `updatedAt`) VALUES
	(1, 'Chennai Super Kings', NULL, 'https://isportsexpress.com/wp-content/uploads/2018/01/chennai-super-kings-csk-1160x665.jpg', NULL, NULL),
	(2, 'Royal Challengers Bangalore', NULL, 'https://pbs.twimg.com/profile_images/719213358482866177/oMAXdqQ7_400x400.jpg', NULL, NULL),
	(3, 'Delhi Daredevils', NULL, 'http://www.delhidaredevils.com/static-assets/waf-images/2e/cc/6a/4-3/796-597/xRdeueju3E.jpg', NULL, NULL),
	(4, 'Mumbai Indians', NULL, 'http://images.indianexpress.com/2018/01/mumbai-indians-759.png', NULL, NULL),
	(5, 'Kolkata Knight Riders', NULL, 'https://s3.amazonaws.com/user-media.venngage.com/487132-5c382b5b996b508ebf9d7d9880681db0.jpg', NULL, NULL),
	(6, 'Rajasthan Royals', NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWV6VLLLzcqBijj0yfLuVGCAWzCcVt3u4KfNl2-909_N2ybLzCWw', NULL, NULL),
	(7, 'Kings XI Punjab', NULL, 'https://i1.wp.com/gusture.com/files/2014/05/punjab-kxip-logo-ipl.jpg?ssl=1', NULL, NULL),
	(8, 'Sunrisers Hyderabad', NULL, 'https://www.sportzkidda.com/wp-content/uploads/2018/01/Sunrisers_Hyderabad.svg-640-x-480.jpg', NULL, NULL);
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;

-- Dumping structure for procedure hamroclo_nwa_ipl.update_scores
DELIMITER //
CREATE DEFINER=`hamroclo`@`69.193.159.2` PROCEDURE `update_scores`(
	IN `match_id` INT,
	IN `winning_team_id` INT

)
    COMMENT 'SP to update scores based on user input (Match ID,Winning Team ID)'
BEGIN
	SET @matchID := match_id;
	SET @winningTeamID := winning_team_id;

UPDATE users
SET POINTS = POINTS + (SELECT matchPoints p FROM `match` WHERE isActive = 1 LIMIT 1)
WHERE userID IN (SELECT 
	p.playerID
FROM 
	prediction p
WHERE
	p.matchID = @matchID AND
	p.predictedTeamID = @winningTeamID);


UPDATE `match`
	SET WinningTeamID = @winningTeamID,
	isActive = 0
	WHERE matchID = @matchID;

END//
DELIMITER ;

-- Dumping structure for table hamroclo_nwa_ipl.users
CREATE TABLE IF NOT EXISTS `users` (
  `userID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `points` int(11) NOT NULL DEFAULT '0',
  `password` varchar(255) NOT NULL,
  `isr00t` tinyint(4) DEFAULT '0',
  `avatar_image` varchar(255) NOT NULL,
  `auth_key` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=MyISAM AUTO_INCREMENT=69 DEFAULT CHARSET=latin1;

-- Dumping data for table hamroclo_nwa_ipl.users: 13 rows
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`userID`, `name`, `email`, `points`, `password`, `isr00t`, `avatar_image`, `auth_key`, `createdAt`, `updatedAt`) VALUES
	(66, 'Jeor Mormont', 'predictsoft1@gmail.com', 0, 'd8578edf8458ce06fbc5bb76a58c5ca4', 0, '', 'ac35da2bfdbc2b81a660120deeb6a8be', '2018-04-04 18:17:53', '2018-04-04 18:17:53'),
	(67, 'Tormund Giantsbane', 'predictsoft1@gmail.com', 0, 'f3a55d341007ee14c16e249087c43249', 0, '', '6f6f9ee99074e2557a07837f98baf6e6', '2018-04-04 18:32:42', '2018-04-04 18:32:42'),
	(68, 'Shae', 'predictsoft1@gmail.com', 0, '7e137db5905dbfef9e391d64079d88e5', 0, '', 'd21ac446fb22dbf16e086399257d93e3', '2018-04-04 18:49:29', '2018-04-04 18:49:29'),
	(69, 'Robb Stark', 'predictsoft1@gmail.com', 0, '564c1b49b3732b23e67c4f7478920fc6', 0, '', '236e50fd01ab37fc7feca48691575bbb', '2018-04-04 19:22:53', '2018-04-04 19:22:53'),
	(70, 'Bran Stark', 'predictsoft1@gmail.com', 0, 'c2179ec9b6354f94cf866ede56081929', 0, '', 'a1ca9bee61f53bb5fe92b16b37b4f289', '2018-04-04 19:26:45', '2018-04-04 19:26:45'),
	(71, 'Sandor Clegane', 'predictsoft1@gmail.com', 0, 'cff88d167092ac4bf6f8a36e262d406e', 0, '', '622ecea27da19a5bd609134a73a65446', '2018-04-04 19:34:12', '2018-04-04 19:34:12'),
	(72, 'Petyr Baelish', '.predictsoft1@gmail.com', 0, 'de15762d1961f8eb0fe7a4078ffd8b08', 0, '', '6726377eebc292bbcbedced0930fdcf5', '2018-04-05 11:51:47', '2018-04-05 11:51:47'),
	(73, 'Joffrey Baratheon', 'predictsoft1@gmail.com', 0, 'b8b280cdd1803acf80d251955c08df0b', 0, '', 'aeb176c13e012e6bb0eff89008277241', '2018-04-05 13:21:17', '2018-04-05 13:21:17'),
	(74, 'Sansa Stark', 'predictsoft1@gmail.com', 0, '23cee63246ce3c28d90598a06c5f4be3', 0, '', '75d55f7487949f05f6b948d313ccfa93', '2018-04-05 16:13:36', '2018-04-05 16:13:36'),
	(75, 'Arya Stark', 'predictsoft1@gmail.com', 0, 'e2bcfe522bb531de3e010e400a7f379c', 0, '', '957290c0118c3ef18207d20d3ee4cdce', '2018-04-05 17:38:37', '2018-04-05 17:38:37'),
	(76, 'Gregor Clegane', 'predictsoft1@gmail.com', 0, '62314f73d1b0ef3fe2083d95a9e90696', 0, '', '31e5c8a04f35797c195946bfd3e58978', '2018-04-05 20:41:39', '2018-04-05 20:41:39'),
	(77, 'Jon Snow', 'predictsoft1@gmail.com', 0, '6c8a9f121ea4ac6ba3a686856c7aac43', 0, '', '66747508ac3923479c9229187d90c4a3', '2018-04-05 20:42:12', '2018-04-05 20:42:12'),
	(78, 'Tyrion Lannister', 'predictsoft1@gmail.com', 0, '58598b484c9947a4255795139bd61cfe', 0, '', 'efa54763aa3cf3ea90f375cbddf69850', '2018-04-06 05:04:04', '2018-04-06 05:04:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
UPDATE users SET password='cc03e747a6afbbcbf8be7668acfebee5';		/* password is test123 by default for all users */