import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class PermissionDto {
  
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @MaxLength(45)
  label: string;

  @IsString()
  @MaxLength(45)
  code: string;

  constructor(label: string, code:string, id?: string) {
    this.label = label;
    this.code = code;
    this.id = id;
  }
}
