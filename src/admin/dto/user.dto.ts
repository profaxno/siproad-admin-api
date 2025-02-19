import { IsBoolean, IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from "class-validator";

export class UserDto {
  
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  companyId: string;

  @IsString()
  @MaxLength(255)
  fullName: string;

  @IsEmail()
  @MaxLength(255)
  email: string;;

  @IsString()
  @MaxLength(20)
  password: string;

  constructor(companyId: string, fullName: string, email: string, password: string, id?: string) {
    this.companyId = companyId;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.id = id;
  }
}
