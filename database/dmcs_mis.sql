-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 24, 2025 at 05:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dmcs_mis`
--

-- --------------------------------------------------------

--
-- Table structure for table `certificate_requests`
--

CREATE TABLE `certificate_requests` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `request_number` varchar(50) NOT NULL,
  `status` enum('pending','paid','approved','issued','rejected') NOT NULL DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `payment_reference` varchar(100) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `issued_at` datetime DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `certificate_path` varchar(500) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `notes` text DEFAULT NULL,
  `certificate_type` enum('sector','church') NOT NULL DEFAULT 'sector'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `certificate_requests`
--

INSERT INTO `certificate_requests` (`id`, `application_id`, `user_id`, `request_number`, `status`, `payment_status`, `payment_reference`, `payment_date`, `approved_at`, `approved_by`, `issued_at`, `issued_by`, `certificate_path`, `rejection_reason`, `created_at`, `updated_at`, `notes`, `certificate_type`) VALUES
(1, 5, 65, 'CERT-1761303702122-573RG', 'approved', 'paid', '0791724884', '2025-10-24 11:07:00', '2025-10-24 11:27:21', 63, NULL, NULL, NULL, NULL, '2025-10-24 11:01:42', '2025-10-24 11:27:21', NULL, 'sector');

-- --------------------------------------------------------

--
-- Table structure for table `churches`
--

CREATE TABLE `churches` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `denomination` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `leader_name` varchar(100) DEFAULT NULL,
  `leader_phone` varchar(20) DEFAULT NULL,
  `leader_email` varchar(100) DEFAULT NULL,
  `sector_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `churches`
--

