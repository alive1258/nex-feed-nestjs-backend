import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  parentCommentId?: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  postId: string;

  @ApiProperty()
  user?: Partial<User>;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  isLikedByCurrentUser: boolean;

  @ApiProperty({ type: [CommentResponseDto] })
  replies?: CommentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
