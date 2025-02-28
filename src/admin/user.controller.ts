import { ProcessSummaryDto, SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, HttpCode, HttpStatus, Query, ParseUUIDPipe, ParseArrayPipe, NotFoundException } from '@nestjs/common';

import { UserDto, AdminResponseDto } from './dto';
import { UserService } from './user.service';
import { AlreadyExistException, IsBeingUsedException } from './exceptions/admin.exception';


@Controller('siproad-admin')
export class UserController {

  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService
  ) {}

  @Post('/users/updateBatch')
  @HttpCode(HttpStatus.OK)
  updateBatch(@Body() dtoList: UserDto[]): Promise<AdminResponseDto> {
    this.logger.log(`>>> updateBatch: listSize=${dtoList.length}`);
    const start = performance.now();

    return this.userService.updateBatch(dtoList)
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

  @Patch('/users/update')
  @HttpCode(HttpStatus.OK)
  update(@Body() dto: UserDto): Promise<AdminResponseDto> {
    this.logger.log(`>>> update: dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    return this.userService.update(dto)
    .then( (dto: UserDto) => {
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

  @Get('/users/:companyId')
  find(@Param('companyId', ParseUUIDPipe) companyId: string, @Query() paginationDto: SearchPaginationDto, @Body() inputDto: SearchInputDto): Promise<AdminResponseDto> {
    this.logger.log(`>>> find: companyId=${companyId}, paginationDto=${JSON.stringify(paginationDto)}, inputDto=${JSON.stringify(inputDto)}`);
    const start = performance.now();
    
    return this.userService.find(companyId, paginationDto, inputDto)
    .then( (dtoList: UserDto[]) => {
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

  @Get('/users/:companyId/:value')
  findOneByValue(@Param('companyId', ParseUUIDPipe) companyId: string, @Param('value') value: string): Promise<AdminResponseDto> {
    this.logger.log(`>>> findOneByValue: companyId=${companyId}, value=${value}`);
    const start = performance.now();

    return this.userService.findOneByValue(companyId, value)
    .then( (dtoList: UserDto[]) => {
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

  @Delete('users/:id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<AdminResponseDto> {
    this.logger.log(`>>> remove: id=${id}`);
    const start = performance.now();

    return this.userService.remove(id)
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

  @Post('/users/email/:email')
  findOneByEmail(@Param('email') email: string): Promise<AdminResponseDto> {
    this.logger.log(`>>> findOneByEmail: email=${email}`);
    const start = performance.now();

    return this.userService.findOneByEmail(email)
    .then( (dtoList: UserDto[]) => {
      const response = new AdminResponseDto(HttpStatus.OK, "executed", dtoList.length, dtoList);
      const end = performance.now();
      this.logger.log(`<<< findOneByEmail: executed, runtime=${(end - start) / 1000} seconds, response=${JSON.stringify(response)}`);
      return response;
    })
    .catch( (error: Error) => {
      if(error instanceof NotFoundException)
        return new AdminResponseDto(HttpStatus.NOT_FOUND, error.message, 0, []);

      this.logger.error(error.stack);
      return new AdminResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    })

  }
  
}
