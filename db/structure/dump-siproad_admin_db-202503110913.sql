-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: localhost    Database: siproad_admin_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.11.11-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adm_company`
--

DROP TABLE IF EXISTS `adm_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_company` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adm_company_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adm_permission`
--

DROP TABLE IF EXISTS `adm_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_permission` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adm_permission_unique` (`name`),
  UNIQUE KEY `adm_permission_unique_1` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adm_role`
--

DROP TABLE IF EXISTS `adm_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_role` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adm_role_unique` (`name`,`companyId`),
  KEY `adm_role_adm_company_FK` (`companyId`),
  CONSTRAINT `adm_role_adm_company_FK` FOREIGN KEY (`companyId`) REFERENCES `adm_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adm_role_permission`
--

DROP TABLE IF EXISTS `adm_role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_role_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roleId` varchar(100) NOT NULL,
  `permissionId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adm_role_permission_adm_role_FK` (`roleId`),
  KEY `adm_role_permission_adm_permission_FK` (`permissionId`),
  CONSTRAINT `adm_role_permission_adm_permission_FK` FOREIGN KEY (`permissionId`) REFERENCES `adm_permission` (`id`),
  CONSTRAINT `adm_role_permission_adm_role_FK` FOREIGN KEY (`roleId`) REFERENCES `adm_role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adm_user`
--

DROP TABLE IF EXISTS `adm_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_user` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `status` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adm_user_unique` (`email`,`companyId`),
  KEY `adm_user_adm_company_FK` (`companyId`),
  CONSTRAINT `adm_user_adm_company_FK` FOREIGN KEY (`companyId`) REFERENCES `adm_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `adm_user_role`
--

DROP TABLE IF EXISTS `adm_user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adm_user_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(100) NOT NULL,
  `roleId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adm_user_role_adm_user_FK` (`userId`),
  KEY `adm_user_role_adm_role_FK` (`roleId`),
  CONSTRAINT `adm_user_role_adm_role_FK` FOREIGN KEY (`roleId`) REFERENCES `adm_role` (`id`),
  CONSTRAINT `adm_user_role_adm_user_FK` FOREIGN KEY (`userId`) REFERENCES `adm_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'siproad_admin_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-11  9:13:39
