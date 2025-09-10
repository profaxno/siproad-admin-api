import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CompanyDto {
  
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imgUrlHeader?: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imgUrlFooter?: string;

  constructor(name: string, id?: string, imgUrlHeader?: string, imgUrlFooter?: string) {
    this.name = name;
    this.id = id;
    this.imgUrlHeader = imgUrlHeader;
    this.imgUrlFooter = imgUrlFooter;
  }
}
