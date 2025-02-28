import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from "class-validator";

export class RoleDto {
  
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  companyId: string;

  @IsString()
  @MaxLength(45)
  name: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  permissionList?: RolePermissionDto[];

  constructor(companyId: string, name: string, permissionList?: RolePermissionDto[], id?: string) {
    this.companyId = companyId;
    this.name = name;
    this.permissionList = permissionList;
    this.id = id;
  }
}

export class RolePermissionDto {
  @IsUUID()
  id: string;
  
  constructor(id: string){
    this.id = id;
  }
}
