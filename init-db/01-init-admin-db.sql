-- init db
CREATE DATABASE IF NOT EXISTS siproad_admin_db;

-- CREATE USER 'siproad_user'@'%' IDENTIFIED BY 'siproad123.';

-- GRANT ALL PRIVILEGES ON siproad_admin_db.* TO 'siproad_user'@'%';

-- FLUSH PRIVILEGES;

-- create tables
USE siproad_admin_db;

CREATE TABLE `adm_company` (
  `id` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `fantasyName` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idDoc` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bankName` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bankAccountType` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bankAccountNumber` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `imgUrlLogo` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `imgUrlHeader` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `imgUrlFooter` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `imgUrlTransferData` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `adm_company_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `adm_permission` (
  `id` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `adm_permission_unique` (`name`),
  UNIQUE KEY `adm_permission_unique_1` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `adm_role` (
  `id` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint unsigned NOT NULL DEFAULT '1',
  `companyId` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adm_role_unique` (`name`,`companyId`),
  KEY `adm_role_adm_company_FK` (`companyId`),
  CONSTRAINT `adm_role_adm_company_FK` FOREIGN KEY (`companyId`) REFERENCES `adm_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `adm_role_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roleId` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `permissionId` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adm_role_permission_adm_role_FK` (`roleId`),
  KEY `adm_role_permission_adm_permission_FK` (`permissionId`),
  CONSTRAINT `adm_role_permission_adm_permission_FK` FOREIGN KEY (`permissionId`) REFERENCES `adm_permission` (`id`),
  CONSTRAINT `adm_role_permission_adm_role_FK` FOREIGN KEY (`roleId`) REFERENCES `adm_role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `adm_setting_document_type` (
  `id` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `active` tinyint unsigned NOT NULL DEFAULT '1',
  `companyId` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adm_document_type_unique` (`name`),
  KEY `adm_document_type_adm_company_FK` (`companyId`),
  CONSTRAINT `adm_document_type_adm_company_FK` FOREIGN KEY (`companyId`) REFERENCES `adm_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `adm_setting_product_unit` (
  `id` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `active` tinyint unsigned NOT NULL DEFAULT '1',
  `companyId` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adm_setting_product_unit_adm_company_FK` (`companyId`),
  CONSTRAINT `adm_setting_product_unit_adm_company_FK` FOREIGN KEY (`companyId`) REFERENCES `adm_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `adm_user` (
  `id` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint unsigned NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint unsigned NOT NULL DEFAULT '1',
  `companyId` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adm_user_unique` (`email`,`companyId`),
  KEY `adm_user_adm_company_FK` (`companyId`),
  CONSTRAINT `adm_user_adm_company_FK` FOREIGN KEY (`companyId`) REFERENCES `adm_company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `adm_user_role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `roleId` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adm_user_role_adm_user_FK` (`userId`),
  KEY `adm_user_role_adm_role_FK` (`roleId`),
  CONSTRAINT `adm_user_role_adm_role_FK` FOREIGN KEY (`roleId`) REFERENCES `adm_role` (`id`),
  CONSTRAINT `adm_user_role_adm_user_FK` FOREIGN KEY (`userId`) REFERENCES `adm_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- seed data
INSERT INTO `adm_company` (`id`,`name`,`fantasyName`,`idDoc`,`address`,`email`,`phone`,`bankName`,`bankAccountType`,`bankAccountNumber`,`imgUrlLogo`,`imgUrlHeader`,`imgUrlFooter`,`imgUrlTransferData`,`createdAt`,`updatedAt`,`active`) VALUES ('7ffbc5ea-9ecd-4531-bc25-b6bd8dfabbeb','PROFAXNO CO','**********',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-04-03 01:08:08','2025-04-03 01:08:08',1);

INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('3dcf92f6-d3d1-4caa-8209-4bb7e5e1f8b9','SIPROAD-ADMINISTRAR','SIPROAD:ALL:MANAGE','2025-04-18 15:23:23','2025-04-18 15:23:23',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('4bd18128-6859-44bd-9d63-92d8f0328c7d','(ADMIN SERVICE) LOGIN','ADMIN:AUTH:LOGIN','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('eb397feb-1fa5-4f78-a1db-9f181dba9d9f','(ADMIN SERVICE) CONSULTAR COMPAÑIAS','ADMIN:COMPANY:READ','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('b98a150f-1d1e-4a74-8012-323a96c4bb6c','(ADMIN SERVICE) CONSULTAR USUARIOS','ADMIN:USER:READ','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('c3d9715f-174c-4b72-8b5d-1874cb782226','(ADMIN SERVICE) CONSULTAR ROLES','ADMIN:ROLE:READ','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('49ad9dab-b03e-4724-8437-cb2729d0570f','(ADMIN SERVICE) EDITAR COMPAÑIAS','ADMIN:COMPANY:WRITE','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('d92bfc5f-c82f-4676-baad-ebfcd48cf889','(ADMIN SERVICE) EDITAR USUARIOS','ADMIN:USER:WRITE','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('8f8663b8-c28b-477b-9f37-cf269a5bb886','(ADMIN SERVICE) EDITAR ROLES','ADMIN:ROLE:WRITE','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('a7b479a6-a16a-4f43-8c99-dfb342fa27af','(PRODUCTS SERVICE) CONFIGURAR MODULO','PRODUCTS:ADMIN:SETUP','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('4e712f62-a339-4c2b-9537-75e56309c0ba','(PRODUCTS SERVICE) CONSULTAR ELEMENTOS','PRODUCTS:ELEMENT:READ','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('7be4f1fa-69ef-41e1-82cd-f334413a8da5','(PRODUCTS SERVICE) CONSULTAR PRODUCTOS','PRODUCTS:PRODUCT:READ','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('3a5e39be-9c8e-4bdc-be39-d9cbbb5d20cc','(PRODUCTS SERVICE) EDITAR ELEMENTOS','PRODUCTS:ELEMENT:WRITE','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('74a2bce7-83e7-44f9-af29-db774bfd87b4','(PRODUCTS SERVICE) EDITAR PRODUCTOS','PRODUCTS:PRODUCT:WRITE','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('52dac430-0d44-4d0a-9c1f-0eb4c91afd8a','(PURCHASES SERVICE) CONFIGURAR MODULO','PURCHASES:ADMIN:SETUP','2025-05-30 01:45:50','2025-05-30 01:45:50',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('cb278233-03ce-41d2-a7a7-fe959af5d511','(PURCHASES SERVICE) CONSULTAR COMPRAS','PURCHASES:ORDER:READ','2025-05-30 01:45:51','2025-05-30 01:45:51',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('c0fc93ad-f509-4991-98a6-32881f85d77a','(PURCHASES SERVICE) EDITAR COMPRAS','PURCHASES:ORDER:WRITE','2025-05-30 01:45:51','2025-05-30 01:45:51',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('fac4ba1f-b27b-428c-93bf-61d64e1cffc1','(SALES SERVICE) CONFIGURAR MODULO','SALES:ADMIN:SETUP','2025-04-02 22:07:32','2025-04-02 22:07:32',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('c09e22c6-4a3d-42cd-a7c9-afa45bc6d775','(SALES SERVICE) CONSULTAR VENTAS','SALES:ORDER:READ','2025-04-02 22:07:32','2025-05-30 01:45:50',1);
INSERT INTO `adm_permission` (`id`,`name`,`code`,`createdAt`,`updatedAt`,`active`) VALUES ('4b3e0a64-4a76-4618-b77e-b2272131742b','(SALES SERVICE) EDITAR VENTAS','SALES:ORDER:WRITE','2025-04-02 22:07:32','2025-05-30 01:47:34',1);

INSERT INTO `adm_role` (`id`,`name`,`createdAt`,`updatedAt`,`active`,`companyId`) VALUES ('5f5d04ed-c76d-4d10-a55a-76372ea8a04c','ADMIN-SIPROAD','2025-04-18 16:28:46','2025-04-18 16:29:41',1,'7ffbc5ea-9ecd-4531-bc25-b6bd8dfabbeb');

INSERT INTO `adm_role_permission` (`id`,`roleId`,`permissionId`) VALUES (1,'5f5d04ed-c76d-4d10-a55a-76372ea8a04c','3dcf92f6-d3d1-4caa-8209-4bb7e5e1f8b9');

INSERT INTO `adm_setting_document_type` (`id`,`name`,`active`,`companyId`) VALUES ('120ed3cb-85e5-40f6-a90e-c29e13922f1f','FACTURA',1,'7ffbc5ea-9ecd-4531-bc25-b6bd8dfabbeb');
INSERT INTO `adm_setting_document_type` (`id`,`name`,`active`,`companyId`) VALUES ('4f178ad3-cc91-4737-a409-f9c24bde9e68','BOLETA',1,'7ffbc5ea-9ecd-4531-bc25-b6bd8dfabbeb');

INSERT INTO `adm_setting_product_unit` (`id`,`name`,`active`,`companyId`) VALUES ('01c13a4f-44e5-45b1-a80e-39f224b93d87','KG',1,'7ffbc5ea-9ecd-4531-bc25-b6bd8dfabbeb');
INSERT INTO `adm_setting_product_unit` (`id`,`name`,`active`,`companyId`) VALUES ('125838ac-852c-45b0-ae3c-7fa93757a40c','UN',1,'7ffbc5ea-9ecd-4531-bc25-b6bd8dfabbeb');

INSERT INTO `adm_user` (`id`,`name`,`email`,`password`,`status`,`createdAt`,`updatedAt`,`active`,`companyId`) VALUES ('0b98ed5d-48fb-4fd1-8bcb-8e8630962ea0','PROFAXNO','PROFAXNO@HOTMAIL.COM','$2b$10$DnG26ciIscG/uS6iyUbk8.iO7SS8OgDxrsDAYQZ00tYrQTRKUNVEu',1,'2025-04-03 01:11:17','2025-04-18 16:55:28',1,'7ffbc5ea-9ecd-4531-bc25-b6bd8dfabbeb');

INSERT INTO `adm_user_role` (`id`,`userId`,`roleId`) VALUES (1,'0b98ed5d-48fb-4fd1-8bcb-8e8630962ea0','5f5d04ed-c76d-4d10-a55a-76372ea8a04c');