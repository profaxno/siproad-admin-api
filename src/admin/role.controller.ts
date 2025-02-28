import { ProcessSummaryDto, SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, HttpCode, HttpStatus, Query, ParseUUIDPipe, ParseArrayPipe, NotFoundException } from '@nestjs/common';

import { RoleDto } from './dto/role.dto';
import { AdminResponseDto } from './dto/admin-response-dto';
import { RoleService } from './role.service';
import { AlreadyExistException, IsBeingUsedException } from './exceptions/admin.exception';


@Controller('siproad-admin')
export class RoleController {

  private readonly logger = new Logger(RoleController.name);

  constructor(
    private readonly roleService: RoleService
  ) {}

  @Post('/roles/updateBatch')
  @HttpCode(HttpStatus.OK)
  updateBatch(@Body() dtoList: RoleDto[]): Promise<AdminResponseDto> {
    this.logger.log(`>>> updateBatch: listSize=${dtoList.length}`);
    const start = performance.now();

    return this.roleService.updateBatch(dtoList)
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

  @Patch('/roles/update')
  @HttpCode(HttpStatus.OK)
  update(@Body() dto: RoleDto): Promise<AdminResponseDto> {
    this.logger.log(`>>> update: dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    return this.roleService.update(dto)
    .then( (dto: RoleDto) => {
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

  @Get('/roles/:companyId')
  find(@Param('companyId', ParseUUIDPipe) companyId: string, @Query() paginationDto: SearchPaginationDto, @Body() inputDto: SearchInputDto): Promise<AdminResponseDto> {
    this.logger.log(`>>> find: companyId=${companyId}, paginationDto=${JSON.stringify(paginationDto)}, inputDto=${JSON.stringify(inputDto)}`);
    const start = performance.now();
    
    return this.roleService.find(companyId, paginationDto, inputDto)
    .then( (dtoList: RoleDto[]) => {
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

  @Get('/roles/:companyId/:value')
  findOneByValue(@Param('companyId', ParseUUIDPipe) companyId: string, @Param('value') value: string): Promise<AdminResponseDto> {
    this.logger.log(`>>> findOneByValue: companyId=${companyId}, value=${value}`);
    const start = performance.now();

    return this.roleService.findOneByValue(companyId, value)
    .then( (dtoList: RoleDto[]) => {
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

  @Delete('roles/:id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<AdminResponseDto> {
    this.logger.log(`>>> remove: id=${id}`);
    const start = performance.now();

    return this.roleService.remove(id)
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
  
}