INSERT INTO `churches` (`id`, `name`, `denomination`, `address`, `location`, `phone`, `email`, `leader_name`, `leader_phone`, `leader_email`, `sector_id`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
(1, 'St. Mary Catholic Church', 'Catholic', 'Kimisagara, Kigali', 'Kigali', '+250 788 111 111', 'stmary@church.rw', 'Rev. Father Jean Baptiste', '+250 788 111 112', 'jean.baptiste@church.rw', 1, 1, 'A beautiful Catholic church serving the Kimisagara community', '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(2, 'St. Paul Anglican Church', 'Anglican', 'Nyamirambo, Kigali', 'Kigali', '+250 788 222 222', 'stpaul@anglican.rw', 'Rev. Canon Peter Mugisha', '+250 788 222 223', 'peter.mugisha@anglican.rw', 1, 1, 'Historic Anglican church in Nyamirambo', '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(3, 'Kigali Baptist Church', 'Baptist', 'Kacyiru, Kigali', 'Kigali', '+250 788 333 333', 'kigali@baptist.rw', 'Pastor David Nkurunziza', '+250 788 333 334', 'david.nkurunziza@baptist.rw', 1, 1, 'Modern Baptist church in Kacyiru', '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(4, 'Musanze Presbyterian Church', 'Presbyterian', 'Musanze Town Center', 'Musanze', '+250 788 444 444', 'musanze@presbyterian.rw', 'Rev. Dr. Samuel Mukamana', '+250 788 444 445', 'samuel.mukamana@presbyterian.rw', 2, 1, 'Presbyterian church serving the Musanze community', '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(5, 'Huye Methodist Church', 'Methodist', 'Huye Town Center', 'Huye', '+250 788 555 555', 'huye@methodist.rw', 'Rev. Grace Uwimana', '+250 788 555 556', 'grace.uwimana@methodist.rw', 3, 1, 'Methodist church in Huye', '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(6, 'Rwamagana Pentecostal Church', 'Pentecostal', 'Rwamagana Town Center', 'Rwamagana', '+250 788 666 666', 'rwamagana@pentecostal.rw', 'Pastor Emmanuel Niyonshuti', '+250 788 666 667', 'emmanuel.niyonshuti@pentecostal.rw', 4, 1, 'Pentecostal church in Rwamagana', '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(7, 'Rubavu Seventh-day Adventist Church', 'Seventh-day Adventist', 'Rubavu Town Center', 'Rubavu', '+250 788 777 777', 'rubavu@adventist.rw', 'Pastor John Bosco', '+250 788 777 778', 'john.bosco@adventist.rw', 5, 1, 'Seventh-day Adventist church in Rubavu', '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(8, 'Kigali Methodiste church', 'Methodiste', 'Kigali,250 ', 'Kigali', '0785419324', 'methodiste@gmail.com', NULL, NULL, NULL, NULL, 1, '', '2025-10-24 07:46:59', '2025-10-24 07:46:59');

-- --------------------------------------------------------

--
-- Table structure for table `church_members`
--

CREATE TABLE `church_members` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `address` text DEFAULT NULL,
  `church_id` int(11) NOT NULL,
  `membership_number` varchar(50) DEFAULT NULL,
  `membership_date` date DEFAULT NULL,
  `membership_status` enum('active','inactive','suspended','transferred') NOT NULL DEFAULT 'active',
  `baptism_date` date DEFAULT NULL,
  `confirmation_date` date DEFAULT NULL,
  `marital_status` enum('single','married','divorced','widowed') DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `church_members`
--

INSERT INTO `church_members` (`id`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`, `gender`, `address`, `church_id`, `membership_number`, `membership_date`, `membership_status`, `baptism_date`, `confirmation_date`, `marital_status`, `occupation`, `emergency_contact`, `emergency_phone`, `notes`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'hozana', 'hozana', 'dhozana559@gmail.com', '0785419324', '2025-10-23', 'male', 'dhozana559@gmail.com', 1, 'MEM-1-0001', '2025-10-24', 'active', '2025-10-24', '2025-10-25', 'single', '', '', '', '', 1, 66, '2025-10-24 13:42:30', '2025-10-24 13:42:30'),
(2, 'John', 'Doe', 'john.doe@example.com', '+1234567890', NULL, 'male', NULL, 1, 'MEM001', NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, '2025-10-24 14:32:55', '2025-10-24 14:32:55'),
(3, 'Jane', 'Smith', 'jane.smith@example.com', '+1234567891', NULL, 'female', NULL, 1, 'MEM002', NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, '2025-10-24 14:32:55', '2025-10-24 14:32:55'),
(4, 'Mike', 'Johnson', 'mike.johnson@example.com', '+1234567892', NULL, 'male', NULL, 1, 'MEM003', NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, '2025-10-24 14:32:55', '2025-10-24 14:32:55');

-- --------------------------------------------------------

--
-- Table structure for table `church_services`
--

CREATE TABLE `church_services` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `service_type` enum('marriage','baptism','funeral','communion','prayer_meeting','bible_study','youth_service','other') NOT NULL,
  `church_id` int(11) NOT NULL,
  `scheduled_date` datetime NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `officiant_id` int(11) DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','cancelled','postponed') NOT NULL DEFAULT 'scheduled',
  `max_attendees` int(11) DEFAULT NULL,
  `current_attendees` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `church_services`
--

INSERT INTO `church_services` (`id`, `title`, `description`, `service_type`, `church_id`, `scheduled_date`, `start_time`, `end_time`, `location`, `officiant_id`, `status`, `max_attendees`, `current_attendees`, `notes`, `is_public`, `created_by`, `created_at`, `updated_at`) VALUES
(15, 'celemony', 'wedding', 'marriage', 1, '2025-10-24 00:00:00', '16:17:00', '18:19:00', 'Main Hall', NULL, 'scheduled', 1000, 0, 'wertyu', 1, 66, '2025-10-24 14:17:32', '2025-10-24 14:17:32');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `category` enum('birth_certificate','id_card','baptism_certificate','divorce_certificate','death_certificate','marriage_certificate','other') NOT NULL DEFAULT 'other',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `related_entity_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marriage_applications`
--

CREATE TABLE `marriage_applications` (
  `id` int(11) NOT NULL,
  `application_number` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `groom_first_name` varchar(50) NOT NULL,
  `groom_last_name` varchar(50) NOT NULL,
  `groom_date_of_birth` date NOT NULL,
  `groom_id_number` varchar(20) NOT NULL,
  `groom_phone` varchar(20) DEFAULT NULL,
  `groom_address` text DEFAULT NULL,
  `bride_first_name` varchar(50) NOT NULL,
  `bride_last_name` varchar(50) NOT NULL,
  `bride_date_of_birth` date NOT NULL,
  `bride_id_number` varchar(20) NOT NULL,
  `bride_phone` varchar(20) DEFAULT NULL,
  `bride_address` text DEFAULT NULL,
  `marriage_date` date NOT NULL,
  `ceremony_type` enum('civil','religious','both') NOT NULL DEFAULT 'both',
  `church_id` int(11) DEFAULT NULL,
  `sector_id` int(11) NOT NULL,
  `status` enum('pending','under_review','sector_approved','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  `civil_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `church_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `civil_admin_id` int(11) DEFAULT NULL,
  `church_leader_id` int(11) DEFAULT NULL,
  `civil_comments` text DEFAULT NULL,
  `church_comments` text DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `civil_reviewed_at` datetime DEFAULT NULL,
  `church_reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `marriage_applications`
--

INSERT INTO `marriage_applications` (`id`, `application_number`, `user_id`, `groom_first_name`, `groom_last_name`, `groom_date_of_birth`, `groom_id_number`, `groom_phone`, `groom_address`, `bride_first_name`, `bride_last_name`, `bride_date_of_birth`, `bride_id_number`, `bride_phone`, `bride_address`, `marriage_date`, `ceremony_type`, `church_id`, `sector_id`, `status`, `civil_status`, `church_status`, `civil_admin_id`, `church_leader_id`, `civil_comments`, `church_comments`, `documents`, `civil_reviewed_at`, `church_reviewed_at`, `created_at`, `updated_at`) VALUES
(1, 'APP-1737624000000', 63, 'John', 'Doe', '1990-01-01', '1234567890123', '0781234567', NULL, 'Jane', 'Smith', '1992-05-15', '9876543210987', '0787654321', NULL, '2025-12-25', 'both', 1, 1, 'pending', 'pending', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 08:04:29', '2025-10-24 08:04:29'),
(2, 'APP-1737625000000', 63, 'Test', 'User', '1990-01-01', '1234567890123', '0781234567', NULL, 'Test', 'Bride', '1992-05-15', '9876543210987', '0787654321', NULL, '2025-12-25', 'both', 1, 1, 'approved', 'pending', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 08:07:51', '2025-10-24 12:37:07'),
(4, 'APP-1737625000001', 63, 'John', 'Doe', '1990-01-01', '1234567890123', '0781234567', NULL, 'Jane', 'Smith', '1992-05-15', '9876543210987', '0787654321', NULL, '2025-12-25', 'both', 1, 1, 'approved', 'pending', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 08:55:32', '2025-10-24 10:02:49'),
(5, 'APP-1761299151304', 65, 'dusabimana ', 'Hozana', '1905-10-24', '1234567812345678', '0781646346', '', 'Ange ', 'Kevine', '1901-10-24', '1234567812345678', '0764364735', '', '2025-11-23', 'both', 4, 1, 'approved', 'pending', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 09:45:51', '2025-10-24 10:02:48');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `related_entity_id` int(11) DEFAULT NULL,
  `action_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sectors`
--

CREATE TABLE `sectors` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) NOT NULL,
  `district` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sectors`
--

INSERT INTO `sectors` (`id`, `name`, `code`, `district`, `province`, `address`, `phone`, `email`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Gikondo', 'CD001', 'Kigali', 'Kigali City', 'Central Business District, Kigali', '+250 788 123 456', 'central@civil.gov.rw', 1, '2025-10-24 05:59:58', '2025-10-24 07:47:43'),
(2, 'North District', 'ND001', 'Musanze', 'Northern Province', 'Musanze Town Center', '+250 788 234 567', 'north@civil.gov.rw', 1, '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(3, 'South District', 'SD001', 'Huye', 'Southern Province', 'Huye Town Center', '+250 788 345 678', 'south@civil.gov.rw', 1, '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(4, 'East District', 'ED001', 'Rwamagana', 'Eastern Province', 'Rwamagana Town Center', '+250 788 456 789', 'east@civil.gov.rw', 1, '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(5, 'West District', 'WD001', 'Rubavu', 'Western Province', 'Rubavu Town Center', '+250 788 567 890', 'west@civil.gov.rw', 1, '2025-10-24 05:59:58', '2025-10-24 05:59:58'),
(6, 'Rebero', 'EK001', 'Gasabo', 'Kigali', 'Kigali 250\n', '0785419324', 'rebero@gmail.com', 1, '2025-10-24 07:48:52', '2025-10-24 07:48:52');

-- --------------------------------------------------------

--
-- Table structure for table `service_comments`
--

CREATE TABLE `service_comments` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `comment_type` enum('general','concern','suggestion','cancellation_reason') NOT NULL DEFAULT 'general',
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_comments`
--

INSERT INTO `service_comments` (`id`, `service_id`, `member_id`, `comment`, `comment_type`, `is_anonymous`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 15, 1, 'WE will be there', 'general', 1, 0, '2025-10-24 14:37:14', '2025-10-24 14:37:14');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `user_type` enum('couple','church_leader','civil_admin','super_admin') NOT NULL DEFAULT 'couple',
  `phone` varchar(20) DEFAULT NULL,
  `church_id` int(11) DEFAULT NULL,
  `sector_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `user_type`, `phone`, `church_id`, `sector_id`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(2, 'testuser', 'test@example.com', '$2a$10$rDo8D2HqyyEfHG4AE3ojC.np9Kz/D/Zo766fqZJGqVJfiZnbE67ru', 'Test', 'User', 'couple', '+250788123456', NULL, 1, 1, '2025-10-24 06:54:46', '2025-10-24 06:05:20', '2025-10-24 06:54:46'),
(3, 'testcouple', 'couple@test.com', '$2a$10$v7O23Fy0KBrhqhsfjRX8F.CGBn6GcN7UgbqROS33O5HcRCzRK4cJ6', 'John', 'Doe', 'couple', '+250788111111', NULL, 1, 1, '2025-10-24 06:07:27', '2025-10-24 06:06:55', '2025-10-24 06:07:27'),
(6, 'churchleader', 'leader@church.com', '$2a$10$e1Di8GO1dGezo/.Tk0tUHuYjdj2rlayTm7Rk0jdEa5WHcPNer6Tuq', 'Pastor', 'Smith', 'church_leader', '+250788222222', 1, 1, 1, NULL, '2025-10-24 06:07:06', '2025-10-24 06:07:06'),
(7, 'civiladmin', 'admin@civil.gov.rw', '$2a$10$YO/pVkGp8wnr/6GaCOvhku8iXNDwFy5lie72rX.IJ01abxexFFtra', 'Civil', 'Admin', 'civil_admin', '+250788333333', NULL, 1, 1, NULL, '2025-10-24 06:07:18', '2025-10-24 06:07:18'),
(11, 'testuser123', 'testuser123@example.com', '$2a$10$cc8vHLYJQ7.027DUNUnH/eY6Q7m3.2Mu0ni2htbyjv.f.O2OR49AO', 'Test', 'User', 'couple', '+250788111111', NULL, 1, 1, NULL, '2025-10-24 06:13:14', '2025-10-24 06:13:14'),
(12, 'frontendtest2', 'frontendtest2@example.com', '$2a$10$..3zmfQRIOOCIYA35DIgROWG3hVBmPBbzVHequ2vvWCgjGw/Latti', 'Frontend', 'Test', 'couple', '+250788999999', NULL, 1, 1, NULL, '2025-10-24 06:17:22', '2025-10-24 06:17:22'),
(14, 'newuser123', 'newuser@example.com', '$2a$10$CjhnUnZPMX5ffQTEkVKPs.L5my5.9tyJL7vM2HVvQfJV4qvp/2ova', 'New', 'User', 'couple', NULL, NULL, 1, 1, '2025-10-24 06:19:49', '2025-10-24 06:19:42', '2025-10-24 06:19:49'),
(16, 'testuser2', 'test2@example.com', '$2a$10$oYwGbI3Xn301PzS713ZEpuoyNd.dDyuQ1e.IS68i78qqSMWwfMaQ2', 'Test', 'User', 'couple', NULL, NULL, 1, 1, NULL, '2025-10-24 06:23:08', '2025-10-24 06:23:08'),
(17, 'testuser3', 'test3@example.com', '$2a$10$pkIXAR/XfqIcGcAHA.DUBuWf5l0fi2cUWNRviIktEvfA/wzDILfFm', 'Test', 'User', 'couple', NULL, NULL, 1, 1, NULL, '2025-10-24 06:23:39', '2025-10-24 06:23:39'),
(19, 'testuser4', 'test4@example.com', '$2a$10$vuHIR2AMdXEDqe/Bvgcx/.qgy1FSNlSWeXbk6AqO/V6pydt0Lljcy', 'Test', 'User', 'couple', NULL, NULL, 1, 1, NULL, '2025-10-24 06:26:43', '2025-10-24 06:26:43'),
(21, 'newcouple123', 'newcouple@example.com', '$2a$10$vzsg/tBB.YS5edCqIjxeN.96uP/v56bA2CiGbwiuufZHLWDf7rCGy', 'Jane', 'Smith', 'couple', '+250788999888', NULL, 1, 1, '2025-10-24 06:28:12', '2025-10-24 06:28:06', '2025-10-24 06:28:12'),
(23, 'testcouple456', 'couple456@test.com', '$2a$10$BEutVmm7uLf/Jx6Y/xOTeujEku6c3eLUTpwZtydKV1GHxXpPialR.', 'John', 'Doe', 'couple', '+250788123456', NULL, 1, 1, '2025-10-24 06:31:56', '2025-10-24 06:31:42', '2025-10-24 06:31:56'),
(24, 'churchleader456', 'leader456@church.com', '$2a$10$.mDFOoSRZy14sC9DZkfnl.NsaWDq64dCZNK4w5jygQ5MqzSfYlJqS', 'Pastor', 'Maria', 'church_leader', '+250788654321', 1, 1, 1, '2025-10-24 06:32:03', '2025-10-24 06:31:48', '2025-10-24 06:32:03'),
(27, 'testuser789', 'test789@example.com', '$2a$10$R/ZR/rIXq4/4O6Km3Ebp1ek28k2wIatQAuw/gXIxoEa/sx3TvtKBa', 'Test', 'User', 'couple', '+250788123456', NULL, 1, 1, NULL, '2025-10-24 06:37:06', '2025-10-24 06:37:06'),
(28, 'finaltest123', 'finaltest@example.com', '$2a$10$o2kglJIMlWCzuFR/8uLCOO1LrcOLM6DWrk3xvIzCXH/nNoPzTbfry', 'Final', 'Test', 'couple', '+250788999888', NULL, 1, 1, NULL, '2025-10-24 06:37:20', '2025-10-24 06:37:20'),
(30, 'browsertest123', 'browsertest@example.com', '$2a$10$TpbCETAZCJRyT2493oFahe/0bkfJ67GUTONw4DjmX073T8hDERPlu', 'Browser', 'Test', 'couple', '+250788111222', NULL, 1, 1, NULL, '2025-10-24 06:40:18', '2025-10-24 06:40:18'),
(31, 'browsertest456', 'browsertest456@example.com', '$2a$10$i2XZpxq2G3705xMRupWZHuMHM2iwVSlfycPXDwAvEeDI2n0rciuQa', 'Browser', 'Test', 'couple', '+250788333444', NULL, 1, 1, NULL, '2025-10-24 06:40:35', '2025-10-24 06:40:35'),
(38, 'hozanas', 'dhozana559@gmail.com', '$2a$10$PhRpqVgx6i3gaf9wGeuaAutoOGVw3ch0F3PiW26ZommUfYfRPhroa', 'Hozana', 'DUSABIMANA', 'civil_admin', '0791724880', NULL, 1, 1, '2025-10-24 06:53:24', '2025-10-24 06:44:12', '2025-10-24 06:53:24'),
(43, 'autotest123', 'autotest@example.com', '$2a$10$bi.p9RDvw5VdMt4yJSWtfOPIP7mG.gpFq2ZY5dSgfqvZmjNXuOOh6', 'Auto', 'Test', 'couple', '+250788999888', NULL, 1, 1, '2025-10-24 06:52:44', '2025-10-24 06:52:37', '2025-10-24 06:52:44'),
(44, 'churchleader123', 'churchleader@example.com', '$2a$10$NTM4.EhpRbCIqBqIeV9GRO37murNGQ8N4vID7eyx9rBPr0a28MKAO', 'Pastor', 'John', 'church_leader', '+250788111222', NULL, 1, 1, NULL, '2025-10-24 06:53:15', '2025-10-24 06:53:15'),
(45, 'testuser20251024085508', 'test20251024085508@example.com', '$2a$10$67j.PVjqCV9cyy1aHxJucuFfW..M3TgwcWg/uZKkdLFzBvGT1mPwW', 'Test', 'User', 'couple', NULL, NULL, 1, 1, NULL, '2025-10-24 06:55:09', '2025-10-24 06:55:09'),
(46, 'testuser20251024085718', 'test20251024085718@example.com', '$2a$10$AuIxGfXXK/UH344F4Ndsve/7gtQeWPX8vvFc.FbPTg221YQ5N48SO', 'Test', 'User', 'couple', '+250 788 123 456', NULL, 1, 1, NULL, '2025-10-24 06:57:18', '2025-10-24 06:57:18'),
(47, 'demo20251024085743', 'demo20251024085743@test.com', '$2a$10$UKw9D9EsdpDzpr/QcGsCDu3UYg3bRb5l2Ty52K/rrBWUC59UkXZUS', 'Demo', 'User', 'couple', NULL, NULL, 1, 1, '2025-10-24 07:17:28', '2025-10-24 06:57:43', '2025-10-24 07:17:28'),
(52, 'testuser20251024090352', 'test20251024090352@example.com', '$2a$10$v8kWBKflmDJrq/Sb92rPr.W/.Z/Lal349GneZuVWGoEUOUWoir2iW', 'Test', 'User', 'couple', NULL, NULL, 1, 1, NULL, '2025-10-24 07:03:52', '2025-10-24 07:03:52'),
(53, 'testuser20251024090413', 'test20251024090413@example.com', '$2a$10$pJ.J3/NbVKKFu9HQNYK6puDIgJaLO6HKanyLMe2Tx5wPuONVZUZaW', 'Test', 'User', 'couple', NULL, NULL, 1, 1, NULL, '2025-10-24 07:04:13', '2025-10-24 07:04:13'),
(54, 'testuser20251024090502', 'test20251024090502@example.com', '$2a$10$5SRBdwti1E67sST2Vc1f1eo2pM9rJZIRAIam8P8l720yBjpIiIXoO', 'Test', 'User', 'couple', NULL, NULL, 1, 1, NULL, '2025-10-24 07:05:02', '2025-10-24 07:05:02'),
(56, 'johndoe20251024090657', 'john.doe20251024090657@example.com', '$2a$10$R3R5tvx9QRavRb9b95RJjuC5ljEqgy9SKjtD.c7b6gBOllWqEjoxS', 'John', 'Doe', 'couple', '+250 788 123 456', NULL, 1, 1, NULL, '2025-10-24 07:06:57', '2025-10-24 07:06:57'),
(57, 'johndoe20251024090727', 'john.doe20251024090727@example.com', '$2a$10$qrvdEE18zCB6DS5MlkO3H.4ZXzJmLzPyJdEAD0CoDHZHK8aifArC6', 'John', 'Doe', 'couple', NULL, NULL, 1, 1, NULL, '2025-10-24 07:07:27', '2025-10-24 07:07:27'),
(58, 'frontend20251024090811', 'frontend20251024090811@test.com', '$2a$10$OeJ9TDOnMutvKEyyRLFd9.KTxCN9h4VQ5QYnNFZpFt4ZODLWImt2u', 'Frontend', 'Test', 'couple', '+250 788 999 888', NULL, 1, 1, '2025-10-24 07:08:36', '2025-10-24 07:08:12', '2025-10-24 07:08:36'),
(59, 'dhozana529@gmail.com', 'churchleader2@gmail.com', '$2a$10$YO9r0yvTWwsJ1Oey/F/MIu8ZpAJREGCHhNo0beQtKUKrFQscTVsD6', 'hozana', 'DUSABIMANA Hozana', 'couple', '0785419324', NULL, 1, 1, NULL, '2025-10-24 07:09:22', '2025-10-24 07:09:22'),
(60, 'dhozana4', 'churchleaders4@gmail.com', '$2a$10$XNRg1h.Z03hbF7sxfBjsAug4Jqw6IG89ls8/IBmfi.K2QaJujGkqe', 'hozana', 'DUSABIMANA Hozana', 'church_leader', '0785419324', 7, 1, 1, NULL, '2025-10-24 07:09:43', '2025-10-24 07:09:43'),
(61, 'civiladmin3', 'civiladmin3@gmail.com', '$2a$10$AHLm10b5HY59keI//4Mu..sjxbefa4oLTiV1bbUMPN6mif157TlFy', 'hozana', 'DUSABIMANA Hozana', 'civil_admin', '0785419324', NULL, 1, 1, NULL, '2025-10-24 07:10:29', '2025-10-24 07:10:29'),
(62, 'admin20251024091739', 'admin20251024091739@test.com', '$2a$10$fTUXlcvZ27740Ub1mTl9k.eAK6K45p86XRxiJybBN/1dOolZHf3oe', 'Admin', 'User', 'civil_admin', NULL, NULL, 1, 1, '2025-10-24 07:24:03', '2025-10-24 07:17:40', '2025-10-24 07:24:03'),
(63, 'civiladmin7', 'civiladmin7@gmail.com', '$2a$10$jSQtQ8lqrVhInUcY8InvA.A0KJwMACFczp135FAYPm4A4tBwGE65y', 'hozana', 'DUSABIMANA Hozana', 'civil_admin', '0785419324', NULL, 1, 1, '2025-10-24 15:21:09', '2025-10-24 07:27:27', '2025-10-24 15:21:09'),
(64, 'civiladmin34', 'dhozana5534@gmail.com', '$2a$10$mG2ohcXRadVniVLS93261OhRvU2s97A2k2a/fKExqheUhDdJaaFUe', 'hozana', 'hozana', 'couple', '0785419324', NULL, 1, 1, NULL, '2025-10-24 07:34:30', '2025-10-24 07:34:30'),
(65, 'danny1', 'couple1@gmail.com', '$2a$10$8SuRN7Q27JbouPkg1u4D6OnkUv.59uhPkegL/su2bXhqWLGVC.d7e', 'Danny', 'Vumbi', 'couple', '0789735484', 1, 1, 1, '2025-10-24 14:28:58', '2025-10-24 07:51:14', '2025-10-24 14:28:58'),
(66, 'Cynthia@123', 'igihozo@gmail.com', '$2a$10$8SuRN7Q27JbouPkg1u4D6OnkUv.59uhPkegL/su2bXhqWLGVC.d7e', 'Igihozo', 'Cynthia', 'church_leader', '0785419324', 1, NULL, 1, '2025-10-24 14:42:15', '2025-10-24 12:32:25', '2025-10-24 14:42:15'),
(67, 'coupletest', 'coupletest@example.com', '$2a$10$3pFRNzanpFKbY/in3.INleJbJspYA/CEhOVYuRIsa6QrzvPYYufKW', 'John', 'Doe', 'couple', '+250788111111', 1, 1, 1, NULL, '2025-10-24 15:17:46', '2025-10-24 15:17:46'),
(68, 'danny12', 'mahorodocile2@gmail.com', '$2a$10$h2xzMAEgBVVLQtp.10Z2D.4snjmaySCLcyNIWCax7jQvofEzM0o1K', 'Danny', 'Vumbi', 'couple', '0789735482', 7, 1, 1, NULL, '2025-10-24 15:22:24', '2025-10-24 15:22:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `request_number` (`request_number`),
  ADD UNIQUE KEY `request_number_2` (`request_number`),
  ADD UNIQUE KEY `request_number_3` (`request_number`),
  ADD UNIQUE KEY `request_number_4` (`request_number`),
  ADD UNIQUE KEY `request_number_5` (`request_number`),
  ADD UNIQUE KEY `request_number_6` (`request_number`),
  ADD UNIQUE KEY `request_number_7` (`request_number`),
  ADD UNIQUE KEY `request_number_8` (`request_number`),
  ADD UNIQUE KEY `request_number_9` (`request_number`),
  ADD UNIQUE KEY `request_number_10` (`request_number`),
  ADD UNIQUE KEY `request_number_11` (`request_number`),
  ADD UNIQUE KEY `request_number_12` (`request_number`),
  ADD UNIQUE KEY `request_number_13` (`request_number`),
  ADD UNIQUE KEY `request_number_14` (`request_number`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `issued_by` (`issued_by`);

--
-- Indexes for table `churches`
--
ALTER TABLE `churches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sector_id` (`sector_id`);

--
-- Indexes for table `church_members`
--
ALTER TABLE `church_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `membership_number` (`membership_number`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `membership_number_2` (`membership_number`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `membership_number_3` (`membership_number`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `membership_number_4` (`membership_number`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `membership_number_5` (`membership_number`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `membership_number_6` (`membership_number`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `membership_number_7` (`membership_number`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `membership_number_8` (`membership_number`),
  ADD KEY `church_id` (`church_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `church_services`
--
ALTER TABLE `church_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `church_id` (`church_id`),
  ADD KEY `officiant_id` (`officiant_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `marriage_applications`
--
ALTER TABLE `marriage_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_number` (`application_number`),
  ADD UNIQUE KEY `application_number_2` (`application_number`),
  ADD UNIQUE KEY `application_number_3` (`application_number`),
  ADD UNIQUE KEY `application_number_4` (`application_number`),
  ADD UNIQUE KEY `application_number_5` (`application_number`),
  ADD UNIQUE KEY `application_number_6` (`application_number`),
  ADD UNIQUE KEY `application_number_7` (`application_number`),
  ADD UNIQUE KEY `application_number_8` (`application_number`),
  ADD UNIQUE KEY `application_number_9` (`application_number`),
  ADD UNIQUE KEY `application_number_10` (`application_number`),
  ADD UNIQUE KEY `application_number_11` (`application_number`),
  ADD UNIQUE KEY `application_number_12` (`application_number`),
  ADD UNIQUE KEY `application_number_13` (`application_number`),
  ADD UNIQUE KEY `application_number_14` (`application_number`),
  ADD UNIQUE KEY `application_number_15` (`application_number`),
  ADD UNIQUE KEY `application_number_16` (`application_number`),
  ADD UNIQUE KEY `application_number_17` (`application_number`),
  ADD UNIQUE KEY `application_number_18` (`application_number`),
  ADD UNIQUE KEY `application_number_19` (`application_number`),
  ADD UNIQUE KEY `application_number_20` (`application_number`),
  ADD UNIQUE KEY `application_number_21` (`application_number`),
  ADD UNIQUE KEY `application_number_22` (`application_number`),
  ADD UNIQUE KEY `application_number_23` (`application_number`),
  ADD UNIQUE KEY `application_number_24` (`application_number`),
  ADD UNIQUE KEY `application_number_25` (`application_number`),
  ADD UNIQUE KEY `application_number_26` (`application_number`),
  ADD UNIQUE KEY `application_number_27` (`application_number`),
  ADD UNIQUE KEY `application_number_28` (`application_number`),
  ADD UNIQUE KEY `application_number_29` (`application_number`),
  ADD UNIQUE KEY `application_number_30` (`application_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `church_id` (`church_id`),
  ADD KEY `sector_id` (`sector_id`),
  ADD KEY `civil_admin_id` (`civil_admin_id`),
  ADD KEY `church_leader_id` (`church_leader_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `sectors`
--
ALTER TABLE `sectors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`),
  ADD UNIQUE KEY `code_5` (`code`),
  ADD UNIQUE KEY `code_6` (`code`),
  ADD UNIQUE KEY `code_7` (`code`),
  ADD UNIQUE KEY `code_8` (`code`),
  ADD UNIQUE KEY `code_9` (`code`),
  ADD UNIQUE KEY `code_10` (`code`),
  ADD UNIQUE KEY `code_11` (`code`),
  ADD UNIQUE KEY `code_12` (`code`),
  ADD UNIQUE KEY `code_13` (`code`),
  ADD UNIQUE KEY `code_14` (`code`),
  ADD UNIQUE KEY `code_15` (`code`),
  ADD UNIQUE KEY `code_16` (`code`),
  ADD UNIQUE KEY `code_17` (`code`),
  ADD UNIQUE KEY `code_18` (`code`),
  ADD UNIQUE KEY `code_19` (`code`),
  ADD UNIQUE KEY `code_20` (`code`),
  ADD UNIQUE KEY `code_21` (`code`),
  ADD UNIQUE KEY `code_22` (`code`),
  ADD UNIQUE KEY `code_23` (`code`),
  ADD UNIQUE KEY `code_24` (`code`),
  ADD UNIQUE KEY `code_25` (`code`),
  ADD UNIQUE KEY `code_26` (`code`),
  ADD UNIQUE KEY `code_27` (`code`),
  ADD UNIQUE KEY `code_28` (`code`),
  ADD UNIQUE KEY `code_29` (`code`),
  ADD UNIQUE KEY `code_30` (`code`),
  ADD UNIQUE KEY `code_31` (`code`),
  ADD UNIQUE KEY `code_32` (`code`),
  ADD UNIQUE KEY `code_33` (`code`),
  ADD UNIQUE KEY `code_34` (`code`),
  ADD UNIQUE KEY `code_35` (`code`),
  ADD UNIQUE KEY `code_36` (`code`),
  ADD UNIQUE KEY `code_37` (`code`),
  ADD UNIQUE KEY `code_38` (`code`),
  ADD UNIQUE KEY `code_39` (`code`),
  ADD UNIQUE KEY `code_40` (`code`),
  ADD UNIQUE KEY `code_41` (`code`),
  ADD UNIQUE KEY `code_42` (`code`),
  ADD UNIQUE KEY `code_43` (`code`),
  ADD UNIQUE KEY `code_44` (`code`),
  ADD UNIQUE KEY `code_45` (`code`),
  ADD UNIQUE KEY `code_46` (`code`),
  ADD UNIQUE KEY `code_47` (`code`),
  ADD UNIQUE KEY `code_48` (`code`),
  ADD UNIQUE KEY `code_49` (`code`),
  ADD UNIQUE KEY `code_50` (`code`),
  ADD UNIQUE KEY `code_51` (`code`),
  ADD UNIQUE KEY `code_52` (`code`),
  ADD UNIQUE KEY `code_53` (`code`),
  ADD UNIQUE KEY `code_54` (`code`),
  ADD UNIQUE KEY `code_55` (`code`),
  ADD UNIQUE KEY `code_56` (`code`),
  ADD UNIQUE KEY `code_57` (`code`),
  ADD UNIQUE KEY `code_58` (`code`),
  ADD UNIQUE KEY `code_59` (`code`),
  ADD UNIQUE KEY `code_60` (`code`),
  ADD UNIQUE KEY `code_61` (`code`),
  ADD UNIQUE KEY `code_62` (`code`),
  ADD UNIQUE KEY `code_63` (`code`);

--
-- Indexes for table `service_comments`
--
ALTER TABLE `service_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `username_13` (`username`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `username_14` (`username`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `username_15` (`username`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `username_16` (`username`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `username_17` (`username`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `username_18` (`username`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `username_19` (`username`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `username_20` (`username`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `username_21` (`username`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `username_22` (`username`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `username_23` (`username`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `username_24` (`username`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `username_25` (`username`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `username_26` (`username`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `username_27` (`username`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `username_28` (`username`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `username_29` (`username`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `username_30` (`username`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `username_31` (`username`),
  ADD KEY `church_id` (`church_id`),
  ADD KEY `sector_id` (`sector_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `certificate_requests`
--
ALTER TABLE `certificate_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `churches`
--
ALTER TABLE `churches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `church_members`
--
ALTER TABLE `church_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `church_services`
--
ALTER TABLE `church_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marriage_applications`
--
ALTER TABLE `marriage_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sectors`
--
ALTER TABLE `sectors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `service_comments`
--
ALTER TABLE `service_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD CONSTRAINT `certificate_requests_ibfk_53` FOREIGN KEY (`application_id`) REFERENCES `marriage_applications` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `certificate_requests_ibfk_54` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `certificate_requests_ibfk_55` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `certificate_requests_ibfk_56` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `churches`
--
ALTER TABLE `churches`
  ADD CONSTRAINT `churches_ibfk_1` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`id`);

--
-- Constraints for table `church_members`
--
ALTER TABLE `church_members`
  ADD CONSTRAINT `church_members_ibfk_15` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `church_members_ibfk_16` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `church_services`
--
ALTER TABLE `church_services`
  ADD CONSTRAINT `church_services_ibfk_22` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `church_services_ibfk_23` FOREIGN KEY (`officiant_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `church_services_ibfk_24` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `marriage_applications`
--
ALTER TABLE `marriage_applications`
  ADD CONSTRAINT `marriage_applications_ibfk_88` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `marriage_applications_ibfk_89` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `marriage_applications_ibfk_90` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `marriage_applications_ibfk_91` FOREIGN KEY (`civil_admin_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `marriage_applications_ibfk_92` FOREIGN KEY (`church_leader_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `service_comments`
--
ALTER TABLE `service_comments`
  ADD CONSTRAINT `service_comments_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `church_services` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `service_comments_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `church_members` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_59` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_60` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
