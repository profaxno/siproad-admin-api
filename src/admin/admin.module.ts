import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

import { UserController } from './user.controller';
import { UserService } from './user.service';

import { RoleController } from './role.controller';
import { RoleService } from './role.service';

import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

import { Company, User, UserRole, Role, RolePermission, Permission } from './entities'

import { DataReplicationModule } from 'src/data-transfer/data-replication/data-replication.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Company, User, UserRole, Role, RolePermission, Permission], 'adminConn'),
    DataReplicationModule
  ],
  controllers: [CompanyController, UserController, RoleController, PermissionController],
  providers: [CompanyService, UserService, RoleService, PermissionService],
})
export class AdminModule {}
