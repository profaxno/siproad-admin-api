import { Type } from "class-transformer";
import { IsArray, IsEmail, IsInt, IsOptional, IsPositive, IsString, IsUUID, MaxLength, ValidateNested } from "class-validator";

export class UserDto {
  
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  companyId: string;

  @IsString()
  @MaxLength(90)
  name: string;

  @IsEmail()
  @MaxLength(45)
  email: string;;

  @IsString()
  @MaxLength(255)
  password: string;

  @IsInt()
  @IsOptional()
  @IsPositive()
  status?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserRoleDto)
  roleList?: UserRoleDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionDto)
  permissionList?: UserPermissionDto[];
  
  constructor(companyId: string, name: string, email: string, password: string, id?: string, status?: number, roleList?: UserRoleDto[], permissionList?: UserPermissionDto[]) {
    this.companyId = companyId;
    this.name = name;
    this.email = email;
    this.password = password;
    this.id = id;
    this.status = status;
    this.roleList = roleList;
    this.permissionList = permissionList;
  }
}

export class UserRoleDto {
  @IsUUID()
  id: string;
  
  @IsString()
  @IsOptional()
  name: string;
  
  constructor(id: string, name?: string){
    this.id = id;
    this.name = name;
  }
}

export class UserPermissionDto {
  @IsUUID()
  id: string;

  @IsString()
  code: string
  
  constructor(id: string, code: string){
    this.id = id;
    this.code = code;
  }
}