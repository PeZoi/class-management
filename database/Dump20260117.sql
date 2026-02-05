-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: class_management
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `monthly_fee` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `teacher_id` varchar(255) NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `schedule` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKk9k2qotp6nupi0e2ahpl0bhrp` (`name`),
  KEY `FKkjmf1ni8hw6cdospr7o96va9h` (`teacher_id`),
  CONSTRAINT `FKkjmf1ni8hw6cdospr7o96va9h` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class`
--

LOCK TABLES `class` WRITE;
/*!40000 ALTER TABLE `class` DISABLE KEYS */;
INSERT INTO `class` VALUES ('11851293-e352-4af9-b37f-af6f6f9ca826','2025-12-31 06:25:59.327202','2026-01-05 01:12:32.301085',600000,'Lớp 2','f8f1de40-740f-423a-8ac0-abb7e9ba5cbf','admin','admin','T3, T5 - 13:00'),('41e76fb3-2e4d-4c7b-9e84-793cbcc495e0','2025-12-31 06:54:32.438701',NULL,500000,'Lớp 3','5ca6c894-fa8c-42cf-9d09-6a30dca2eb86','admin','admin','T2, T3, T4 - 16:00'),('99d973c2-e05f-4c1f-bf4b-d7a53f0f369e','2025-12-31 04:14:53.158528','2025-12-31 07:09:54.180143',500000,'Lớp 1','5ca6c894-fa8c-42cf-9d09-6a30dca2eb86','admin','admin','T2, T4, T6 - 18:00');
/*!40000 ALTER TABLE `class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_shift`
--

DROP TABLE IF EXISTS `class_shift`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_shift` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `class_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKastluntg7bjghip3kh6b9fdku` (`class_id`),
  CONSTRAINT `FKastluntg7bjghip3kh6b9fdku` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_shift`
--

LOCK TABLES `class_shift` WRITE;
/*!40000 ALTER TABLE `class_shift` DISABLE KEYS */;
INSERT INTO `class_shift` VALUES ('3acd26bc-df19-46fc-8b80-d36e665ece36','2026-01-15 09:00:58.917410','admin',NULL,'admin','Ca sáng - T2, T4, T6 - 18:00 - 20:05','11851293-e352-4af9-b37f-af6f6f9ca826');
/*!40000 ALTER TABLE `class_shift` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` varchar(255) NOT NULL,
  `amount` bigint NOT NULL,
  `billing_month` datetime(6) NOT NULL,
  `direction` enum('EXPENSE','INCOME') NOT NULL,
  `fee_snapshot` bigint NOT NULL,
  `paid` bigint NOT NULL,
  `payment_id` varchar(255) NOT NULL,
  `payment_method` enum('BANK_TRANSFER','CASH') NOT NULL,
  `payment_status` enum('CANCELLED','COMPLETED','INCOMPLETE') NOT NULL,
  `payment_type` enum('REFUND','STUDENT_FEE','TEACHER_SALARY') NOT NULL,
  `class_id` varchar(255) DEFAULT NULL,
  `student_id` varchar(255) DEFAULT NULL,
  `teacher_id` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  `bonus` bigint DEFAULT NULL,
  `deduction` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKh2cx18159w1evkp50cj9p8s8y` (`payment_id`),
  KEY `FK8nqgb6co2qub9sucast4ksf1d` (`class_id`),
  KEY `FKq0mpbhvyrwyggk1gwjams69wf` (`student_id`),
  KEY `FKnxwgpjdmpmhr80rue1tq345ue` (`teacher_id`),
  CONSTRAINT `FK8nqgb6co2qub9sucast4ksf1d` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`),
  CONSTRAINT `FKnxwgpjdmpmhr80rue1tq345ue` FOREIGN KEY (`teacher_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKq0mpbhvyrwyggk1gwjams69wf` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES ('1b9f27e8-21c5-461a-8fc1-f5e64b23cff6',600000,'2026-04-01 00:00:00.000000','INCOME',600000,300000,'PAY-5FB200E2','CASH','INCOMPLETE','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,'2026-01-14 02:35:05.005289','admin',NULL,'admin',NULL,NULL,NULL),('1eaf3099-93af-4c97-a65f-3e4eb6c4ce93',600000,'2026-01-01 00:00:00.000000','INCOME',600000,300000,'PAY-BD1525E2','CASH','INCOMPLETE','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','919dff2c-1a56-4bfa-9427-11756b5fce71',NULL,'2026-01-16 07:55:26.962751','admin',NULL,'admin',NULL,NULL,NULL),('250c9a18-0cbe-4735-a113-d91c4b02e16d',300000,'2026-01-01 00:00:00.000000','INCOME',600000,300000,'PAY-7849CEBC','CASH','COMPLETED','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','919dff2c-1a56-4bfa-9427-11756b5fce71',NULL,'2026-01-16 07:55:42.290468','admin',NULL,'admin',NULL,NULL,NULL),('32d88aa6-f428-440c-80ab-b306de1cbde5',300000,'2026-04-01 00:00:00.000000','INCOME',600000,300000,'PAY-59A25650','CASH','COMPLETED','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,'2026-01-14 03:04:23.902290','admin',NULL,'admin',NULL,NULL,NULL),('4bb1d54d-a140-40ba-85fe-4ba4f501fa28',600000,'2026-01-01 00:00:00.000000','INCOME',600000,600000,'PAY-E0110049','CASH','COMPLETED','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','bd93114d-fff0-427e-88e1-6744a8e8d0a4',NULL,'2026-01-16 01:37:34.731362','admin',NULL,'admin',NULL,NULL,NULL),('548aeda3-d9f6-4c7e-8a8d-511bfc8712bd',600000,'2026-02-01 00:00:00.000000','INCOME',600000,600000,'PAY-4B0F1710','CASH','COMPLETED','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,'2026-01-14 02:29:04.274247','admin',NULL,'admin',NULL,NULL,NULL),('5752d5c6-28a6-4b62-8bbd-153b2276dc93',600000,'2026-05-01 00:00:00.000000','INCOME',600000,600000,'PAY-6145C071','CASH','COMPLETED','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,'2026-01-14 05:33:54.333438','admin',NULL,'admin',NULL,NULL,NULL),('5956db9f-be24-4e3e-a394-f69bb7d80a94',600000,'2026-03-01 00:00:00.000000','INCOME',600000,600000,'PAY-12B61BDC','CASH','COMPLETED','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,'2026-01-14 02:32:49.663392','admin',NULL,'admin',NULL,NULL,NULL),('7715e1fb-ce01-4e3c-b272-273873b33bc4',600000,'2026-01-01 00:00:00.000000','INCOME',600000,600000,'PAY-27B90B67','CASH','COMPLETED','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,'2026-01-14 02:26:51.906931','admin',NULL,'admin',NULL,NULL,NULL),('d38c1ba9-b9d3-4941-b4d9-c2b365f491e4',600000,'2026-01-01 00:00:00.000000','INCOME',600000,600000,'PAY-52D844BC','CASH','COMPLETED','STUDENT_FEE','11851293-e352-4af9-b37f-af6f6f9ca826','0e7cdac9-f56f-4517-89f6-d5b24445d978',NULL,'2026-01-14 07:25:40.742132','admin',NULL,'admin',NULL,NULL,NULL);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'ROLE_ADMIN'),(2,'ROLE_TEACHER');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `dob` datetime(6) DEFAULT NULL,
  `email` varchar(30) NOT NULL,
  `full_name` varchar(45) NOT NULL,
  `full_name_parent` varchar(45) NOT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  `phone_number` varchar(30) NOT NULL,
  `phone_number_parent` varchar(30) NOT NULL,
  `status` enum('ACTIVE','DROPPED_OUT','GRADUATED','INACTIVE') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfe0i52si7ybu0wjedj6motiim` (`email`),
  UNIQUE KEY `UKi3xrfnuv2icsd1vhvn6c108ec` (`phone_number`),
  UNIQUE KEY `UK52vpc3f7332wx2kr0w9nao0hk` (`phone_number_parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES ('0e7cdac9-f56f-4517-89f6-d5b24445d978','2026-01-06 02:12:30.244121','admin',NULL,'admin','1998-11-15 00:00:00.000000','sutesyc@mailinator.com','Dawn Parker','Grady Parrish','FEMALE','0283948938','0283948938','ACTIVE'),('1ee41494-97fc-424b-ad32-aa77757d0864','2026-01-06 02:03:54.024466','admin','2026-01-14 02:11:20.854705','admin','1976-01-24 00:00:00.000000','geveyo4846@atinjo.com','Anne Rodgers','Gregory Clay','MALE','0989898767','0989898767','ACTIVE'),('919dff2c-1a56-4bfa-9427-11756b5fce71','2026-01-16 07:53:05.394555','admin',NULL,'admin','2008-12-08 00:00:00.000000','rucowepine@mailinator.com','Allistair Merrill','Burton Wise','MALE','0890293819','0890293819','ACTIVE'),('bd93114d-fff0-427e-88e1-6744a8e8d0a4','2026-01-16 01:37:11.631082','admin',NULL,'admin','1994-04-19 00:00:00.000000','dupoxumo@mailinator.com','Sonya Sears','Drew Rose','FEMALE','0890302931','0890302931','ACTIVE');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_class`
--

DROP TABLE IF EXISTS `student_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_class` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `joined_at` datetime(6) NOT NULL,
  `left_at` datetime(6) DEFAULT NULL,
  `status` enum('CHANGING','COMPLETED','DROPPED','STUDYING') NOT NULL,
  `class_id` varchar(255) NOT NULL,
  `student_id` varchar(255) NOT NULL,
  `shift_name` varchar(100) DEFAULT NULL,
  `class_shift_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKfyryxclt2okb0bxjfhct0pv5u` (`class_id`),
  KEY `FK2f81ovfviq7rv4jhpdr46dk3e` (`student_id`),
  KEY `FKq4obak37v3ovop0vtoeftub1v` (`class_shift_id`),
  CONSTRAINT `FK2f81ovfviq7rv4jhpdr46dk3e` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
  CONSTRAINT `FKfyryxclt2okb0bxjfhct0pv5u` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`),
  CONSTRAINT `FKq4obak37v3ovop0vtoeftub1v` FOREIGN KEY (`class_shift_id`) REFERENCES `class_shift` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_class`
--

LOCK TABLES `student_class` WRITE;
/*!40000 ALTER TABLE `student_class` DISABLE KEYS */;
INSERT INTO `student_class` VALUES (7,'2026-01-09 09:18:20.213973','admin','2026-01-09 09:18:20.232908','admin','2026-01-09 09:18:20.209909','2026-01-09 09:18:20.226480','CHANGING','99d973c2-e05f-4c1f-bf4b-d7a53f0f369e','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,NULL),(8,'2026-01-09 09:18:20.230224','admin','2026-01-13 02:07:26.664047','admin','2026-01-09 09:18:20.229669','2026-01-13 02:07:26.605977','CHANGING','99d973c2-e05f-4c1f-bf4b-d7a53f0f369e','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,NULL),(9,'2026-01-09 09:18:26.724175','admin','2026-01-09 09:18:26.728240','admin','2026-01-09 09:18:26.724175','2026-01-09 09:18:26.726219','CHANGING','99d973c2-e05f-4c1f-bf4b-d7a53f0f369e','0e7cdac9-f56f-4517-89f6-d5b24445d978',NULL,NULL),(10,'2026-01-09 09:18:26.726219','admin','2026-01-12 07:49:23.415131','admin','2025-01-09 09:18:26.726000','2026-01-12 07:49:23.330354','CHANGING','99d973c2-e05f-4c1f-bf4b-d7a53f0f369e','0e7cdac9-f56f-4517-89f6-d5b24445d978',NULL,NULL),(11,'2026-01-12 07:49:23.346633','admin','2026-01-12 07:51:33.247574','admin','2026-01-12 07:49:23.333354','2026-01-12 07:51:33.235497','CHANGING','41e76fb3-2e4d-4c7b-9e84-793cbcc495e0','0e7cdac9-f56f-4517-89f6-d5b24445d978',NULL,NULL),(12,'2026-01-12 07:51:33.238494','admin','2026-01-12 08:09:50.490888','admin','2026-01-12 07:51:33.237497','2026-01-12 08:09:50.471989','CHANGING','99d973c2-e05f-4c1f-bf4b-d7a53f0f369e','0e7cdac9-f56f-4517-89f6-d5b24445d978',NULL,NULL),(13,'2026-01-12 08:09:50.483580','admin','2026-01-13 02:08:26.678279','admin','2026-01-12 08:09:50.473989','2026-01-13 02:08:26.672267','CHANGING','41e76fb3-2e4d-4c7b-9e84-793cbcc495e0','0e7cdac9-f56f-4517-89f6-d5b24445d978',NULL,NULL),(14,'2026-01-13 02:07:26.619968','admin','2026-01-14 02:11:20.895866','admin','2026-01-13 02:07:26.607968','2026-01-14 02:11:20.871548','CHANGING','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,NULL),(15,'2026-01-13 02:08:26.673267','admin','2026-01-14 08:44:59.215576','admin','2026-01-13 02:08:26.673267','2026-01-14 08:44:59.121226','CHANGING','11851293-e352-4af9-b37f-af6f6f9ca826','0e7cdac9-f56f-4517-89f6-d5b24445d978',NULL,NULL),(16,'2026-01-14 02:11:20.876549','admin','2026-01-14 08:16:38.085107','admin','2026-01-14 02:11:20.873549','2026-01-14 08:16:38.057570','CHANGING','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,NULL),(17,'2026-01-14 08:16:38.063617','admin','2026-01-16 04:32:13.529166','admin','2026-01-14 08:16:38.058569','2026-01-16 04:32:13.515291','DROPPED','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,'3acd26bc-df19-46fc-8b80-d36e665ece36'),(18,'2026-01-14 08:44:59.138729','admin','2026-01-16 04:32:13.617320','admin','2026-01-14 08:44:59.123146','2026-01-16 04:32:13.617320','DROPPED','11851293-e352-4af9-b37f-af6f6f9ca826','0e7cdac9-f56f-4517-89f6-d5b24445d978',NULL,'3acd26bc-df19-46fc-8b80-d36e665ece36'),(19,'2026-01-16 01:37:11.697721','admin','2026-01-16 02:30:15.545959','admin','2026-01-16 01:37:11.695722',NULL,'STUDYING','11851293-e352-4af9-b37f-af6f6f9ca826','bd93114d-fff0-427e-88e1-6744a8e8d0a4',NULL,'3acd26bc-df19-46fc-8b80-d36e665ece36'),(20,'2026-01-16 04:33:06.031295','admin',NULL,'admin','2026-01-16 04:33:06.029296',NULL,'STUDYING','11851293-e352-4af9-b37f-af6f6f9ca826','1ee41494-97fc-424b-ad32-aa77757d0864',NULL,'3acd26bc-df19-46fc-8b80-d36e665ece36'),(21,'2026-01-16 04:33:13.343345','admin',NULL,'admin','2026-01-16 04:33:13.342348',NULL,'STUDYING','11851293-e352-4af9-b37f-af6f6f9ca826','0e7cdac9-f56f-4517-89f6-d5b24445d978',NULL,'3acd26bc-df19-46fc-8b80-d36e665ece36'),(22,'2026-01-16 07:53:05.401554','admin','2026-01-16 07:53:22.242358','admin','2026-01-16 07:53:05.396555','2026-01-16 07:53:22.233358','CHANGING','99d973c2-e05f-4c1f-bf4b-d7a53f0f369e','919dff2c-1a56-4bfa-9427-11756b5fce71',NULL,NULL),(23,'2026-01-16 07:53:22.238360','admin','2026-01-16 07:54:04.689155','admin','2026-01-16 07:53:22.235357',NULL,'STUDYING','11851293-e352-4af9-b37f-af6f6f9ca826','919dff2c-1a56-4bfa-9427-11756b5fce71',NULL,'3acd26bc-df19-46fc-8b80-d36e665ece36');
/*!40000 ALTER TABLE `student_class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `email` varchar(30) NOT NULL,
  `enabled` bit(1) NOT NULL,
  `full_name` varchar(45) NOT NULL,
  `id_card` varchar(45) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_number` varchar(30) NOT NULL,
  `status` enum('ACTIVE','BLOCKED','DELETED') DEFAULT NULL,
  `username` varchar(30) NOT NULL,
  `role_id` bigint DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  `dob` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`),
  UNIQUE KEY `UK1ep90ws9w518nst3415yen9dv` (`id_card`),
  UNIQUE KEY `UK4bgmpi98dylab6qdvf9xyaxu4` (`phone_number`),
  UNIQUE KEY `UKsb8bbouer5wak8vyiiy4pf2bx` (`username`),
  KEY `FKn82ha3ccdebhokx3a8fgdqeyy` (`role_id`),
  CONSTRAINT `FKn82ha3ccdebhokx3a8fgdqeyy` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('06a22a82-33be-4b1e-82e8-8d51a07defb3','2026-01-02 04:18:06.317713','2026-01-03 03:57:54.704832','','cu@gmail.com',_binary '','Nguyễn Văn Cừ','0987654213114','$2a$10$nGPO2xmLHUhMvd5LxdZJJ.bbgFixTJS0r8/hTRhxkIZb9.qYalDwG','0987654312','ACTIVE','0987654311',2,'admin','admin','FEMALE','2000-10-12 00:00:00.000000'),('4224e770-c62a-436a-a479-51a8d47f02ed','2025-12-29 14:57:04.000000','2025-12-29 14:57:23.000000',NULL,'pezoiks1@gmail.com',_binary '','Phạm Ngọc Viễn Đông','1','$2a$10$z4o38l8ezWrLfjGAEA0m1Or0lLQC.lclPNk8dCDwXmufa4lbjlmr.','1','ACTIVE','admin',1,'system',NULL,NULL,NULL),('5ca6c894-fa8c-42cf-9d09-6a30dca2eb86','2025-12-29 14:59:31.000000','2026-01-02 04:53:19.870728',NULL,'teacher1@gmail.com',_binary '','Nguyễn Gia Huy','0967282738192','$2a$10$z4o38l8ezWrLfjGAEA0m1Or0lLQC.lclPNk8dCDwXmufa4lbjlmr.','0813535314','ACTIVE','0813535314',2,'system','admin','MALE','2003-01-02 00:00:00.000000'),('f8f1de40-740f-423a-8ac0-abb7e9ba5cbf','2026-01-02 03:01:47.862929',NULL,'','dong@gmail.com',_binary '','Phạm Văn Đồng','0987654321123','$2a$10$09qQxlCqgjwCXZw433GSmOoVcIG7DCW1Ji/P4idaeH76edXEYF9zW','0987654321','ACTIVE','0987654321',2,'admin','admin','MALE','2002-07-10 00:00:00.000000');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-17 16:19:10
