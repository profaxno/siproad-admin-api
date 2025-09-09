import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Redis from 'ioredis';  // Import Redis from ioredis
import { Job, Queue } from 'bullmq';

import { MessageDto } from '../dto/message.dto';
import { ProcessEnum } from '../enums';

@Injectable()
export class DataReplicationRedisProducerService {
  
  private readonly logger = new Logger(DataReplicationRedisProducerService.name);

  private readonly redisHost: string = "";
  private readonly redisPort: number = 0;
  private readonly redisPassword: string = "";
  private readonly redisFamily: number = 0;
  private readonly redisJobQueueProducts: string = "";
  private readonly redisJobQueuePurchases: string = "";
  private readonly redisJobQueueSales: string = "";

  private queueProducts: Queue;
  private queuePurchases: Queue;
  private queueSales: Queue;

  constructor(
    private readonly configService: ConfigService
  ) {
    // * Retrieve the Redis configuration values from ConfigService
    this.redisHost = this.configService.get('redisHost');
    this.redisPort = this.configService.get('redisPort');
    this.redisPassword = this.configService.get('redisPassword');
    this.redisFamily = this.configService.get('redisFamily');
    this.redisJobQueueProducts = this.configService.get('redisJobQueueProducts');
    this.redisJobQueuePurchases = this.configService.get('redisJobQueuePurchases');
    this.redisJobQueueSales = this.configService.get('redisJobQueueSales');

    // * Create the Redis client using ioredis
    const redisClient = new Redis({
      host: this.redisHost,
      port: this.redisPort,
      password: this.redisPassword,
      family: this.redisFamily
    });

    // * Configure the BullMQ queue with the redisClient
    this.queueProducts = new Queue(this.redisJobQueueProducts, {
      connection: redisClient,
    });
    
    this.queuePurchases = new Queue(this.redisJobQueuePurchases, {
      connection: redisClient,
    });

    this.queueSales = new Queue(this.redisJobQueueSales, {
      connection: redisClient,
    });
  }

  // * Method to send a message to the queue
  async sendMessageToQueues(messageDto: MessageDto): Promise<string> {
    
    // * generate promises
    const promiseList: Promise<string>[] = [];

    switch (messageDto.process) {
      case ProcessEnum.DOCUMENT_TYPE_UPDATE:
      case ProcessEnum.DOCUMENT_TYPE_DELETE: {
        promiseList.push(this.sendMessage(this.queuePurchases, messageDto));
        promiseList.push(this.sendMessage(this.queueSales, messageDto));
        break;
      }
      case ProcessEnum.PRODUCT_UNIT_UPDATE:
      case ProcessEnum.PRODUCT_UNIT_DELETE: {
        promiseList.push(this.sendMessage(this.queueProducts, messageDto));
        break;
      }
      default: {
        promiseList.push(this.sendMessage(this.queueProducts, messageDto));
        promiseList.push(this.sendMessage(this.queuePurchases, messageDto));
        promiseList.push(this.sendMessage(this.queueSales, messageDto));
      }
    }
    
    // * exec promises
    const promiseResultList = await Promise.allSettled(promiseList)
    
    // * process result
    let result: string = "";
    promiseResultList.forEach( (promiseResult, index) => {
      if (promiseResult.status === 'fulfilled') 
        result += `${index} job success ${promiseResult.value}|`;
      else result += `${index} job failed: ${promiseResult.reason}|`;
    });
    
    return result;
  }


  private sendMessage(queue: Queue, messageDto: MessageDto) {

    return queue.add('job', messageDto, { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false })
    .then((job: Job) => `job generated, id=${job.id}`)
    .catch((error) => {
      this.logger.error(`sendMessage: error=${JSON.stringify(error)}`);
      throw error;
    });

  }
}
