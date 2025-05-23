import { ProcessSummaryDto, SearchInputDto, SearchPaginationDto } from 'profaxnojs/util';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MessageDto } from '../dto/message.dto';
import { ProcessEnum, SourceEnum } from '../enums';

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

@Injectable()
export class DataReplicationAwsService {

  private readonly logger = new Logger(DataReplicationAwsService.name);
  
  private readonly useLocalStack: boolean = false;
  private readonly awsHost: string = "";
  private readonly awsRegion: string = "";
  private readonly awsAccessKeyId: string = "";
  private readonly awsSecretAccessKey: string = "";
  private readonly adminSnsTopicArn: string = "";
  private readonly adminSalesSqsUrl: string = "";

  private readonly snsClient: SNSClient;  
  private readonly sqsClient: SQSClient;

  constructor(
    private readonly configService: ConfigService
  ) {
    this.useLocalStack        = this.configService.get('useLocalStack') == 1 ? true : false;
    this.awsHost              = this.configService.get('awsHost');
    this.awsRegion            = this.configService.get('awsRegion');
    this.awsAccessKeyId       = this.configService.get('awsAccessKeyId');
    this.awsSecretAccessKey   = this.configService.get('awsSecretAccessKey');
    this.adminSnsTopicArn     = this.configService.get('adminSnsTopicArn');
    this.adminSalesSqsUrl     = this.configService.get('adminSalesSqsUrl');
    
    // * configure SNS client
    const snsConfig = { 
      region: this.awsRegion,
      credentials: {
        accessKeyId: this.awsAccessKeyId,
        secretAccessKey: this.awsSecretAccessKey,
      },
    }

    if(this.useLocalStack)
      snsConfig['endpoint'] = this.awsHost;

    this.snsClient = new SNSClient(snsConfig);

    // * configure SQS client
    this.sqsClient = new SQSClient({ region: this.awsRegion});
  }

  sendMessage(messageDto: MessageDto): Promise<string> {
    
    // * sns
    if(
      messageDto.process == ProcessEnum.COMPANY_UPDATE ||
      messageDto.process == ProcessEnum.COMPANY_DELETE
    ){
      
      const command = new PublishCommand({
        TopicArn: this.adminSnsTopicArn,
        Message: JSON.stringify(messageDto)
      })
  
      this.logger.log(`sendMessage: command=${JSON.stringify(command)}`);

      return this.snsClient.send(command)
      .then( (result: any) => {
        return `message sent, messageId=${result.MessageId}`;
      })

    }

    // * sqs
    if(
      messageDto.process == ProcessEnum.USER_UPDATE ||
      messageDto.process == ProcessEnum.USER_DELETE 
    ){

      const command = new SendMessageCommand({
        QueueUrl: this.adminSalesSqsUrl,
        MessageBody: JSON.stringify(messageDto),
        DelaySeconds: 0
      });
  
      this.logger.log(`sendMessage: command=${JSON.stringify(command)}`);
      
      return this.sqsClient.send(command)
      .then( (result: any) => {
        return `message sent, messageId=${result.MessageId}`;
      })

    }

    throw new Error(`process not implement, process=${messageDto.process}`);

  }

}
