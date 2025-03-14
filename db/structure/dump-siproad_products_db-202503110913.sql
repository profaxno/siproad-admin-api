-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: localhost    Database: siproad_products_db
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
-- Table structure for table `pro_company`
--

DROP TABLE IF EXISTS `pro_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_company` (
  `id` varchar(100) NOT NULL,
  `name` varchar(45) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pro_company_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pro_element`
--

DROP TABLE IF EXISTS `pro_element`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_element` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `cost` double NOT NULL,
  `stock` double NOT NULL,
  `unit` varchar(5) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  `elementTypeId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pro_element_unique` (`name`,`companyId`),
  KEY `FK_64591be904bde3413a12301ba25` (`companyId`),
  KEY `pro_element_pro_element_type_FK` (`elementTypeId`),
  CONSTRAINT `pro_element_pro_company_FK` FOREIGN KEY (`companyId`) REFERENCES `pro_company` (`id`),
  CONSTRAINT `pro_element_pro_element_type_FK` FOREIGN KEY (`elementTypeId`) REFERENCES `pro_element_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pro_element_type`
--

DROP TABLE IF EXISTS `pro_element_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_element_type` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pro_element_type_unique` (`name`,`companyId`),
  KEY `pro_element_type_pro_company_FK` (`companyId`),
  CONSTRAINT `pro_element_type_pro_company_FK` FOREIGN KEY (`companyId`) REFERENCES `pro_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pro_formula`
--

DROP TABLE IF EXISTS `pro_formula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_formula` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `cost` double NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pro_formula_unique` (`name`,`companyId`),
  KEY `FK_1a5524084bbac528d986b897056` (`companyId`),
  CONSTRAINT `pro_formula_pro_company_FK` FOREIGN KEY (`companyId`) REFERENCES `pro_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pro_formula_element`
--

DROP TABLE IF EXISTS `pro_formula_element`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_formula_element` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `qty` double NOT NULL,
  `formulaId` varchar(100) NOT NULL,
  `elementId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_0a9409b9bcbca55643b7abb64d4` (`elementId`),
  KEY `FK_e92cac22363abf222ae124c8dcf` (`formulaId`),
  CONSTRAINT `pro_formula_element_pro_element_FK` FOREIGN KEY (`elementId`) REFERENCES `pro_element` (`id`),
  CONSTRAINT `pro_formula_element_pro_formula_FK` FOREIGN KEY (`formulaId`) REFERENCES `pro_formula` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pro_product`
--

DROP TABLE IF EXISTS `pro_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_product` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `cost` double NOT NULL,
  `price` double NOT NULL,
  `imagenUrl` varchar(255) DEFAULT NULL,
  `hasFormula` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  `productTypeId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pro_product_unique` (`name`,`active`),
  KEY `FK_a6e1f609d9478c6b799bdad4647` (`companyId`),
  KEY `pro_product_pro_product_type_FK` (`productTypeId`),
  CONSTRAINT `pro_product_pro_company_FK` FOREIGN KEY (`companyId`) REFERENCES `pro_company` (`id`),
  CONSTRAINT `pro_product_pro_product_type_FK` FOREIGN KEY (`productTypeId`) REFERENCES `pro_product_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pro_product_element`
--

DROP TABLE IF EXISTS `pro_product_element`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_product_element` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `qty` double NOT NULL,
  `productId` varchar(100) NOT NULL,
  `elementId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_1a2b6f84365298ba08b1f07c787` (`elementId`),
  KEY `FK_33b685b83b4110c470947ef1179` (`productId`),
  CONSTRAINT `pro_product_element_pro_element_FK` FOREIGN KEY (`elementId`) REFERENCES `pro_element` (`id`),
  CONSTRAINT `pro_product_element_pro_product_FK` FOREIGN KEY (`productId`) REFERENCES `pro_product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pro_product_formula`
--

DROP TABLE IF EXISTS `pro_product_formula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_product_formula` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `qty` double NOT NULL,
  `productId` varchar(100) NOT NULL,
  `formulaId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_4d7ca904d81227400f5e9f9556b` (`productId`),
  KEY `FK_d6d9cfeb9aa78e23e655d3cf515` (`formulaId`),
  CONSTRAINT `pro_product_formula_pro_formula_FK` FOREIGN KEY (`formulaId`) REFERENCES `pro_formula` (`id`),
  CONSTRAINT `pro_product_formula_pro_product_FK` FOREIGN KEY (`productId`) REFERENCES `pro_product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pro_product_type`
--

DROP TABLE IF EXISTS `pro_product_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pro_product_type` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pro_product_type_unique` (`name`,`companyId`),
  KEY `pro_product_type_pro_company_FK` (`companyId`),
  CONSTRAINT `pro_product_type_pro_company_FK` FOREIGN KEY (`companyId`) REFERENCES `pro_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'siproad_products_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-11  9:13:40
