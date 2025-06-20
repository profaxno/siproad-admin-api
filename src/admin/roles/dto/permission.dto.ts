import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class PermissionDto {
  
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(50)
  code: string;

  constructor(name: string, code:string, id?: string) {
    this.name = name;
    this.code = code;
    this.id = id;
  }
}
