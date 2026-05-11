import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { Request } from 'express';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/enums/permission-type.enum';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}
  // likes.controller.ts

  /**
   * Toggle Like
   */
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @RequirePermissions(Permission.LIKES_CREATE)
  @Post('toggle')
  toggleLike(@Req() req: Request, @Body() createLikeDto: CreateLikeDto) {
    return this.likesService.toggleLike(req, createLikeDto);
  }

  /**
   * Get Likes Count
   */
  @Get('count')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @RequirePermissions(Permission.LIKES_VIEW)
  getLikesCount(
    @Query('postId') postId?: string,
    @Query('commentId') commentId?: string,
  ) {
    return this.likesService.getLikesCount(postId, commentId);
  }
}
