import { Type } from "class-transformer";
import { IsArray, IsEmail, IsInt, IsOptional, IsPositive, IsString, IsUUID, MaxLength, Min, ValidateNested } from "class-validator";

export class UserDto {
  
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  companyId: string;

  @IsString()
  @MaxLength(50)
  name: string;

  @IsEmail()
  @MaxLength(50)
  email: string;;

  @IsString()
  @MaxLength(100)
  password: string;

  @IsInt()
  @Min(0)
  status: number;

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
  
  constructor(companyId: string, name: string, email: string, password: string, status: number, id?: string, roleList?: UserRoleDto[], permissionList?: UserPermissionDto[]) {
    this.companyId = companyId;
    this.name = name;
    this.email = email;
    this.password = password;
    this.status = status;
    this.id = id;
    this.roleList = roleList;
    this.permissionList = permissionList;
  }
}

export class UserRoleDto {
  @IsUUID()
  id: string;
  
  @IsString()
  @IsOptional()
  @MaxLength(50)
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
  @MaxLength(50)
  code: string
  
  constructor(id: string, code: string){
    this.id = id;
    this.code = code;
  }
}