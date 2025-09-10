import { IsArray, IsOptional, IsString } from "class-validator";

export class RoleSearchInputDto {
  
  @IsOptional()
  @IsString()
  name?: string;
  
  constructor(name?: string) {
    this.name = name;
  }

}