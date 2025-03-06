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

  constructor(companyId: string, name: string, id?: string, permissionList?: RolePermissionDto[]) {
    this.companyId = companyId;
    this.name = name;
    this.id = id;
    this.permissionList = permissionList;
  }
}

export class RolePermissionDto {
  @IsUUID()
  id: string;
  
  @IsOptional()
  @IsString()
  label: string;

  constructor(id: string, label: string){
    this.id = id;
    this.label = label;
  }
}
