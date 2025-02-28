import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { DataReplicationModule } from 'src/data-replication/data-replication.module';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Company, User, Role, UserRole, Permission, RolePermission], 'adminConn'),
    DataReplicationModule
  ],
  controllers: [CompanyController, UserController, RoleController, PermissionController],
  providers: [CompanyService, UserService, RoleService, PermissionService],
})
export class AdminModule {}
