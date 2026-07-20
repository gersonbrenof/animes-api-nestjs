import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    // 👇 Adicionado "as string" no final de cada resgate para satisfazer o modo estrito do TS
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID') as string;
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') as string;
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') as string;
    
    this.bucketName = this.configService.get<string>('AWS_STORAGE_BUCKET_NAME') as string;
    this.publicUrl = this.configService.get<string>('PUBLIC_R2_URL') as string;

    this.s3Client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region: 'auto',
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = extname(file.originalname);
    const key = `avatars/${uniqueSuffix}${fileExt}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return `${this.publicUrl}/${key}`;
    } catch (error) {
      throw new BadRequestException(`Erro ao realizar upload no R2: ${(error as Error).message}`);
    }
  }
}