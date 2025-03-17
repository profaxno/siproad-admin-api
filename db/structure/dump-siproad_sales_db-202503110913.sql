-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: localhost    Database: siproad_sales_db
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
-- Table structure for table `sal_company`
--

DROP TABLE IF EXISTS `sal_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sal_company` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sal_company_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sal_order`
--

DROP TABLE IF EXISTS `sal_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sal_order` (
  `id` varchar(100) NOT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `discount` double NOT NULL DEFAULT 0,
  `discountPct` double NOT NULL DEFAULT 0,
  `status` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  `userId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sal_order_sal_company_FK` (`companyId`),
  KEY `sal_order_sal_user_FK` (`userId`),
  CONSTRAINT `sal_order_sal_company_FK` FOREIGN KEY (`companyId`) REFERENCES `sal_company` (`id`),
  CONSTRAINT `sal_order_sal_user_FK` FOREIGN KEY (`userId`) REFERENCES `sal_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sal_order_product`
--

DROP TABLE IF EXISTS `sal_order_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sal_order_product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `qty` double NOT NULL,
  `comment` varchar(100) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `cost` double NOT NULL,
  `price` double NOT NULL,
  `discount` double NOT NULL DEFAULT 0,
  `discountPct` double NOT NULL DEFAULT 0,
  `status` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `orderId` varchar(100) NOT NULL,
  `productId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sal_order_product_sal_order_FK` (`orderId`),
  KEY `sal_order_product_sal_product_FK` (`productId`),
  CONSTRAINT `sal_order_product_sal_order_FK` FOREIGN KEY (`orderId`) REFERENCES `sal_order` (`id`),
  CONSTRAINT `sal_order_product_sal_product_FK` FOREIGN KEY (`productId`) REFERENCES `sal_product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sal_product`
--

DROP TABLE IF EXISTS `sal_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sal_product` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `cost` double NOT NULL,
  `price` double NOT NULL,
  `imagenUrl` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  `productTypeId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sal_product_sal_company_FK` (`companyId`),
  KEY `sal_product_sal_product_type_FK` (`productTypeId`),
  CONSTRAINT `sal_product_sal_company_FK` FOREIGN KEY (`companyId`) REFERENCES `sal_company` (`id`),
  CONSTRAINT `sal_product_sal_product_type_FK` FOREIGN KEY (`productTypeId`) REFERENCES `sal_product_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sal_product_type`
--

DROP TABLE IF EXISTS `sal_product_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sal_product_type` (
  `id` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sal_product_type_unique` (`name`,`companyId`),
  KEY `sal_product_type_sal_company_FK` (`companyId`),
  CONSTRAINT `sal_product_type_sal_company_FK` FOREIGN KEY (`companyId`) REFERENCES `sal_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sal_user`
--

DROP TABLE IF EXISTS `sal_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sal_user` (
  `id` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(50) NOT NULL,
  `status` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `companyId` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sal_user_unique` (`email`,`companyId`),
  KEY `sal_user_sal_company_FK` (`companyId`),
  CONSTRAINT `sal_user_sal_company_FK` FOREIGN KEY (`companyId`) REFERENCES `sal_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'siproad_sales_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-11  9:13:41
