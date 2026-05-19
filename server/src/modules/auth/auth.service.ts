import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { UserService } from '../user/user.service';
import { DisclaimerLog } from './entities/disclaimer-log.entity';

/**
 * 微信 code2Session 接口响应
 */
interface WxCode2SessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

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
    @InjectRepository(DisclaimerLog)
    private readonly disclaimerLogRepository: Repository<DisclaimerLog>,
  ) {}

  /**
   * 微信小程序登录
   * 1. 用 code 换取 openid（调用微信 code2Session 接口）
   * 2. 查询或创建用户
   * 3. 签发 JWT + refresh_token
   */
  async wxLogin(code: string) {
    this.logger.log(`[DEBUG] 微信登录，code: ${code}`);

    // 调用微信 code2Session 接口
    const wxResponse = await this.callWxCode2Session(code);
    const { openid, session_key, unionid } = wxResponse;

    // 查询或创建用户
    let user = await this.userService.findByOpenid(openid);
    if (!user) {
      user = await this.userService.create({
        openid,
        unionid: unionid || null,
      });
      this.logger.log(`[DEBUG] 新用户注册，openid: ${openid}`);
    }

    // 签发 Token
    const tokens = await this.generateTokens(user.id, openid);

    // 更新最后登录时间
    await this.userService.updateLastLogin(user.id);

    // session_key 暂不持久化（后续可存 Redis）
    this.logger.log(`[DEBUG] 用户登录成功，userId: ${user.id}`);

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
   * 确认免责协议
   * 1. 更新用户 agreement_accepted 状态
   * 2. 写入 disclaimer_logs 日志（含 IP、UA、版本）
   */
  async acceptAgreement(
    userId: string,
    agreementVersion: string,
    ipAddress: string,
    userAgent: string,
  ) {
    // 更新用户状态
    await this.userService.acceptAgreement(userId);

    // 写入确认日志
    const log = this.disclaimerLogRepository.create({
      user_id: userId,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      agreement_version: agreementVersion,
    });
    await this.disclaimerLogRepository.save(log);

    this.logger.log(`[DEBUG] 用户 ${userId} 确认免责协议 v${agreementVersion}`);

    return {
      message: '已确认免责协议',
      agreement_accepted: true,
      agreement_version: agreementVersion,
    };
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
   * 调用微信 code2Session 接口
   * 将 wx.login() 获取的临时 code 换取 openid 和 session_key
   */
  private async callWxCode2Session(code: string): Promise<WxCode2SessionResponse> {
    const appId = this.configService.get<string>('wechat.appId');
    const secret = this.configService.get<string>('wechat.secret');

    if (!appId || !secret) {
      this.logger.error('[FATAL] 微信 appId 或 secret 未配置，使用 mock 数据');
      // 开发环境降级：未配置时返回 mock 数据
      return { openid: `mock_openid_${code}`, session_key: 'mock_session_key' };
    }

    const url = 'https://api.weixin.qq.com/sns/jscode2session';

    try {
      const response = await axios.get<WxCode2SessionResponse>(url, {
        params: {
          appid: appId,
          secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
        timeout: 5000,
      });

      const data = response.data;

      // 微信接口返回错误
      if (data.errcode) {
        this.logger.error(`[DEBUG] 微信 code2Session 失败: ${data.errcode} - ${data.errmsg}`);
        throw new UnauthorizedException(`微信登录失败: ${data.errmsg}`);
      }

      this.logger.log(`[DEBUG] 微信 code2Session 成功，openid: ${data.openid}`);
      return data;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`[DEBUG] 调用微信接口异常: ${error.message}`);

      // 开发环境降级：网络异常时使用 mock 数据
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn('[DEBUG] 开发环境降级，使用 mock openid');
        return { openid: `mock_openid_${code}`, session_key: 'mock_session_key' };
      }

      throw new UnauthorizedException('微信服务暂时不可用，请稍后重试');
    }
  }
}
