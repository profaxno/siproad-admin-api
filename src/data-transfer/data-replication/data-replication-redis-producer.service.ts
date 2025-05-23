import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Redis from 'ioredis';  // Import Redis from ioredis
import { Queue } from 'bullmq';

import { MessageDto } from '../dto/message.dto';

@Injectable()
export class DataReplicationRedisProducerService {
  
  private readonly logger = new Logger(DataReplicationRedisProducerService.name);

  private readonly redisHost: string = "";
  private readonly redisPort: number = 0;
  private readonly redisPassword: string = "";
  private readonly redisFamily: number = 0;
  private readonly redisJobQueueAdminProducts: string = "";
  private readonly redisJobQueueAdminSales: string = "";

  private queueAdminProducts: Queue;
  private queueAdminSales: Queue;

  constructor(
    private readonly configService: ConfigService
  ) {
    // * Retrieve the Redis configuration values from ConfigService
    this.redisHost = this.configService.get('redisHost');
    this.redisPort = this.configService.get('redisPort');
    this.redisPassword = this.configService.get('redisPassword');
    this.redisFamily = this.configService.get('redisFamily');
    this.redisJobQueueAdminProducts = this.configService.get('redisJobQueueAdminProducts');
    this.redisJobQueueAdminSales = this.configService.get('redisJobQueueAdminSales');

    // * Create the Redis client using ioredis
    const redisClient = new Redis({
      host: this.redisHost,
      port: this.redisPort,
      password: this.redisPassword,
      family: this.redisFamily
    });

    // * Configure the BullMQ queue with the redisClient
    this.queueAdminProducts = new Queue(this.redisJobQueueAdminProducts, {
      connection: redisClient,
    });

    // * Configure the BullMQ queue with the redisClient
    this.queueAdminSales = new Queue(this.redisJobQueueAdminSales, {
      connection: redisClient,
    });
  }

  // * Method to send a message to the queue
  sendMessage(messageDto: MessageDto): Promise<string> {
    
    return this.queueAdminProducts.add('job', messageDto)
    .then((job) => {
      this.logger.log(`sendMessage: job generated to queueAdminProducts, jobId=${job.id}`)

      return this.queueAdminSales.add('job', messageDto)
      .then((job) => {
        this.logger.log(`sendMessage: job generated to queueAdminSales, jobId=${job.id}`)

        return `job generated, jobId=${job.id}, jobId=${job.id}`;
      })
      
    })
    .catch((error) => {
      this.logger.error(`sendMessage: error=${JSON.stringify(error)}`);
      throw error;
    });


    // this.queueAdminProducts.add('job', messageDto)
    // .then((job) => {
    //   this.logger.log(`sendMessage: job generated to queueAdminProducts, jobId=${job.id}`)
    // })
    // .catch((error) => {
    //   this.logger.error(`sendMessage: queueAdminProducts error=${JSON.stringify(error)}`);
    // });

    // this.queueAdminSales.add('job', messageDto)
    // .then((job) => {
    //   this.logger.log(`sendMessage: job generated to queueAdminSales, jobId=${job.id}`)
    // })
    // .catch((error) => {
    //   this.logger.error(`sendMessage: queueAdminSales error=${JSON.stringify(error)}`);
    // });
  }
}
