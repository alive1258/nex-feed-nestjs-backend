// // import { HttpService } from '@nestjs/axios';
// // import { BadRequestException, Injectable } from '@nestjs/common';
// // import { ConfigService } from '@nestjs/config';
// // import { Express } from 'express';
// // import FormData from 'form-data';
// // import { lastValueFrom } from 'rxjs';

// // @Injectable()
// // export class UpdateFileUploadsProvider {
// //   constructor(
// //     private readonly httpService: HttpService,
// //     private readonly configService: ConfigService,
// //   ) {}

// //   public async handleUpdateFileUploads(
// //     currentFile: Express.Multer.File,
// //     oldFile: string,
// //   ): Promise<string> {
// //     if (!currentFile?.buffer) {
// //       return oldFile;
// //     }

// //     try {
// //       const imageUploadUrl = this.configService.get<string>(
// //         'appConfig.imageUploadUrl',
// //       );

// //       if (!imageUploadUrl) {
// //         throw new BadRequestException('Image upload URL not configured');
// //       }

// //       const formData = new FormData();

// //       formData.append('newFile', currentFile.buffer, {
// //         filename: currentFile.originalname,
// //         contentType: currentFile.mimetype,
// //       });

// //       formData.append('oldFile', oldFile);

// //       const response = await lastValueFrom(
// //         this.httpService.post<{ name: string }>(
// //           `${imageUploadUrl}/update`,
// //           formData,
// //           {
// //             headers: formData.getHeaders(),
// //           },
// //         ),
// //       );

// //       const updatedName = response.data?.name;

// //       if (!updatedName) {
// //         throw new BadRequestException(
// //           'The response did not contain a valid photo name.',
// //         );
// //       }

// //       return updatedName;
// //     } catch (err: unknown) {
// //       if (err instanceof Error) {
// //         throw new BadRequestException(`Image update failed: ${err.message}`);
// //       }
// //       throw new BadRequestException('Image update failed');
// //     }
// //   }
// // }

// import { BadRequestException, Inject, Injectable } from '@nestjs/common';
// import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';

// @Injectable()
// export class UpdateFileUploadsProvider {
//   constructor(
//     @Inject('CLOUDINARY')
//     private readonly cloudinary: typeof Cloudinary,
//   ) {}

//   async handleUpdateFileUploads(
//     currentFile: Express.Multer.File,
//     oldFile: string,
//   ): Promise<string> {
//     if (!currentFile?.buffer) {
//       return oldFile;
//     }

//     try {
//       if (oldFile) {
//         const publicId = oldFile.split('/').pop()?.split('.')[0];
//         if (publicId) {
//           await this.cloudinary.uploader.destroy(`uploads/${publicId}`);
//         }
//       }

//       return await new Promise<string>((resolve, reject) => {
//         this.cloudinary.uploader
//           .upload_stream(
//             { folder: 'uploads' },
//             (
//               error: Error | undefined,
//               result: UploadApiResponse | undefined,
//             ) => {
//               if (error) return reject(error);

//               if (!result || !result.secure_url) {
//                 return reject(
//                   new BadRequestException('Cloudinary upload failed'),
//                 );
//               }

//               resolve(result.secure_url);
//             },
//           )
//           .end(currentFile.buffer);
//       });
//     } catch (error: any) {
//       throw new BadRequestException(`Image update failed: ${error.message}`);
//     }
//   }
// }

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UpdateFileUploadsProvider {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof Cloudinary,
  ) {}

  async handleUpdateFileUploads(
    currentFile: Express.Multer.File,
    oldFile: string,
  ): Promise<string> {
    if (!currentFile?.buffer) {
      return oldFile;
    }

    try {
      if (oldFile) {
        const publicId = oldFile.split('/').pop()?.split('.')[0];
        if (publicId) {
          await this.cloudinary.uploader.destroy(`uploads/${publicId}`);
        }
      }

      return await new Promise<string>((resolve, reject) => {
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
          .end(currentFile.buffer);
      });
    } catch (error: any) {
      throw new BadRequestException(`Image update failed: ${error.message}`);
    }
  }
}
