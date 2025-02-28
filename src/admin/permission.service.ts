import { In, Like, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { ProcessSummaryDto, SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionDto } from './dto/permission.dto';
import { Permission } from './entities/permission.entity';
import { AlreadyExistException, IsBeingUsedException } from './exceptions/admin.exception';

@Injectable()
export class PermissionService {

  private readonly logger = new Logger(PermissionService.name);

  private dbDefaultLimit = 1000;

  constructor(
    private readonly ConfigService: ConfigService,

    @InjectRepository(Permission, 'adminConn')
    private readonly permissionRepository: Repository<Permission>
    
  ){
    this.dbDefaultLimit = this.ConfigService.get("dbDefaultLimit");
  }

  async updateBatch(dtoList: PermissionDto[]): Promise<ProcessSummaryDto>{
    this.logger.warn(`updateBatch: starting process... listSize=${dtoList.length}`);
    const start = performance.now();
    
    let processSummaryDto: ProcessSummaryDto = new ProcessSummaryDto(dtoList.length);
    let i = 0;
    for (const dto of dtoList) {
      
      await this.update(dto)
      .then( () => {
        processSummaryDto.rowsOK++;
        processSummaryDto.detailsRowsOK.push(`(${i++}) name=${dto.code}, message=OK`);
      })
      .catch(error => {
        processSummaryDto.rowsKO++;
        processSummaryDto.detailsRowsKO.push(`(${i++}) name=${dto.code}, error=${error}`);
      })

    }
    
    const end = performance.now();
    this.logger.log(`updateBatch: executed, runtime=${(end - start) / 1000} seconds`);
    return processSummaryDto;
  }

  update(dto: PermissionDto): Promise<PermissionDto> {
    if(!dto.id)
      return this.create(dto); // * create
    
    this.logger.warn(`update: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    const inputDto: SearchInputDto = new SearchInputDto(dto.id);
    
    return this.findByParams({}, inputDto)
    .then( (entityList: Permission[]) => {

      // * validate
      if(entityList.length == 0){
        const msg = `permission not found, id=${dto.id}`;
        this.logger.warn(`update: not executed (${msg})`);
        throw new NotFoundException(msg);
      }

      let entity = entityList[0];
      
      // * update
      entity.label = dto.label.toUpperCase();
      entity.code = dto.code.toUpperCase();
      
      return this.save(entity)
      .then( (entity: Permission) => {
        const dto = new PermissionDto(entity.label, entity.code, entity.id); // * map to dto

        const end = performance.now();
        this.logger.log(`update: executed, runtime=${(end - start) / 1000} seconds`);
        return dto;
      })
      
    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;
      
      this.logger.error(`update: error`, error);
      throw error;
    })

  }

  create(dto: PermissionDto): Promise<PermissionDto> {
    this.logger.warn(`create: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * find permission
    const inputDto: SearchInputDto = new SearchInputDto(undefined, [dto.code]);
    
    return this.findByParams({}, inputDto)
    .then( (entityList: Permission[]) => {

      // * validate
      if(entityList.length > 0){
        const msg = `permission already exists, code=${dto.code}`;
        this.logger.warn(`create: not executed (${msg})`);
        throw new AlreadyExistException(msg);
      }

      // * create
      let entity = new Permission();
      entity.label = dto.label.toUpperCase();
      entity.code = dto.code.toUpperCase();
      
      return this.save(entity)
      .then( (entity: Permission) => {
        const dto = new PermissionDto(entity.label, entity.code, entity.id); // * map to dto

        const end = performance.now();
        this.logger.log(`create: OK, runtime=${(end - start) / 1000} seconds`);
        return dto;
      })

    })
    .catch(error => {
      if(error instanceof AlreadyExistException)
        throw error;

      this.logger.error(`create: error`, error);
      throw error;
    })

  }

  find(paginationDto: SearchPaginationDto, inputDto: SearchInputDto): Promise<PermissionDto[]> {
    const start = performance.now();

    return this.findByParams(paginationDto, inputDto)
    .then( (entityList: Permission[]) => entityList.map( (entity: Permission) => new PermissionDto(entity.label, entity.code, entity.id) ) ) // * map entities to DTOs
    .then( (dtoList: PermissionDto[]) => {

      if(dtoList.length == 0){
        const msg = `permisions not found`;
        this.logger.warn(`find: ${msg}`);
        throw new NotFoundException(msg);
      }

      const end = performance.now();
      this.logger.log(`find: executed, runtime=${(end - start) / 1000} seconds`);
      return dtoList;
    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      this.logger.error(`find: error`, error);
      throw error;
    })

  }

  findOneByValue(value: string): Promise<PermissionDto[]> {
    const start = performance.now();

    const inputDto: SearchInputDto = new SearchInputDto(value);
    
    return this.findByParams({}, inputDto)
    .then( (entityList: Permission[]) => entityList.map( (entity: Permission) => new PermissionDto(entity.label, entity.code, entity.id) ) ) // * map entities to DTOs
    .then( (dtoList: PermissionDto[]) => {

      if(dtoList.length == 0){
        const msg = `permission not found, value=${value}`;
        this.logger.warn(`findOneByValue: ${msg}`);
        throw new NotFoundException(msg);
      }

      const end = performance.now();
      this.logger.log(`findOneByValue: executed, runtime=${(end - start) / 1000} seconds`);
      return dtoList;
    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      this.logger.error(`findOneByValue: error`, error);
      throw error;
    })
    
  }

  remove(id: string): Promise<string> {
    this.logger.log(`remove: starting process... id=${id}`);
    const start = performance.now();

    const inputDto: SearchInputDto = new SearchInputDto(id);
    
    return this.findByParams({}, inputDto)
    .then( (entityList: Permission[]) => {
      
      if(entityList.length == 0){
        const msg = `permission not found, id=${id}`;
        this.logger.warn(`remove: not executed (${msg})`);
        throw new NotFoundException(msg);
      }

      // * delete
      return this.permissionRepository.delete(id)
      .then( () => {
        
        const end = performance.now();
        this.logger.log(`remove: OK, runtime=${(end - start) / 1000} seconds`);
        return 'deleted';
      })

    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      if(error.errno == 1217) {
        const msg = 'permission is being used';
        this.logger.warn(`remove: not executed (${msg})`, error);
        throw new IsBeingUsedException(msg);
      }

      this.logger.error('remove: error', error);
      throw error;
    })

  }

  findByParams(paginationDto: SearchPaginationDto, inputDto: SearchInputDto): Promise<Permission[]> {
    const {page=1, limit=this.dbDefaultLimit} = paginationDto;

    // * search by partial name
    if(inputDto.search) {
      const whereByLike = { code: Like(`%${inputDto.search}%`), active: true };
      const whereById   =  { id: inputDto.search, active: true };
      const where = isUUID(inputDto.search) ? whereById : whereByLike;

      return this.permissionRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: where
      })
    }

    // * search by names
    if(inputDto.searchList) {
      return this.permissionRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          code: In(inputDto.searchList),
          active: true,
        },
      })
    }

    // * search all
    return this.permissionRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      where: { active: true }
    })
    
  }

  private save(entity: Permission): Promise<Permission> {
    const start = performance.now();

    const newEntity: Permission = this.permissionRepository.create(entity);

    return this.permissionRepository.save(newEntity)
    .then( (entity: Permission) => {
      const end = performance.now();
      this.logger.log(`save: OK, runtime=${(end - start) / 1000} seconds, entity=${JSON.stringify(entity)}`);
      return entity;
    })
  }

}
