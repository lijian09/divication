import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * 用户控制器
 */
@ApiTags('user')
@ApiBearerAuth('JWT-auth')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前用户信息
   */
  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  /**
   * 更新用户信息
   */
  @Put('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  /**
   * 确认免责协议
   */
  @Put('me/agreement')
  @ApiOperation({ summary: '确认免责协议' })
  @ApiResponse({ status: 200, description: '确认成功' })
  async acceptAgreement(@CurrentUser('id') userId: string) {
    return this.userService.acceptAgreement(userId);
  }
}
