import { Repository } from 'typeorm';

import { SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Injectable, Logger, NotFoundException, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { AlreadyExistException, IsBeingUsedException } from '../../../common/exceptions/common.exception';

import { ProductUnitDto, ProductUnitSearchInputDto } from './dto';
import { ProductUnit } from './entities/product-unit.entity';

import { Company } from '../../companies/entities/company.entity';
import { MessageDto } from 'src/data-transfer/dto/message.dto';
import { ProcessEnum, SourceEnum } from 'src/data-transfer/enums';
import { DataReplicationService } from 'src/data-transfer/data-replication/data-replication.service';
import { JsonBasic } from 'src/data-transfer/interfaces/json-basic.interface';

@Injectable()
export class ProductUnitService {

  private readonly logger = new Logger(ProductUnitService.name);

  private dbDefaultLimit = 1000;

  constructor(
    private readonly ConfigService: ConfigService,

    @InjectRepository(ProductUnit, 'adminConn')
    private readonly productUnitRepository: Repository<ProductUnit>,
    private readonly replicationService: DataReplicationService
  ){
    this.dbDefaultLimit = this.ConfigService.get("dbDefaultLimit");
  }

  update(dto: ProductUnitDto): Promise<ProductUnitDto> {
    if(!dto.id)
      return this.create(dto); // * create
    
    this.logger.warn(`update: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    return this.productUnitRepository.findOne({
      where: { id: dto.id },
    })
    .then( (entity: ProductUnit) => {

      // * validate
      if(!entity){
        const msg = `entity not found, id=${dto.id}`;
        this.logger.warn(`update: not executed (${msg})`);
        throw new NotFoundException(msg);
      }
      
      return this.replicationData(dto) // * replication data
      .then( () => {

        return this.prepareEntity(entity, dto) // * prepare
        .then( (entity: ProductUnit) => this.save(entity) ) // * save
        .then( (entity: ProductUnit) => new ProductUnitDto(entity.company.id, entity.name, entity.id) )
        .then( (dto: ProductUnitDto) => {
          const end = performance.now();
          this.logger.log(`update: executed, runtime=${(end - start) / 1000} seconds`);
          return dto;
        })
        .catch(error => {
          const dto = new ProductUnitDto(entity.company.id, entity.name, entity.id);
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

  create(dto: ProductUnitDto): Promise<ProductUnitDto> {
    this.logger.warn(`create: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * create
    return this.productUnitRepository.findOne({
      where: { name: dto.name, company: { id: dto.companyId } }, // TODO: preguntar tambien por el companyId y revisar que otros services tienen el mismo problema.
    })
    .then( (entity: ProductUnit) => {

      // * validate
      if(entity){
        const msg = `name already exists, name=${dto.name}`;
        this.logger.warn(`create: not executed (${msg})`);
        throw new AlreadyExistException(msg);
      }
      
      return this.prepareEntity(new ProductUnit(), dto) // * prepare
      .then( (entity: ProductUnit) => this.save(entity) ) // * save
      .then( (entity: ProductUnit) => new ProductUnitDto(entity.company.id, entity.name, entity.id) )

    })
    .then( (dto: ProductUnitDto) => {
    
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

    return this.productUnitRepository.findOne({
      where: { id },
    })
    .then( (entity: ProductUnit) => {

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
    .then( (entity: ProductUnit) => this.save(entity) )
    .then( (entity: ProductUnit) => {

      // * replication data
      const jsonBasic: JsonBasic = { id: entity.id }
      const messageDto = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.PRODUCT_UNIT_DELETE, JSON.stringify([jsonBasic]));
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

  searchByValues(companyId: string, paginationDto: SearchPaginationDto, inputDto: ProductUnitSearchInputDto): Promise<ProductUnitDto[]> {
    const start = performance.now();

    return this.searchEntitiesByValues(companyId, paginationDto, inputDto)
    .then( (entityList: ProductUnit[]) => entityList.map( (entity) => new ProductUnitDto(entity.company.id, entity.name, entity.id) ) )
    .then( (dtoList: ProductUnitDto[]) => {
      
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
  
  private prepareEntity(entity: ProductUnit, dto: ProductUnitDto): Promise<ProductUnit> {
  
    try {
      const company = new Company();
      company.id = dto.companyId;

      entity.id           = dto.id ? dto.id : undefined;
      entity.company      = company;
      entity.name         = dto.name.toUpperCase();

      return Promise.resolve(entity);

    } catch (error) {
      this.logger.error(`prepareEntity: error`, error);
      throw error;
    }
    
  }

  private save(entity: ProductUnit): Promise<ProductUnit> {
    const start = performance.now();

    const newEntity: ProductUnit = this.productUnitRepository.create(entity);

    return this.productUnitRepository.save(newEntity)
    .then( (entity: ProductUnit) => {
      const end = performance.now();
      this.logger.log(`save: OK, runtime=${(end - start) / 1000} seconds, entity=${JSON.stringify(entity)}`);
      return entity;
    })
  }

  private replicationData(dto: ProductUnitDto): Promise<string> {
    const messageDto = new MessageDto(SourceEnum.API_ADMIN, ProcessEnum.PRODUCT_UNIT_UPDATE, JSON.stringify([dto]));
    return this.replicationService.sendMessage(messageDto);
  }

  private searchEntitiesByValues(companyId: string, paginationDto: SearchPaginationDto, inputDto: ProductUnitSearchInputDto): Promise<ProductUnit[]> {
    const {page=1, limit=this.dbDefaultLimit} = paginationDto;

    const query = this.productUnitRepository.createQueryBuilder('a')
    .leftJoinAndSelect('a.company', 'c')
    .where('a.companyId = :companyId', { companyId })
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
