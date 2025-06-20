import { Type } from "class-transformer";
import { IsArray, IsEmail, IsInt, IsOptional, IsPositive, IsString, IsUUID, MaxLength, Min, ValidateNested } from "class-validator";

export class UserDto {
  
  @IsOptional()
  @IsUUID()
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserRoleDto)
  roleList?: UserRoleDto[];

  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => UserPermissionDto)
  permissionList?: UserPermissionDto[];
  
  company: UserCompanyDto;

  constructor(companyId: string, name: string, email: string, password: string, status: number, id?: string, roleList?: UserRoleDto[], permissionList?: UserPermissionDto[], company?: UserCompanyDto) {
    this.companyId = companyId;
    this.name = name;
    this.email = email;
    this.password = password;
    this.status = status;
    this.id = id;
    this.roleList = roleList;
    this.permissionList = permissionList;
    this.company = company;
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
  // @IsUUID()
  id: string;

  // @IsString()
  // @MaxLength(50)
  code: string
  
  constructor(id: string, code: string){
    this.id = id;
    this.code = code;
  }
}

export class UserCompanyDto {
  name      : string;
  fantasyName: string;
  idDoc?    : string;
  address?  : string;
  email?    : string;
  phone?    : string;
  bank? : bankDto;
  images?   : any[];
  
  constructor(name: string, fantasyName?: string, idDoc?: string, address?: string, email?: string, phone?: string, bank?: bankDto, images?: any[]){
    this.name = name;
    this.fantasyName = fantasyName;
    this.idDoc = idDoc;
    this.address = address;
    this.email = email;
    this.phone = phone;
    this.bank = bank;
    this.images = images;
  }

}

export class bankDto {
  name: string;
  accountType: string;
  accountNumber: string;
  
  constructor(name: string, accountType: string, accountNumber: string){
    this.name = name;
    this.accountType = accountType;
    this.accountNumber = accountNumber;
  }
}