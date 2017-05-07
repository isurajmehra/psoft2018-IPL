-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               5.5.54-0ubuntu0.14.04.1 - (Ubuntu)
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for psoft2017_PRODUCTION
CREATE DATABASE IF NOT EXISTS `psoftIPL_PRODUCTION` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `psoftIPL_PRODUCTION`;

-- Dumping structure for procedure psoft2017_PRODUCTION.lock_tables
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `lock_tables`(
	IN `Threshold` INT
)
    COMMENT 'Stored procedure that locks all matches prior to the next ''''Threshold'''' minutes'
BEGIN
	-- lock all prior matches, including the one within the next 15 minutes
	UPDATE `match`
		SET isLocked = 1
		WHERE 
			MatchDate <= DATE_ADD(NOW(),INTERVAL Threshold MINUTE);
END//
DELIMITER ;

-- Dumping structure for table psoft2017_PRODUCTION.match
CREATE TABLE IF NOT EXISTS `match` (
  `matchID` int(11) NOT NULL AUTO_INCREMENT,
  `isActive` smallint(5) DEFAULT '0' COMMENT 'For deciding the next upcoming matches',
  `matchPoints` int(11) DEFAULT '3' COMMENT 'Saves the point for each match',
  `isHidden` int(11) DEFAULT '0' COMMENT 'For deciding if predictions need to be hidden',
  `isLocked` int(1) DEFAULT NULL COMMENT 'For deciding if user is allowed to vote or not',
  `Team1ID` int(11) NOT NULL,
  `Team2ID` int(11) NOT NULL,
  `MatchDate` datetime DEFAULT NULL,
  `WinningTeamID` int(11) DEFAULT NULL COMMENT 'Can be null for matches that have not been decided yet',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`matchID`)
) ENGINE=MyISAM AUTO_INCREMENT=61 DEFAULT CHARSET=latin1;

