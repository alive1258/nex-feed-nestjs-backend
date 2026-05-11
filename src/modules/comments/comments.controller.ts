// src/modules/comments/comments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Req,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/enums/permission-type.enum';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import type { Request } from 'express';
import { CommentResponseDto } from './dto/comment-response.dto';

@Controller('comments')
@UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiDoc({
    summary: 'Create Comment',
    description: 'Creates a new comment on a post',
    response: CreateCommentDto,
    status: HttpStatus.CREATED,
  })
  @RequirePermissions(Permission.COMMENTS_CREATE)
  @Post('post/:postId')
  create(
    @Req() req: Request,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(req, postId, createCommentDto);
  }

  @ApiDoc({
    summary: 'Get Post Comments',
    description: 'Get all comments for a specific post',
    response: CommentResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.COMMENTS_VIEW)
  @Get('post/:postId')
  findByPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Req() req: Request,
  ) {
    return this.commentsService.findByPost(postId, req);
  }

  @ApiDoc({
    summary: 'Get Comment by ID',
    description: 'Get a single comment by ID',
    response: CommentResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.COMMENTS_VIEW)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.commentsService.getCommentWithLikeStatus(id, req);
  }

  @ApiDoc({
    summary: 'Update Comment',
    description: 'Update an existing comment',
    response: CommentResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.COMMENTS_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, req, updateCommentDto);
  }

  @ApiDoc({
    summary: 'Delete Comment',
    description: 'Delete a comment',
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.COMMENTS_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.commentsService.remove(id, req);
  }

  @ApiDoc({
    summary: 'Get Comment Replies',
    description: 'Get all replies for a comment',
    response: CommentResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.COMMENTS_VIEW)
  @Get(':id/replies')
  getReplies(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.commentsService.getReplies(id, req);
  }
}
