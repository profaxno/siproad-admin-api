import { In, InsertResult, Like, Raw, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { ProcessSummaryDto, SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { RoleDto, RolePermissionDto } from './dto/role.dto';
import { Role } from './entities/role.entity';

import { Company } from './entities/company.entity';
import { CompanyService } from './company.service';
import { AlreadyExistException, IsBeingUsedException } from '../common/exceptions/common.exception';
import { RolePermission } from './entities/role-permission.entity';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';

@Injectable()
export class RoleService {

  private readonly logger = new Logger(RoleService.name);

  private dbDefaultLimit = 1000;

  constructor(
    private readonly ConfigService: ConfigService,

    @InjectRepository(Role, 'adminConn')
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(RolePermission, 'adminConn')
    private readonly rolePermissionRepository: Repository<RolePermission>,

    // @InjectRepository(Permission, 'adminConn')
    // private readonly permissionRepository: Repository<Permission>,

    private readonly companyService: CompanyService,
    private readonly permissionService: PermissionService
    
  ){
    this.dbDefaultLimit = this.ConfigService.get("dbDefaultLimit");
  }
  
  async updateBatch(dtoList: RoleDto[]): Promise<ProcessSummaryDto>{
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

  update(dto: RoleDto): Promise<RoleDto> {
    if(!dto.id)
      return this.create(dto); // * create
    
    this.logger.warn(`update: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();
    
    // * find role
    const inputDto: SearchInputDto = new SearchInputDto(dto.id);
      
    return this.findByParams({}, inputDto)
    .then( (entityList: Role[]) => {

      // * validate
      if(entityList.length == 0){
        const msg = `role not found, id=${dto.id}`;
        this.logger.warn(`update: not executed (${msg})`);
        throw new NotFoundException(msg);
      }

      // * update
      const entity = entityList[0];
      
      return this.prepareEntity(entity, dto) // * prepare
      .then( (entity: Role) => this.save(entity) ) // * update
      .then( (entity: Role) => {

        return this.updateRolePermission(entity, dto.permissionList)
        .then( (rolePermissionList: RolePermission[]) => this.generateRoleWithPermissionList(entity, rolePermissionList) )
        .then( (dto: RoleDto) => {

          const end = performance.now();
          this.logger.log(`update: executed, runtime=${(end - start) / 1000} seconds`);
          return dto;
        })

      })
      
    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      this.logger.error(`update: error`, error);
      throw error;
    })

  }

  create(dto: RoleDto): Promise<RoleDto> {
    this.logger.warn(`create: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * find role
    const inputDto: SearchInputDto = new SearchInputDto(undefined, [dto.name]);
      
    return this.findByParams({}, inputDto, dto.companyId)
    .then( (entityList: Role[]) => {

      // * validate
      if(entityList.length > 0){
        const msg = `role already exists, name=${dto.name}`;
        this.logger.warn(`create: not executed (${msg})`);
        throw new AlreadyExistException(msg);
      }

      // * create
      const entity = new Role();
      
      return this.prepareEntity(entity, dto) // * prepare
      .then( (entity: Role) => this.save(entity) ) // * update
      .then( (entity: Role) => {

        return this.updateRolePermission(entity, dto.permissionList)
        .then( (rolePermissionList: RolePermission[]) => this.generateRoleWithPermissionList(entity, rolePermissionList) )
        .then( (dto: RoleDto) => {

          const end = performance.now();
          this.logger.log(`create: executed, runtime=${(end - start) / 1000} seconds`);
          return dto;
        })

      })

    })
    .catch(error => {
      if(error instanceof NotFoundException || error instanceof AlreadyExistException)
        throw error;

      this.logger.error(`create: error`, error);
      throw error;
    })

  }

  find(companyId: string, paginationDto: SearchPaginationDto, inputDto: SearchInputDto): Promise<RoleDto[]> {
    const start = performance.now();

    return this.findByParams(paginationDto, inputDto, companyId)
    .then( (entityList: Role[]) => entityList.map( (entity: Role) => this.generateRoleWithPermissionList(entity, entity.rolePermission) ) )// * map entities to DTOs
    .then( (dtoList: RoleDto[]) => {
      
      if(dtoList.length == 0){
        const msg = `roles not found`;
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

  findOneById(id: string, companyId?: string): Promise<RoleDto[]> {
    const start = performance.now();

    const inputDto: SearchInputDto = new SearchInputDto(id);
    
    return this.findByParams({}, inputDto, companyId)
    .then( (entityList: Role[]) => entityList.map( (entity: Role) => this.generateRoleWithPermissionList(entity, entity.rolePermission) ) )// * map entities to DTOs
    .then( (dtoList: RoleDto[]) => {
      
      if(dtoList.length == 0){
        const msg = `role not found, id=${id}`;
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

  // findByIdList(paginationDto: SearchPaginationDto, idList: string[]): Promise<RoleDto[]> {
  //   const start = performance.now();
    
  //   const inputDto: SearchInputDto = new SearchInputDto(undefined, undefined, idList);

  //   return this.findByParams(paginationDto, inputDto)
  //   .then( (entityList: Role[]) => entityList.map( (entity: Role) => this.generateRoleWithPermissionList(entity, entity.rolePermission) ) )// * map entities to DTOs
  //   .then( (dtoList: RoleDto[]) => {
      
  //     if(dtoList.length == 0){
  //       const msg = `roles not found, idList=${JSON.stringify(idList)}`;
  //       this.logger.warn(`findByIdList: ${msg}`);
  //       throw new NotFoundException(msg);
  //     }

  //     const end = performance.now();
  //     this.logger.log(`findByIdList: executed, runtime=${(end - start) / 1000} seconds`);
  //     return dtoList;
  //   })
  //   .catch(error => {
  //     if(error instanceof NotFoundException)
  //       throw error;

  //     this.logger.error(`findByIdList: error`, error);
  //     throw error;
  //   })

  // }

  remove(id: string): Promise<string> {
    this.logger.log(`remove: starting process... id=${id}`);
    const start = performance.now();

    // * find role
    const inputDto: SearchInputDto = new SearchInputDto(id);
    
    return this.findByParams({}, inputDto)
    .then( (entityList: Role[]) => {
      
      if(entityList.length == 0){
        const msg = `role not found, id=${id}`;
        this.logger.warn(`remove: not executed (${msg})`);
        throw new NotFoundException(msg);
      }

      // * delete: update field active
      const entity = entityList[0];
      entity.active = false;

      return this.save(entity)
      .then( (entity: Role) => {

        const end = performance.now();
        this.logger.log(`remove: OK, runtime=${(end - start) / 1000} seconds`);
        return 'deleted';
      })

    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      if(error.errno == 1217) {
        const msg = 'role is being used';
        this.logger.warn(`removeProduct: not executed (${msg})`, error);
        throw new IsBeingUsedException(msg);
      }

      this.logger.error('remove: error', error);
      throw error;
    })

  }

  private prepareEntity(entity: Role, dto: RoleDto): Promise<Role> {
  
    // * find company
    const inputDto: SearchInputDto = new SearchInputDto(dto.companyId);
    
    return this.companyService.findByParams({}, inputDto)
    .then( (companyList: Company[]) => {

      if(companyList.length == 0){
        const msg = `company not found, id=${dto.companyId}`;
        this.logger.warn(`create: not executed (${msg})`);
        throw new NotFoundException(msg);
      }

      // * prepare entity
      entity.company = companyList[0];
      entity.name    = dto.name.toUpperCase();
      
      return entity;
      
    })
    
  }

  private updateRolePermission(role: Role, rolePermissionDtoList: RolePermissionDto[] = []): Promise<RolePermission[]> {
    this.logger.log(`updateRolePermission: starting process... role=${JSON.stringify(role)}, rolePermissionDtoList=${JSON.stringify(rolePermissionDtoList)}`);
    const start = performance.now();

    if(rolePermissionDtoList.length == 0){
      this.logger.warn(`updateRolePermission: not executed (role role list empty)`);
      return Promise.resolve([]);
    }

    // * find permissions by id
    const permissionIdList = rolePermissionDtoList.map( (item) => item.id );
    const inputDto: SearchInputDto = new SearchInputDto(undefined, undefined, permissionIdList);
    
    return this.permissionService.findByParams({}, inputDto)
    .then( (permissionList: Permission[]) => {

      // * validate
      if(permissionList.length !== permissionIdList.length){
        const permissionIdNotFoundList: string[] = permissionIdList.filter( (id) => !permissionList.find( (permission) => permission.id == id) );
        const msg = `permission not found, idList=${JSON.stringify(permissionIdNotFoundList)}`;
        throw new NotFoundException(msg); 
      }

      // * create rolePermission
      return this.rolePermissionRepository.findBy( { role } ) // * find rolePermission
      .then( (rolePermissionList: RolePermission[]) => this.rolePermissionRepository.remove(rolePermissionList)) // * remove rolePermissions
      .then( () => {
        
        // * generate role role list
        const rolePermissionList: RolePermission[] = permissionList.map( (permission: Permission) => {
          const rolePermission = new RolePermission();
          rolePermission.role = role;
          rolePermission.permission = permission;
          return rolePermission;
        })
  
        // * bulk insert
        return this.bulkInsertRolePermissions(rolePermissionList)
        .then( (rolePermissionList: RolePermission[]) => {
          const end = performance.now();
          this.logger.log(`updateRolePermission: OK, runtime=${(end - start) / 1000} seconds`);
          return rolePermissionList;
        })

      })

    })

  }
  
  private bulkInsertRolePermissions(rolePermissionList: RolePermission[]): Promise<RolePermission[]> {
    const start = performance.now();
    this.logger.log(`bulkInsertRolePermissions: starting process... listSize=${rolePermissionList.length}`);

    const newRolePermissionList: RolePermission[] = rolePermissionList.map( (value) => this.rolePermissionRepository.create(value));
    
    return this.rolePermissionRepository.manager.transaction( async(transactionalEntityManager) => {
      
      return transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(RolePermission)
        .values(newRolePermissionList)
        .execute()
        .then( (insertResult: InsertResult) => {
          const end = performance.now();
          this.logger.log(`bulkInsertRolePermissions: OK, runtime=${(end - start) / 1000} seconds, insertResult=${JSON.stringify(insertResult.raw)}`);
          return newRolePermissionList;
        })
    })
  }

  findByParams(paginationDto: SearchPaginationDto, inputDto: SearchInputDto, companyId?: string): Promise<Role[]> {
    const {page=1, limit=this.dbDefaultLimit} = paginationDto;

    // * search by id or partial value
    const value = inputDto.search
    if(value) {
      const whereById     = { id: value, active: true };
      const whereByValue  = { company: { id: companyId}, name: value, active: true };
      const where = isUUID(value) ? whereById : whereByValue;

      return this.roleRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: where,
        relations: {
          rolePermission: true
        }
      })
    }

    // * search by value list
    if(inputDto.searchList?.length > 0) {
      return this.roleRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          company: {
            id: companyId
          },
          name: Raw( (fieldName) => inputDto.searchList.map(value => `${fieldName} LIKE '%${value.replace(' ', '%')}%'`).join(' OR ') ),
          // name: In(inputDto.searchList),
          active: true
        },
        relations: {
          rolePermission: true
        }
      })
    }

    // * search by id list
    if(inputDto.idList?.length > 0) {
      return this.roleRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          id: In(inputDto.idList),
          active: true
        },
        relations: {
          rolePermission: true
        }
      })
    }

    // * search all
    return this.roleRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      where: { 
        company: {
          id: companyId
        },
        active: true 
      },
      relations: {
        rolePermission: true
      }
    })
    
  }

  private save(entity: Role): Promise<Role> {
    const start = performance.now();

    const newEntity: Role = this.roleRepository.create(entity);

    return this.roleRepository.save(newEntity)
    .then( (entity: Role) => {
      const end = performance.now();
      this.logger.log(`save: OK, runtime=${(end - start) / 1000} seconds, entity=${JSON.stringify(entity)}`);
      return entity;
    })
  }

  private generateRoleWithPermissionList(role: Role, rolePermissionList: RolePermission[]): RoleDto {

    let rolePermissionDtoList: RolePermissionDto[] = [];

    if(rolePermissionList.length > 0){
      rolePermissionDtoList = rolePermissionList.map( (rolePermission: RolePermission) => new RolePermissionDto(rolePermission.permission.id, rolePermission.permission.name) );
    } 

    // * generate role dto
    const roleDto = new RoleDto(role.company.id, role.name, role.id, rolePermissionDtoList);

    return roleDto;
  }
}
