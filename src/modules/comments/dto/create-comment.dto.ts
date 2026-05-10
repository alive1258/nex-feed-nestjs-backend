import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is a sample comment content.',
  })
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiProperty({
    description: 'UUID of the parent comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  parentCommentId?: string;
}
