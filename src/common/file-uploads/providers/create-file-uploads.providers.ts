// import { HttpService } from '@nestjs/axios';
// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import FormData from 'form-data';
// import { lastValueFrom } from 'rxjs';

// @Injectable()
// export class FileUploadsProvider {
//   constructor(
//     private readonly httpService: HttpService,
//     private readonly configService: ConfigService,
//   ) {}

//   public async handleFileUploads(
//     files: Express.Multer.File[],
//   ): Promise<string[]> {
//     if (!files || files.length === 0) {
//       throw new NotFoundException('No file(s) provided');
//     }

//     try {
//       const uploadPromises = files.map(async (file) => {
//         //  ALWAYS USE originalname
//         const filename = file.originalname;

//         //  MEMORY STORAGE (recommended)
//         if (file.buffer) {
//           const formData = new FormData();
//           formData.append('file', file.buffer, {
//             filename,
//             contentType: file.mimetype,
//           });

//           const imageUploadUrl = this.configService.get<string>(
//             'appConfig.imageUploadUrl',
//           );

//           if (!imageUploadUrl) {
//             throw new BadRequestException('Image upload URL not configured');
//           }

//           const response = await lastValueFrom(
//             this.httpService.post<{ name: string }>(
//               `${imageUploadUrl}/upload`,
//               formData,
//               { headers: formData.getHeaders() },
//             ),
//           );

//           return response.data.name;
//         }

//         //  if buffer is missing → config error
//         throw new BadRequestException('File buffer missing');
//       });

//       return await Promise.all(uploadPromises);
//     } catch (err) {
//       if (err instanceof Error) {
//         throw new BadRequestException(`File upload error: ${err.message}`);
//       }
//       throw new BadRequestException('File upload error');
//     }
//   }
// }

import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class FileUploadsProvider {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof Cloudinary,
  ) {}

  async handleFileUploads(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new NotFoundException('No file(s) provided');
    }

    try {
      const uploads = files.map((file) => {
        if (!file.buffer) {
          throw new BadRequestException('File buffer missing');
        }

        return new Promise<string>((resolve, reject) => {
          this.cloudinary.uploader
            .upload_stream(
              { folder: 'uploads' },
              (
                error: Error | undefined,
                result: UploadApiResponse | undefined,
              ) => {
                if (error) return reject(error);

                if (!result || !result.secure_url) {
                  return reject(
                    new BadRequestException('Cloudinary upload failed'),
                  );
                }

                resolve(result.secure_url);
              },
            )
            .end(file.buffer);
        });
      });

      return await Promise.all(uploads);
    } catch (error: any) {
      throw new BadRequestException(`File upload error: ${error.message}`);
    }
  }
}
