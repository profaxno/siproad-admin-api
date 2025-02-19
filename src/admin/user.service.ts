import { In, Like, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

import { Company } from './entities/company.entity';
import { CompanyService } from './company.service';
import { AlreadyExistException, IsBeingUsedException } from './exceptions/admin.exception';

@Injectable()
export class UserService {

  private readonly logger = new Logger(UserService.name);

  private dbDefaultLimit = 1000;

  constructor(
    private readonly ConfigService: ConfigService,

    @InjectRepository(User, 'adminConn')
    private readonly userRepository: Repository<User>,

    private readonly companyService: CompanyService
    
  ){
    this.dbDefaultLimit = this.ConfigService.get("dbDefaultLimit");
  }
  
  updateUser(dto: UserDto): Promise<UserDto> {
    if(!dto.id)
      return this.createUser(dto); // * create
    
    this.logger.warn(`updateUser: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * find company
    const inputDto: SearchInputDto = new SearchInputDto(dto.companyId);
    
    return this.companyService.findCompaniesByParams({}, inputDto)
    .then( (companyList: Company[]) => {

      if(companyList.length == 0){
        const msg = `company not found, id=${dto.id}`;
        this.logger.warn(`updateUser: not executed (${msg})`);
        throw new NotFoundException(msg);
        //return new ProductsResponseDto(HttpStatus.NOT_FOUND, msg);    
      }

      const company = companyList[0];

      // * find user
      const inputDto: SearchInputDto = new SearchInputDto(dto.id);
        
      return this.findUsersByParams({}, inputDto)
      .then( (entityList: User[]) => {

        // * validate
        if(entityList.length == 0){
          const msg = `user not found, id=${dto.id}`;
          this.logger.warn(`updateUser: not executed (${msg})`);
          throw new NotFoundException(msg);
          //return new ProductsResponseDto(HttpStatus.NOT_FOUND, msg);  
        }
  
        let entity = entityList[0];
        
        // * update
        entity.company = company;
        entity.fullName = dto.fullName.toUpperCase();
        entity.email = dto.email.toUpperCase();;
        entity.password = dto.password;
        
        return this.saveUser(entity)
        .then( (entity: User) => {
          const dto = new UserDto(entity.company.id, entity.fullName, entity.email, entity.password, entity.id); // * map to dto
  
          const end = performance.now();
          this.logger.log(`updateUser: executed, runtime=${(end - start) / 1000} seconds`);
          return dto;
          //return new ProductsResponseDto(HttpStatus.OK, 'updated OK', [dto]);
        })
        
      })

    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      this.logger.error(`updateUser: error`, error);
      throw error;
    })

  }

  createUser(dto: UserDto): Promise<UserDto> {
    this.logger.warn(`createUser: starting process... dto=${JSON.stringify(dto)}`);
    const start = performance.now();

    // * find company
    const inputDto: SearchInputDto = new SearchInputDto(dto.companyId);
    
    return this.companyService.findCompaniesByParams({}, inputDto)
    .then( (companyList: Company[]) => {

      if(companyList.length == 0){
        const msg = `company not found, id=${dto.id}`;
        this.logger.warn(`createUser: not executed (${msg})`);
        throw new NotFoundException(msg);
        //return new ProductsResponseDto(HttpStatus.NOT_FOUND, msg);    
      }

      const company = companyList[0];

      // * find user
      const inputDto: SearchInputDto = new SearchInputDto(undefined, [dto.fullName]);
        
      return this.findUsersByParams({}, inputDto, company.id)
      .then( (entityList: User[]) => {

        // * validate
        if(entityList.length > 0){
          const msg = `user already exists, name=${dto.fullName}`;
          this.logger.warn(`createUser: not executed (${msg})`);
          throw new AlreadyExistException(msg);
          //return new ProductsResponseDto(HttpStatus.BAD_REQUEST, msg);
        }
  
        // * create
        let entity = new User();
        entity.company = company;
        entity.fullName = dto.fullName.toUpperCase();
        entity.email = dto.email.toUpperCase();;
        entity.password = dto.password;
  
        return this.saveUser(entity)
        .then( (entity: User) => {
          const dto = new UserDto(entity.company.id, entity.fullName, entity.email, entity.password, entity.id); // * map to dto 

          const end = performance.now();
          this.logger.log(`createUser: OK, runtime=${(end - start) / 1000} seconds`);
          return dto;
          //return new ProductsResponseDto(HttpStatus.OK, 'created OK', [dto]);
        })
  
      })

    })
    .catch(error => {
      if(error instanceof NotFoundException || error instanceof AlreadyExistException)
        throw error;

      this.logger.error(`createUser: error`, error);
      throw error;
    })

  }

  findUsers(companyId: string, paginationDto: SearchPaginationDto, inputDto: SearchInputDto): Promise<UserDto[]> {
    const start = performance.now();

    return this.findUsersByParams(paginationDto, inputDto, companyId)
    .then( (entityList: User[]) => entityList.map( (entity: User) => new UserDto(entity.company.id, entity.fullName, entity.email, entity.password, entity.id) ) )// * map entities to DTOs
    .then( (dtoList: UserDto[]) => {
      
      if(dtoList.length == 0){
        const msg = `users not found`;
        this.logger.warn(`findUsers: ${msg}`);
        throw new NotFoundException(msg);
        //return new ProductsResponseDto(HttpStatus.NOT_FOUND, msg, []);
      }

      const end = performance.now();
      this.logger.log(`findUsers: executed, runtime=${(end - start) / 1000} seconds`);
      return dtoList;
      //return new ProductsResponseDto(HttpStatus.OK, 'OK', dtoList);
    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      this.logger.error(`findUsers: error`, error);
      throw error;
    })

  }

  findOneUserByValue(companyId: string, value: string): Promise<UserDto[]> {
    const start = performance.now();

    const inputDto: SearchInputDto = new SearchInputDto(value);
    
    return this.findUsersByParams({}, inputDto, companyId)
    .then( (entityList: User[]) => entityList.map( (entity: User) => new UserDto(entity.company.id, entity.fullName, entity.email, entity.password, entity.id) ) )// * map entities to DTOs
    .then( (dtoList: UserDto[]) => {
      
      if(dtoList.length == 0){
        const msg = `user not found, value=${value}`;
        this.logger.warn(`findOneUserByValue: ${msg}`);
        throw new NotFoundException(msg);
        //return new ProductsResponseDto(HttpStatus.NOT_FOUND, msg, []);
      }

      const end = performance.now();
      this.logger.log(`findOneUserByValue: executed, runtime=${(end - start) / 1000} seconds`);
      return dtoList;
      //return new ProductsResponseDto(HttpStatus.OK, 'OK', dtoList);
    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      this.logger.error(`findOneUserByValue: error`, error);
      throw error;
    })

  }

  removeUser(id: string): Promise<string> {
    this.logger.log(`removeUser: starting process... id=${id}`);
    const start = performance.now();

    // * find user
    const inputDto: SearchInputDto = new SearchInputDto(id);
    
    return this.findUsersByParams({}, inputDto)
    .then( (entityList: User[]) => {
      
      if(entityList.length == 0){
        const msg = `user not found, id=${id}`;
        this.logger.warn(`removeUser: not executed (${msg})`);
        throw new NotFoundException(msg);
        //return new ProductsResponseDto(HttpStatus.NOT_FOUND, msg);
      }

      // * delete
      return this.userRepository.delete(id)
      .then( () => {
        const end = performance.now();
        this.logger.log(`removeUser: OK, runtime=${(end - start) / 1000} seconds`);
        return 'deleted';
        //return new ProductsResponseDto(HttpStatus.OK, 'delete OK');
      })

    })
    .catch(error => {
      if(error instanceof NotFoundException)
        throw error;

      if(error.errno == 1217) {
        const msg = 'user is being used';
        this.logger.warn(`removeProduct: not executed (${msg})`, error);
        throw new IsBeingUsedException(msg);
        //return new ProductsResponseDto(HttpStatus.BAD_REQUEST, 'product is being used');
      }

      this.logger.error('removeUser: error', error);
      throw error;
    })

  }

  private findUsersByParams(paginationDto: SearchPaginationDto, inputDto: SearchInputDto, companyId?: string): Promise<User[]> {
    const {page=1, limit=this.dbDefaultLimit} = paginationDto;

    // * search by partial name
    const value = inputDto.search
    if(value) {
      const whereByName = { company: { id: companyId}, name: Like(`%${inputDto.search}%`), active: true };
      const whereById   = { id: value, active: true };
      const where = isUUID(value) ? whereById : whereByName;

      return this.userRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: where
      })
    }

    // * search by names
    if(inputDto.searchList) {
      return this.userRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          company: {
            id: companyId
          },
          fullName: In(inputDto.searchList),
          active: true,
        }
      })
    }

    // * search all
    return this.userRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      where: { 
        company: {
          id: companyId
        },
        active: true }
    })
    
  }

  private saveUser(entity: User): Promise<User> {
    const start = performance.now();

    const newEntity: User = this.userRepository.create(entity);

    return this.userRepository.save(newEntity)
    .then( (entity: User) => {
      const end = performance.now();
      this.logger.log(`saveUser: OK, runtime=${(end - start) / 1000} seconds, entity=${JSON.stringify(entity)}`);
      return entity;
    })
  }
  
}
