import { In, Like, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { ProcessSummaryDto, SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { CompanyDto } from './dto/company.dto';
import { Company } from './entities/company.entity';
import { AlreadyExistException, IsBeingUsedException } from '../common/exceptions/common.exception';

import { ProcessEnum, SourceEnum } from 'src/data-replication/enum';
import { MessageDto, DataReplicationDto } from 'src/data-replication/dto/data-replication.dto';
import { DataReplicationService } from 'src/data-replication/data-replication.service';
import { JsonBasic } from 'src/data-replication/interfaces/json-basic.interface';


@Injectable()
export class CompanyService {

  private readonly logger = new Logger(CompanyService.name);

  private dbDefaultLimit = 1000;

  constructor(
    private readonly ConfigService: ConfigService,

    @InjectRepository(Company, 'adminConn')
    private readonly companyRepository: Repository<Company>,

    private readonly replicationService: DataReplicationService
    
  ){
    this.dbDefaultLimit = this.ConfigService.get("dbDefaultLimit");
  }
  
  async updateBatch(dtoList: CompanyDto[]): Promise<ProcessSummaryDto>{
    this.logger.warn(`updateBatch: starting process... listSize=${dtoList.length}`);
    const start = performance.now();
    
    let processSummaryDto: ProcessSummaryDto = new ProcessSummaryDto(dtoList.length);
    let i = 0;
    for (const dto of dtoList) {
      
      await this.update(dto)
      .then( () => {
        processSummaryDto.rowsOK++;
        processSummaryDto.detailsRowsOK.push(`(${i++}) name=${dto.name}, message=OK`);
      })
      .catch(error => {
        processSummaryDto.rowsKO++;
        processSummaryDto.detailsRowsKO.push(`(${i++}) name=${dto.name}, error=${error}`);
      })

    }
    
    const end = performance.now();
    this.logger.log(`updateBatch: executed, runtime=${(end - start) / 1000} seconds`);
    return processSummaryDto;
  }

  update(dto: CompanyDto): Promise<CompanyDto> {
    if(!dto.id)
      return this.create(dto); // * create
    
    this.logger.warn(`update: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    const inputDto: SearchInputDto = new SearchInputDto(dto.id);
    
    return this.findByParams({}, inputDto)
    .then( (entityList: Company[]) => {

      // * validate
      if(entityList.length == 0){
        const msg = `company not found, id=${dto.id}`;
        this.logger.warn(`update: not executed (${msg})`);
        throw new NotFoundException(msg);
      }

      let entity = entityList[0];
      
      // * update
      entity.name = dto.name.toUpperCase();
      
      return this.save(entity)
      .then( (entity: Company) => {
        dto = new CompanyDto(entity.name, entity.id); // * map to dto

        // * replication data
        const messageDto = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.COMPANY_UPDATE, JSON.stringify(dto));
        const dataReplicationDto: DataReplicationDto = new DataReplicationDto([messageDto]);
        this.replicationService.sendMessages(dataReplicationDto);

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

  create(dto: CompanyDto): Promise<CompanyDto> {
    this.logger.warn(`create: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * find company
    const inputDto: SearchInputDto = new SearchInputDto(undefined, [dto.name]);
    
    return this.findByParams({}, inputDto)
    .then( (entityList: Company[]) => {

      // * validate
      if(entityList.length > 0){
        const msg = `company already exists, name=${dto.name}`;
        this.logger.warn(`create: not executed (${msg})`);
        throw new AlreadyExistException(msg);
      }

      // * create
      let entity = new Company();
      entity.name = dto.name.toUpperCase();
      
      return this.save(entity)
      .then( (entity: Company) => {
        dto = new CompanyDto(entity.name, entity.id); // * map to dto

        // * replication data
        const messageDto = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.COMPANY_UPDATE, JSON.stringify(dto));
        const dataReplicationDto: DataReplicationDto = new DataReplicationDto([messageDto]);
        this.replicationService.sendMessages(dataReplicationDto);

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

  find(paginationDto: SearchPaginationDto, inputDto: SearchInputDto): Promise<CompanyDto[]> {
    const start = performance.now();

    return this.findByParams(paginationDto, inputDto)
    .then( (entityList: Company[]) => entityList.map( (entity: Company) => new CompanyDto(entity.name, entity.id) ) ) // * map entities to DTOs
    .then( (dtoList: CompanyDto[]) => {

      if(dtoList.length == 0){
        const msg = `companies not found`;
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

  findOneById(id: string): Promise<CompanyDto[]> {
    const start = performance.now();

    const inputDto: SearchInputDto = new SearchInputDto(id);
    
    return this.findByParams({}, inputDto)
    .then( (entityList: Company[]) => entityList.map( (entity: Company) => new CompanyDto(entity.name, entity.id) ) ) // * map entities to DTOs
    .then( (dtoList: CompanyDto[]) => {

      if(dtoList.length == 0){
        const msg = `company not found, id=${id}`;
        this.logger.warn(`findOneById: ${msg}`);
        throw new NotFoundException(msg);
      }

      const end = performance.now();
      this.logger.log(`findOneById: executed, runtime=${(end - start) / 1000} seconds`);
      return dtoList;
    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      this.logger.error(`findOneById: error`, error);
      throw error;
    })
    
  }

  remove(id: string): Promise<string> {
    this.logger.log(`remove: starting process... id=${id}`);
    const start = performance.now();

    const inputDto: SearchInputDto = new SearchInputDto(id);
    
    return this.findByParams({}, inputDto)
    .then( (entityList: Company[]) => {
      
      if(entityList.length == 0){
        const msg = `company not found, id=${id}`;
        this.logger.warn(`remove: not executed (${msg})`);
        throw new NotFoundException(msg);
      }

      // * delete: update field active
      const entity = entityList[0];
      entity.active = false;

      return this.save(entity)
      .then( (entity: Company) => {

        // * replication data
        const jsonBasic: JsonBasic = { id: entity.id }
        const messageDto = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.COMPANY_DELETE, JSON.stringify(jsonBasic));
        const dataReplicationDto: DataReplicationDto = new DataReplicationDto([messageDto]);
        this.replicationService.sendMessages(dataReplicationDto);

        const end = performance.now();
        this.logger.log(`remove: OK, runtime=${(end - start) / 1000} seconds`);
        return 'deleted';
      })

      // return this.companyRepository.delete(id)
      // .then( () => {

      //   // * replication data
      //   const entity = entityList[0];
      //   const dto = new CompanyDto(entity.name, entity.id); // * map to dto
      //   const messageDto = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.COMPANY_DELETE, JSON.stringify(dto));
      //   const dataReplicationDto: DataReplicationDto = new DataReplicationDto([messageDto]);
      //   this.replicationService.sendMessages(dataReplicationDto);

      //   const end = performance.now();
      //   this.logger.log(`remove: OK, runtime=${(end - start) / 1000} seconds`);
      //   return 'deleted';
      // })

    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      if(error.errno == 1217) {
        const msg = 'company is being used';
        this.logger.warn(`remove: not executed (${msg})`, error);
        throw new IsBeingUsedException(msg);
      }

      this.logger.error('remove: error', error);
      throw error;
    })

  }

  findByParams(paginationDto: SearchPaginationDto, inputDto: SearchInputDto): Promise<Company[]> {
    const {page=1, limit=this.dbDefaultLimit} = paginationDto;

    // * search by id or partial value
    const value = inputDto.search;
    if(value) {
      const whereById   = { id: value, active: true };
      const whereByLike = { name: Like(`%${value}%`), active: true };
      const where       = isUUID(value) ? whereById : whereByLike;

      return this.companyRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: where
      })
    }

    // * search by value list
    if(inputDto.searchList) {
      return this.companyRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          name: In(inputDto.searchList),
          active: true,
        },
      })
    }

    // * search all
    return this.companyRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      where: { active: true }
    })
    
  }

  synchronize(paginationDto: SearchPaginationDto): Promise<string> {
    this.logger.warn(`synchronize: processing paginationDto=${JSON.stringify(paginationDto)}`);

    return this.findAll(paginationDto)
    .then( (companyList: Company[]) => {
      
      if(companyList.length == 0){
        const msg = `synchronization executed`;
        this.logger.log(`synchronize: ${msg}`);
        return msg;
      }

      const companyDtoList = companyList.map( value => new CompanyDto(value.name, value.id) );
      const messageDtoList: MessageDto[] = companyDtoList.map( value => new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.COMPANY_UPDATE, JSON.stringify(value)) );
      const dataReplicationDto: DataReplicationDto = new DataReplicationDto(messageDtoList);
      
      return this.replicationService.sendMessages(dataReplicationDto)
      .then( () => {
        paginationDto.page++;
        return this.synchronize(paginationDto);
      })
      
    })
    .catch( error => {
      const msg = `not executed (unexpected error)`;
      this.logger.error(`synchronize: ${msg}, paginationDto=${JSON.stringify(paginationDto)}`, error);
      return msg;
    })

  }

  private save(entity: Company): Promise<Company> {
    const start = performance.now();

    const newEntity: Company = this.companyRepository.create(entity);

    return this.companyRepository.save(newEntity)
    .then( (entity: Company) => {
      const end = performance.now();
      this.logger.log(`save: OK, runtime=${(end - start) / 1000} seconds, entity=${JSON.stringify(entity)}`);
      return entity;
    })
  }

  private findAll(paginationDto: SearchPaginationDto): Promise<Company[]> {
    const {page=1, limit=this.dbDefaultLimit} = paginationDto;

    // * search all
    return this.companyRepository.find({
      take: limit,
      skip: (page - 1) * limit
    })
    
  }

}
