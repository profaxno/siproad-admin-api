import { ProcessSummaryDto, SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, HttpCode, HttpStatus, Query, ParseUUIDPipe, ParseArrayPipe, NotFoundException } from '@nestjs/common';

import { CompanyDto, AdminResponseDto } from './dto';
import { CompanyService } from './company.service';
import { AlreadyExistException, IsBeingUsedException } from './exceptions/admin.exception';

@Controller('siproad-admin')
export class CompanyController {

  private readonly logger = new Logger(CompanyController.name);

  constructor(
    private readonly companyService: CompanyService
  ) {}

  @Post('/companies/updateBatch')
  @HttpCode(HttpStatus.OK)
  updateBatch(@Body() dtoList: CompanyDto[]): Promise<AdminResponseDto> {
    this.logger.log(`>>> updateBatch: listSize=${dtoList.length}`);
    const start = performance.now();

    return this.companyService.updateBatch(dtoList)
    .then( (processSummaryDto: ProcessSummaryDto) => {
      const response = new AdminResponseDto(HttpStatus.OK, "executed", undefined, processSummaryDto);
      const end = performance.now();
      this.logger.log(`<<< updateBatch: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(error.stack);
      return new AdminResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })

  }

  @Patch('/companies/update')
  @HttpCode(HttpStatus.OK)
  update(@Body() dto: CompanyDto): Promise<AdminResponseDto> {
    this.logger.log(`>>> update: dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    return this.companyService.update(dto)
    .then( (dto: CompanyDto) => {
      const response = new AdminResponseDto(HttpStatus.OK, 'executed', 1, [dto]);
      const end = performance.now();
      this.logger.log(`<<< update: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      if(error instanceof NotFoundException)
        return new AdminResponseDto(HttpStatus.NOT_FOUND, error.message, 0, []);

      if(error instanceof AlreadyExistException)
        return new AdminResponseDto(HttpStatus.BAD_REQUEST, error.message, 0, []);

      this.logger.error(error.stack);
      return new AdminResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  @Get('/companies')
  find(@Query() paginationDto: SearchPaginationDto, @Body() inputDto: SearchInputDto): Promise<AdminResponseDto> {
    this.logger.log(`>>> find: paginationDto=${JSON.stringify(paginationDto)}, inputDto=${JSON.stringify(inputDto)}`);
    const start = performance.now();
    
    return this.companyService.find(paginationDto, inputDto)
     .then( (dtoList: CompanyDto[]) => {
      const response = new AdminResponseDto(HttpStatus.OK, "executed", dtoList.length, dtoList);
      const end = performance.now();
      this.logger.log(`<<< find: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      if(error instanceof NotFoundException)
        return new AdminResponseDto(HttpStatus.NOT_FOUND, error.message, 0, []);

      this.logger.error(error.stack);
      return new AdminResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  @Get('/companies/:value')
  findOneByValue(@Param('value') value: string): Promise<AdminResponseDto> {
    this.logger.log(`>>> findOneByValue: value=${value}`);
    const start = performance.now();

    return this.companyService.findOneByValue(value)
    .then( (dtoList: CompanyDto[]) => {
      const response = new AdminResponseDto(HttpStatus.OK, "executed", dtoList.length, dtoList);
      const end = performance.now();
      this.logger.log(`<<< findOneByValue: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      if(error instanceof NotFoundException)
        return new AdminResponseDto(HttpStatus.NOT_FOUND, error.message, 0, []);

      this.logger.error(error.stack);
      return new AdminResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })

  }

  @Delete('companies/:id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<AdminResponseDto> {
    this.logger.log(`>>> remove: id=${id}`);
    const start = performance.now();

    return this.companyService.remove(id)
    .then( (msg: string) => {
      const response = new AdminResponseDto(HttpStatus.OK, msg);
      const end = performance.now();
      this.logger.log(`<<< remove: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      if(error instanceof NotFoundException)
        return new AdminResponseDto(HttpStatus.NOT_FOUND, error.message, 0, []);

      if(error instanceof IsBeingUsedException)
        return new AdminResponseDto(HttpStatus.BAD_REQUEST, error.message, 0, []);

      this.logger.error(error.stack);
      return new AdminResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })
  }

  @Post('/companies/synchronize')
  @HttpCode(HttpStatus.OK)
  synchronize(@Query() paginationDto: SearchPaginationDto): Promise<AdminResponseDto> {
    this.logger.log('>>> synchronize');
    const start = performance.now();

    paginationDto.page=1;

    return this.companyService.synchronize(paginationDto)
    .then( (msg: string) => {
      const response = new AdminResponseDto(HttpStatus.OK, msg);
      const end = performance.now();
      this.logger.log(`<<< synchronize: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      this.logger.error(error.stack);
      return new AdminResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })

  }
  
}