-- Dumping data for table psoft2017_PRODUCTION.match: 60 rows
/*!40000 ALTER TABLE `match` DISABLE KEYS */;
INSERT INTO `match` (`matchID`, `isActive`, `matchPoints`, `isHidden`, `isLocked`, `Team1ID`, `Team2ID`, `MatchDate`, `WinningTeamID`, `createdAt`, `updatedAt`) VALUES
  (1, 1, 3, 0, 0, 8, 7, '2017-04-05 14:30:00', 8, NULL, NULL),
  (2, 0, 3, 0, 0 6, 5, '2017-04-06 14:30:00', 6, NULL, NULL),
  (3, 0, 3, 0, 0, 2, 4, '2017-04-07 14:30:00', 4, NULL, NULL),
  (4, 0, 3, 0, 0, 3, 6, '2017-04-08 10:30:00', 3, NULL, NULL),
  (5, 0, 3, 0, 0, 7, 1, '2017-04-08 14:30:00', 7, NULL, NULL),
  (6, 0, 3, 0, 0, 8, 2, '2017-04-09 10:30:00', 8, NULL, NULL),
  (7, 0, 3, 0, 0, 5, 4, '2017-04-09 14:30:00', 5, NULL, NULL),
  (8, 0, 3, 0, 0, 3, 7, '2017-04-10 14:30:00', 3, NULL, NULL),
  (9, 0, 3, 0, 0, 6, 1, '2017-04-11 14:30:00', 1, NULL, NULL),
  (10, 0, 3, 0, 0, 5, 8, '2017-04-12 14:30:00', 5, NULL, NULL),
  (11, 0, 3, 0, 0, 4, 3, '2017-04-13 14:30:00', 4, NULL, NULL),
  (12, 0, 3, 0, 0, 7, 5, '2017-04-14 10:30:00', 5, NULL, NULL),
  (13, 0, 3, 0, 0, 2, 6, '2017-04-14 14:30:00', 2, NULL, NULL),
  (14, 0, 3, 0, 0, 4, 8, '2017-04-15 10:30:00', 4, NULL, NULL),
  (15, 0, 3, 0, 0, 1, 3, '2017-04-15 14:30:00', 1, NULL, NULL),
  (16, 0, 3, 0, 0, 5, 2, '2017-04-16 10:30:00', 5, NULL, NULL),
  (17, 0, 3, 0, 0, 7, 6, '2017-04-16 14:30:00', 6, NULL, NULL),
  (18, 0, 3, 0, 0, 1, 4, '2017-04-17 10:30:00', 4, NULL, NULL),
  (19, 0, 3, 0, 0, 8, 3, '2017-04-17 14:30:00', 8, NULL, NULL),
  (20, 0, 3, 0, 0, 2, 7, '2017-04-18 14:30:00', 7, NULL, NULL),
  (21, 0, 3, 0, 0, 8, 1, '2017-04-19 14:30:00', 8, NULL, NULL),
  (22, 0, 3, 0, 0, 3, 5, '2017-04-20 14:30:00', 5, NULL, NULL),
  (23, 0, 3, 0, 0, 4, 2, '2017-04-21 14:30:00', 2, NULL, NULL),
  (24, 0, 3, 0, 0, 6, 8, '2017-04-22 10:30:00', 6, NULL, NULL),
  (25, 0, 3, 0, 0, 1, 5, '2017-04-22 14:30:00', 5, NULL, NULL),
  (26, 0, 3, 0, 0, 2, 3, '2017-04-23 10:30:00', 3, NULL, NULL),
  (27, 0, 3, 0, 0, 4, 7, '2017-04-23 14:30:00', 4, NULL, NULL),
  (28, 0, 3, 0, 0, 5, 6, '2017-04-24 14:30:00', 6, NULL, NULL),
  (29, 0, 3, 0, 0, 7, 8, '2017-04-25 14:30:00', 100, NULL, NULL),
  (30, 0, 3, 0, 0, 6, 4, '2017-04-26 14:30:00', 4, NULL, NULL),
  (31, 0, 3, 0, 0, 7, 2, '2017-04-27 14:30:00', 2, NULL, NULL),
  (32, 0, 3, 0, 0, 4, 1, '2017-04-28 10:30:00', 4, NULL, NULL),
  (33, 0, 3, 0, 0, 3, 8, '2017-04-28 14:30:00', 8, NULL, NULL),
  (34, 0, 3, 0, 0, 6, 7, '2017-04-29 10:30:00', 6, NULL, NULL),
  (35, 0, 3, 0, 0, 2, 5, '2017-04-29 14:30:00', 5, NULL, NULL),
  (36, 0, 3, 0, 0, 3, 1, '2017-04-30 10:30:00', 3, NULL, NULL),
  (37, 0, 3, 0, 0, 8, 4, '2017-04-30 14:30:00', 8, NULL, NULL),
  (38, 0, 3, 0, 0, 5, 7, '2017-05-01 10:30:00', 5, NULL, NULL),
  (39, 0, 3, 0, 0, 6, 2, '2017-05-01 14:30:00', 6, NULL, NULL),
  (40, 0, 3, 0, 0, 1, 8, '2017-05-02 14:30:00', 1, NULL, NULL),
  (41, 0, 3, 0, 0, 4, 6, '2017-05-03 14:30:00', 6, NULL, NULL),
  (42, 0, 3, 0, 0, 1, 2, '2017-05-04 14:30:00', 1, NULL, NULL),
  (43, 0, 3, 0, 0, 7, 3, '2017-05-05 14:30:00', 3, NULL, NULL),
  (44, 0, 3, 0, 0, 8, 6, '2017-05-06 10:30:00', 6, NULL, NULL),
  (45, 0, 3, 0, 0, 5, 1, '2017-05-06 14:30:00', 5, NULL, NULL),
  (46, 0, 3, 0, 0, 7, 4, '2017-05-07 10:30:00', NULL, NULL, NULL),
  (47, 0, 3, 0, 0, 3, 2, '2017-05-07 14:30:00', NULL, NULL, NULL),
  (48, 0, 3, 0, 0, 8, 5, '2017-05-08 14:30:00', NULL, NULL, NULL),
  (49, 0, 3, 0, 0, 3, 4, '2017-05-09 14:30:00', NULL, NULL, NULL),
  (50, 0, 3, 0, 0, 2, 1, '2017-05-10 14:30:00', NULL, NULL, NULL),
  (51, 0, 3, 0, 0, 5, 3, '2017-05-11 14:30:00', NULL, NULL, NULL),
  (52, 0, 3, 0, 0, 1, 6, '2017-05-12 14:30:00', NULL, NULL, NULL),
  (53, 0, 3, 0, 0, 2, 8, '2017-05-13 10:30:00', NULL, NULL, NULL),
  (54, 0, 3, 0, 0, 4, 5, '2017-05-13 14:30:00', NULL, NULL, NULL),
  (55, 0, 3, 0, 0, 6, 3, '2017-05-14 10:30:00', NULL, NULL, NULL),
  (56, 0, 3, 0, 0, 1, 7, '2017-05-14 14:30:00', NULL, NULL, NULL),
  (57, 0, 6, 1, 0, 9, 9, '2017-05-16 14:30:00', NULL, NULL, NULL),
  (58, 0, 6, 1, 0, 9, 9, '2017-05-17 14:30:00', NULL, NULL, NULL),
  (59, 0, 6, 1, 0, 9, 9, '2017-05-19 14:30:00', NULL, NULL, NULL),
  (60, 0, 12, 1, 0, 9, 9, '2017-05-21 14:30:00', NULL, NULL, NULL);



-- Data exporting was unselected.
-- Dumping structure for table psoft2017_PRODUCTION.prediction
CREATE TABLE IF NOT EXISTS `prediction` (
  `playerID` int(11) NOT NULL,
  `matchID` int(11) NOT NULL,
  `predictedTeamID` int(11) DEFAULT NULL,
  `predictionDate` date DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`playerID`,`matchID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for procedure psoft2017_PRODUCTION.sp_activate_next_match
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_activate_next_match`()
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

-- Dumping structure for table psoft2017_PRODUCTION.teams
CREATE TABLE IF NOT EXISTS `teams` (
  `teamID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `groupID` int(11) DEFAULT NULL,
  `logoURL` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`teamID`)
) ENGINE=MyISAM AUTO_INCREMENT=101 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for procedure psoft2017_PRODUCTION.update_scores
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_scores`(
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

-- Dumping structure for table psoft2017_PRODUCTION.users
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
) ENGINE=MyISAM AUTO_INCREMENT=56 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
