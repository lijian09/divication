import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WxLoginDto } from './dto/login.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/constants';

/**
 * 认证控制器
 * 处理微信登录、Token 刷新、登出
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 微信小程序登录
   */
  @Public()
  @Post('wx-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信小程序登录', description: '使用 wx.login() 获取的 code 进行登录' })
  @ApiResponse({ status: 200, description: '登录成功，返回 JWT Token 和用户信息' })
  @ApiResponse({ status: 401, description: '登录失败，code 无效' })
  async wxLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto.code);
  }

  /**
   * 刷新 Token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token', description: '使用 refresh_token 换取新的 JWT' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: 'refresh_token 无效或已过期' })
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  /**
   * 登出
   */
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登出', description: '将当前 Token 加入黑名单' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }
}
