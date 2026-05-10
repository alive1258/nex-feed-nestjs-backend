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
  UseInterceptors,
  Req,
  UploadedFile,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/enums/permission-type.enum';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { PostResponseDto } from './dto/post-response.dto';
import { MulterFile } from 'src/common/types/file.types';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiDoc({
    summary: 'Create Post',
    description: 'Creates a new post. Requires proper permission.',
    response: CreatePostDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.POSTS_CREATE)
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  create(
    @Req() req: Request,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.postsService.create(req, createPostDto, file);
  }

  @ApiDoc({
    summary: 'Get Feed Posts',
    description: "Get all public posts and user's private posts",
    response: PostResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.POSTS_VIEW)
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get('feed')
  findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.postsService.findAll(req, page, limit);
  }

  @ApiDoc({
    summary: 'Get Post by ID',
    description: 'Get a single post by ID',
    response: PostResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.POSTS_VIEW)
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.postsService.getPostWithLikeStatus(id, req);
  }

  @ApiDoc({
    summary: 'Update Post',
    description: 'Update an existing post',
    response: PostResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.POSTS_UPDATE)
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.postsService.update(id, req, updatePostDto, file);
  }

  @ApiDoc({
    summary: 'Delete Post',
    description: 'Delete a post',
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.POSTS_DELETE)
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.postsService.remove(id, req);
  }

  @ApiDoc({
    summary: 'Get User Posts',
    description: 'Get all posts by a specific user',
    response: PostResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.POSTS_VIEW)
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.postsService.findByUser(userId, req, page, limit);
  }
}
