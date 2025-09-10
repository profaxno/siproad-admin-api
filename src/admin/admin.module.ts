import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from './companies/entities/company.entity';
import { CompanyController } from './companies/company.controller';
import { CompanyService } from './companies/company.service';

import { User } from './users/entities/user.entity';
import { UserRole } from './users/entities/user-role.entity';
import { UserController } from './users/user.controller';
import { UserService } from './users/user.service';

import { Role } from './roles/entities/role.entity';
import { RolePermission } from './roles/entities/role-permission.entity';
import { Permission } from './roles/entities/permission.entity';
import { RoleController } from './roles/role.controller';
import { PermissionController } from './roles/permission.controller';
import { RoleService } from './roles/role.service';
import { PermissionService } from './roles/permission.service';

import { DataReplicationModule } from 'src/data-transfer/data-replication/data-replication.module';
import { DocumentType } from './settings/documentTypes/entities/document-type.entity';
import { DocumentTypeController } from './settings/documentTypes/document-type.controller';
import { DocumentTypeService } from './settings/documentTypes/document-type.service';
import { ProductUnit } from './settings/productUnits/entities/product-unit.entity';
import { ProductUnitController } from './settings/productUnits/product-unit.controller';
import { ProductUnitService } from './settings/productUnits/product-unit.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Company, User, UserRole, Role, RolePermission, Permission, DocumentType, ProductUnit], 'adminConn'),
    DataReplicationModule
  ],
  controllers: [CompanyController, UserController, RoleController, PermissionController, DocumentTypeController, ProductUnitController],
  providers: [CompanyService, UserService, RoleService, PermissionService, DocumentTypeService, ProductUnitService]
})
export class AdminModule {}
