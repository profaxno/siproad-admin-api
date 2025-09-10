import { IsArray, IsOptional, IsString } from "class-validator";

export class CompanySearchInputDto {
  
  @IsOptional()
  @IsString()
  name?: string;
  
  constructor(name?: string) {
    this.name = name;
  }

}