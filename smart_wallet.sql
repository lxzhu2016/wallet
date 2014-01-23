-- phpMyAdmin SQL Dump
-- version 3.4.10.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 22, 2014 at 08:59 PM
-- Server version: 5.5.34
-- PHP Version: 5.3.10-1ubuntu3.9

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `smart_wallet`
--

-- --------------------------------------------------------

--
-- Table structure for table `wallet_account`
--

CREATE TABLE IF NOT EXISTS `wallet_account` (
  `account_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `person_id` bigint(20) NOT NULL,
  `account_name` varchar(50) CHARACTER SET utf8 NOT NULL,
  `account_type_id` int(11) NOT NULL,
  `account_category_id` bigint(20) NOT NULL,
  `created_on` datetime NOT NULL,
  `description` varchar(400) CHARACTER SET utf8 DEFAULT NULL,
  `sys_created_on` datetime NOT NULL,
  `sys_modified_on` datetime DEFAULT NULL,
  PRIMARY KEY (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `wallet_account_category`
--

CREATE TABLE IF NOT EXISTS `wallet_account_category` (
  `account_category_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `account_category_name` varchar(50) CHARACTER SET utf8 NOT NULL,
  `description` varchar(400) CHARACTER SET utf8 DEFAULT NULL,
  `sys_created_on` datetime NOT NULL,
  `sys_modified_one` datetime DEFAULT NULL,
  PRIMARY KEY (`account_category_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=7 ;

--
-- Dumping data for table `wallet_account_category`
--

INSERT INTO `wallet_account_category` (`account_category_id`, `user_id`, `account_category_name`, `description`, `sys_created_on`, `sys_modified_one`) VALUES
(1, 1, 'unknown', '', '2014-01-22 00:40:03', NULL),
(2, 1, 'book', '', '2014-01-22 00:40:03', NULL),
(3, 1, 'meals', '', '2014-01-22 00:40:03', NULL),
(4, 1, 'salary', '', '2014-01-22 00:40:03', NULL),
(5, 2, 'stock', '', '2014-01-22 00:40:03', NULL),
(6, 2, 'salary', '', '2014-01-22 00:40:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wallet_account_type`
--

CREATE TABLE IF NOT EXISTS `wallet_account_type` (
  `account_type_id` int(11) NOT NULL,
  `account_type_name` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8 DEFAULT NULL,
  `sys_created_on` datetime NOT NULL,
  `sys_modified_one` datetime DEFAULT NULL,
  PRIMARY KEY (`account_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `wallet_account_type`
--

INSERT INTO `wallet_account_type` (`account_type_id`, `account_type_name`, `description`, `sys_created_on`, `sys_modified_one`) VALUES
(1, 'Assets', '', '2014-01-22 00:40:03', NULL),
(2, 'Debt', '', '2014-01-22 00:40:03', NULL),
(3, 'Balance', '', '2014-01-22 00:40:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wallet_person`
--

CREATE TABLE IF NOT EXISTS `wallet_person` (
  `person_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `first_name` varchar(50) CHARACTER SET utf8 NOT NULL,
  `last_name` varchar(50) CHARACTER SET utf8 NOT NULL,
  `email` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `mobile` varchar(20) CHARACTER SET utf8 DEFAULT NULL,
  `is_user` bit(1) DEFAULT NULL,
  `sys_created_on` datetime NOT NULL,
  `sys_modified_on` datetime DEFAULT NULL,
  PRIMARY KEY (`person_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=7 ;

--
-- Dumping data for table `wallet_person`
--

INSERT INTO `wallet_person` (`person_id`, `user_id`, `first_name`, `last_name`, `email`, `mobile`, `is_user`, `sys_created_on`, `sys_modified_on`) VALUES
(1, 1, 'john', 'black', 'john@gmail.com', '+8615812345678', b'1', '2014-01-22 00:40:03', NULL),
(2, 1, 'smith', 'black', 'smith@gmail.com', '', b'0', '2014-01-22 00:40:03', NULL),
(3, 1, 'annie', 'black', 'annie@gmail.com', '', b'0', '2014-01-22 00:40:03', NULL),
(4, 2, 'adela', 'white', 'adela@gmail.com', '', b'1', '2014-01-22 00:40:03', NULL),
(5, 2, 'david', 'white', 'david@gmail.com', '', b'1', '2014-01-22 00:40:03', NULL),
(6, 3, 'annie', 'xing', 'mxxing@live.com', NULL, b'1', '2014-01-22 00:40:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transaction`
--

CREATE TABLE IF NOT EXISTS `wallet_transaction` (
  `transaction_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `from_account_id` bigint(20) NOT NULL,
  `to_account_id` bigint(20) NOT NULL,
  `amount` double(10,3) NOT NULL,
  `created_on` datetime NOT NULL,
  `executed_on` datetime DEFAULT NULL,
  `description` varchar(400) CHARACTER SET utf8 DEFAULT NULL,
  `sys_created_on` datetime NOT NULL,
  `sys_modified_on` datetime DEFAULT NULL,
  PRIMARY KEY (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `wallet_user`
--

CREATE TABLE IF NOT EXISTS `wallet_user` (
  `user_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) CHARACTER SET utf8 NOT NULL,
  `password` varchar(32) CHARACTER SET utf8 NOT NULL,
  `sys_created_on` datetime NOT NULL,
  `sys_modified_on` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=4 ;

--
-- Dumping data for table `wallet_user`
--

INSERT INTO `wallet_user` (`user_id`, `username`, `password`, `sys_created_on`, `sys_modified_on`) VALUES
(1, 'john', '1F9D9A9EFC2F523B2F09629444632B5C', '2014-01-22 00:40:03', NULL),
(2, 'adela', 'CB1875C78D366B3512585754E72FCB12', '2014-01-22 00:40:03', NULL),
(3, 'mxxing', 'annie', '2014-01-22 00:40:03', NULL);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
