import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

/**
 * 认证服务
 * 处理微信登录、Token 签发/刷新/吊销
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  /**
   * 微信小程序登录
   * 1. 用 code 换取 openid（调用微信 code2Session 接口）
   * 2. 查询或创建用户
   * 3. 签发 JWT + refresh_token
   */
  async wxLogin(code: string) {
    this.logger.log(`[DEBUG] 微信登录，code: ${code}`);

    // TODO: 调用微信 code2Session 接口
    // const wxResponse = await this.callWxCode2Session(code);
    // const { openid, session_key } = wxResponse;

    // 骨架：使用模拟数据
    const openid = `mock_openid_${code}`;

    // 查询或创建用户
    let user = await this.userService.findByOpenid(openid);
    if (!user) {
      user = await this.userService.create({ openid });
    }

    // 签发 Token
    const tokens = await this.generateTokens(user.id, openid);

    // 更新最后登录时间
    await this.userService.updateLastLogin(user.id);

    return {
      ...tokens,
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        agreement_accepted: user.agreement_accepted,
      },
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('refresh_token 不能为空');
    }

    // TODO: 从 Redis 校验 refresh_token
    // const storedToken = await this.redisService.get(`refresh:${userId}`);
    // if (storedToken !== refreshToken) {
    //   throw new UnauthorizedException('refresh_token 无效');
    // }

    this.logger.log('[DEBUG] Token 刷新（骨架实现）');
    throw new UnauthorizedException('refresh_token 无效（骨架实现）');
  }

  /**
   * 登出 — 将 Token 加入黑名单
   */
  async logout(userId: string) {
    this.logger.log(`[DEBUG] 用户登出: ${userId}`);
    // TODO: 将 token 加入 Redis 黑名单
    return { message: '已登出' };
  }

  /**
   * 生成 JWT 和 refresh_token
   */
  private async generateTokens(userId: string, openid: string) {
    const payload = { sub: userId, openid };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '30d'),
    });

    // TODO: refresh_token 存入 Redis（TTL 30 天）
    // await this.redisService.set(`refresh:${userId}`, refreshToken, 30 * 24 * 60 * 60);

    return {
      token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * 调用微信 code2Session 接口（骨架）
   */
  private async callWxCode2Session(code: string) {
    const appId = this.configService.get<string>('wechat.appId');
    const secret = this.configService.get<string>('wechat.secret');
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    // TODO: 使用 axios 调用微信接口
    // const response = await axios.get(url);
    // return response.data;

    this.logger.warn(`[骨架] 调用微信接口: ${url}`);
    return { openid: `mock_openid_${code}`, session_key: 'mock_session_key' };
  }
}
