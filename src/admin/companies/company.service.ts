import { FindRelationsNotFoundError, In, Like, Raw, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { ProcessSummaryDto, SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { CompanyDto } from './dto/company.dto';
import { CompanySearchInputDto } from './dto/company-search.dto';
import { Company } from './entities/company.entity';

import { AlreadyExistException, IsBeingUsedException } from '../../common/exceptions/common.exception';

import { DataReplicationService } from 'src/data-transfer/data-replication/data-replication.service';
import { MessageDto } from 'src/data-transfer/dto/message.dto';
import { ProcessEnum, SourceEnum } from 'src/data-transfer/enums';
import { JsonBasic } from 'src/data-transfer/interfaces/json-basic.interface';

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

    return this.companyRepository.findOne({
      where: { id: dto.id },
    })
    .then( (entity: Company) => {

      // * validate
      if(!entity){
        const msg = `entity not found, id=${dto.id}`;
        this.logger.warn(`update: not executed (${msg})`);
        throw new NotFoundException(msg);
      }
      
      return this.replicationData(dto) // * replication data
      .then( () => {

        return this.prepareEntity(entity, dto) // * prepare
        .then( (entity: Company) => this.save(entity) ) // * save
        .then( (entity: Company) => new CompanyDto(entity.name, entity.id, entity.imgUrlHeader, entity.imgUrlFooter) ) // * map to dto
        .then( (dto: CompanyDto) => {
          const end = performance.now();
          this.logger.log(`update: executed, runtime=${(end - start) / 1000} seconds`);
          return dto;
        })
        .catch(error => {
          const dto = new CompanyDto(entity.name, entity.id, entity.imgUrlHeader, entity.imgUrlFooter);
          this.replicationData(dto); // * rollback
          throw error;
        })

      })

    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      this.logger.error(`update: error=${error.message}`);
      throw error;
    })

  }

  create(dto: CompanyDto): Promise<CompanyDto> {
    this.logger.warn(`create: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * create
    return this.companyRepository.findOne({
      where: { name: dto.name },
    })
    .then( (entity: Company) => {

      // * validate
      if(entity){
        const msg = `name already exists, name=${dto.name}`;
        this.logger.warn(`create: not executed (${msg})`);
        throw new AlreadyExistException(msg);
      }
      
      return this.prepareEntity(new Company(), dto) // * prepare
      .then( (entity: Company) => this.save(entity) ) // * save
      .then( (entity: Company) => new CompanyDto(entity.name, entity.id, entity.imgUrlHeader, entity.imgUrlFooter) ) // * map to dto

    })
    .then( (dto: CompanyDto) => {

      return this.replicationData(dto) // * replication data
      .then( () => {
        const end = performance.now();
        this.logger.log(`create: executed, runtime=${(end - start) / 1000} seconds`);
        return dto;
      })
      .catch(error => {
        this.remove(dto.id); // * rollback
        throw error;
      })

    })
    .catch(error => {
      if(error instanceof NotFoundException || error instanceof AlreadyExistException)
        throw error;

      this.logger.error(`create: error=${error.message}`);
      throw error;
    })

  }

  remove(id: string): Promise<string> {
    this.logger.log(`remove: starting process... id=${id}`);
    const start = performance.now();

    return this.companyRepository.findOne({
      where: { id },
    })
    .then( (entity: Company) => {

      // * validate
      if(!entity){
        const msg = `entity not found, id=${id}`;
        this.logger.warn(`update: not executed (${msg})`);
        throw new NotFoundException(msg);
      }
      
      // * delete: update field active
      entity.active = false;
      return entity;
    })
    .then( (entity: Company) => this.save(entity) )
    .then( (entity: Company) => {

      // * replication data
      const jsonBasic: JsonBasic = { id: entity.id }
      const messageDto = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.COMPANY_DELETE, JSON.stringify([jsonBasic]));
      this.replicationService.sendMessage(messageDto);

      const end = performance.now();
      this.logger.log(`remove: OK, runtime=${(end - start) / 1000} seconds`);
      return 'deleted';
    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      if(error.errno == 1217) {
        const msg = 'entity is being used';
        this.logger.warn(`removeProduct: not executed (${msg})`, error);
        throw new IsBeingUsedException(msg);
      }

      this.logger.error('remove: error', error);
      throw error;
    })

  }
  
  synchronize(paginationDto: SearchPaginationDto): Promise<string> {
    this.logger.warn(`synchronize: starting process... paginationDto=${JSON.stringify(paginationDto)}`);

    return this.findAll(paginationDto)
    .then( (entityList: Company[]) => {
      
      if(entityList.length == 0){
        const msg = 'executed';
        this.logger.log(`synchronize: ${msg}`);
        return msg;
      }

      // * generate update message
      const updateDtoList: CompanyDto[] = entityList.reduce( (acc, value) => {
        if(value.active)
          acc.push(new CompanyDto(value.name, value.id));          

        return acc;
      }, []);

      const updateMessage = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.COMPANY_UPDATE, JSON.stringify(updateDtoList));

      // * generate delete message
      const deleteList: JsonBasic[] = entityList.reduce( (acc, value) => {
        if(!value.active)
          acc.push({ id: value.id });
        return acc;
      }, []);

      const deleteMessage = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.COMPANY_DELETE, JSON.stringify(deleteList));

      // * send messages
      const promiseList: Promise<string>[] = [];
      promiseList.push(this.replicationService.sendMessage(updateMessage));
      promiseList.push(this.replicationService.sendMessage(deleteMessage));

      return Promise.allSettled(promiseList)
      .then( (promiseResultList: PromiseSettledResult<string>[]) => {
        
        const result: string = promiseResultList.reduce( (acc, value) => {
          if (value.status === 'fulfilled') 
            acc += `job success ${value.value}|`;
          else acc += `job failed: ${value.reason}|`;

          return acc;
        }, "");
        
        this.logger.log(`synchronize: result=${result}, iteration=${paginationDto.page}`);

        paginationDto.page++;
        return this.synchronize(paginationDto);
        
      })

      // return this.replicationService.sendMessages([updateMessage, deleteMessage])
      // .then( () => {
      //   paginationDto.page++;
      //   return this.synchronize(paginationDto);
      // })
      
    })
    .catch( error => {
      const msg = `not executed (unexpected error)`;
      this.logger.error(`synchronize: ${msg}, paginationDto=${JSON.stringify(paginationDto)}`, error);
      return msg;
    })

  }

  searchByValues(companyId: string, paginationDto: SearchPaginationDto, inputDto: CompanySearchInputDto): Promise<CompanyDto[]> {
    const start = performance.now();

    return this.searchEntitiesByValues(companyId, paginationDto, inputDto)
    .then( (entityList: Company[]) => entityList.map( (entity) => new CompanyDto(entity.name, entity.id, entity.imgUrlHeader, entity.imgUrlFooter) ) )
    .then( (dtoList: CompanyDto[]) => {
      
      if(dtoList.length == 0){
        const msg = `entities not found, inputDto=${JSON.stringify(inputDto)}`;
        this.logger.warn(`searchByValues: ${msg}`);
        throw new NotFoundException(msg);
      }

      const end = performance.now();
      this.logger.log(`searchByValues: executed, runtime=${(end - start) / 1000} seconds`);
      return dtoList;
    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      this.logger.error(`searchByValues: error`, error);
      throw error;
    })
    
  }

  // find(paginationDto: SearchPaginationDto, inputDto: SearchInputDto): Promise<CompanyDto[]> {
  //   const start = performance.now();

  //   return this.findByParams(paginationDto, inputDto)
  //   .then( (entityList: Company[]) => entityList.map( (entity: Company) => new CompanyDto(entity.name, entity.id) ) ) // * map entities to DTOs
  //   .then( (dtoList: CompanyDto[]) => {

  //     if(dtoList.length == 0){
  //       const msg = `companies not found`;
  //       this.logger.warn(`find: ${msg}`);
  //       throw new NotFoundException(msg);
  //     }

  //     const end = performance.now();
  //     this.logger.log(`find: executed, runtime=${(end - start) / 1000} seconds`);
  //     return dtoList;
  //   })
  //   .catch(error => {
  //     if(error instanceof NotFoundException)
  //       throw error;

  //     this.logger.error(`find: error`, error);
  //     throw error;
  //   })

  // }

  // findOneById(id: string): Promise<CompanyDto[]> {
  //   const start = performance.now();

  //   const inputDto: SearchInputDto = new SearchInputDto(id);
    
  //   return this.findByParams({}, inputDto)
  //   .then( (entityList: Company[]) => entityList.map( (entity: Company) => new CompanyDto(entity.name, entity.id) ) ) // * map entities to DTOs
  //   .then( (dtoList: CompanyDto[]) => {

  //     if(dtoList.length == 0){
  //       const msg = `company not found, id=${id}`;
  //       this.logger.warn(`findOneById: ${msg}`);
  //       throw new NotFoundException(msg);
  //     }

  //     const end = performance.now();
  //     this.logger.log(`findOneById: executed, runtime=${(end - start) / 1000} seconds`);
  //     return dtoList;
  //   })
  //   .catch(error => {
  //     if(error instanceof NotFoundException)
  //       throw error;

  //     this.logger.error(`findOneById: error`, error);
  //     throw error;
  //   })
    
  // }

  // findByParams(paginationDto: SearchPaginationDto, inputDto: SearchInputDto): Promise<Company[]> {
  //   const {page=1, limit=this.dbDefaultLimit} = paginationDto;

  //   // * search by id or partial value
  //   const value = inputDto.search;
  //   if(value) {
  //     const whereById     = { id: value, active: true };
  //     const whereByValue  = { name: value, active: true };
  //     const where = isUUID(value) ? whereById : whereByValue;

  //     return this.companyRepository.find({
  //       take: limit,
  //       skip: (page - 1) * limit,
  //       where: where
  //     })
  //   }

  //   // * search by value list
  //   if(inputDto.searchList?.length > 0) {
  //     return this.companyRepository.find({
  //       take: limit,
  //       skip: (page - 1) * limit,
  //       where: {
  //         name: Raw( (fieldName) => inputDto.searchList.map(value => `${fieldName} LIKE '%${value.replace(' ', '%')}%'`).join(' OR ') ),
  //         // name: In(inputDto.searchList),
  //         active: true
  //       }
  //     })
  //   }

  //   // * search all
  //   return this.companyRepository.find({
  //     take: limit,
  //     skip: (page - 1) * limit,
  //     where: { active: true }
  //   })
    
  // }

  private prepareEntity(entity: Company, dto: CompanyDto): Promise<Company> {
    
    try {
      entity.id           = dto.id ? dto.id : undefined;
      entity.name         = dto.name.toUpperCase();

      return Promise.resolve(entity);

    } catch (error) {
      this.logger.error(`prepareEntity: error`, error);
      throw error;
    }
    
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

  private replicationData(dto: CompanyDto): Promise<string> {
    const messageDto = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.COMPANY_UPDATE, JSON.stringify([dto]));
    return this.replicationService.sendMessage(messageDto);
  }

  private findAll(paginationDto: SearchPaginationDto): Promise<Company[]> {
    const {page=1, limit=this.dbDefaultLimit} = paginationDto;

    // * search all
    return this.companyRepository.find({
      take: limit,
      skip: (page - 1) * limit
    })
    
  }

  private searchEntitiesByValues(companyId: string, paginationDto: SearchPaginationDto, inputDto: CompanySearchInputDto): Promise<Company[]> {
    const {page=1, limit=this.dbDefaultLimit} = paginationDto;

    const query = this.companyRepository.createQueryBuilder('a')
    .andWhere('a.active = :active', { active: true });

    if(inputDto.name) {
      const formatted = `%${inputDto.name?.toLowerCase().replace(' ', '%')}%`;
      query.andWhere('a.name LIKE :name', { name: formatted });
    }

    return query
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();
  }

}
