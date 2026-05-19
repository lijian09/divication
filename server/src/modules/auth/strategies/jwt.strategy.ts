import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

/**
 * JWT 验证策略
 * 从请求头中提取 JWT，验证签名和过期时间，解析用户信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * JWT 验证通过后的回调
   * payload 包含 { sub: userId, openid, iat, exp }
   */
  async validate(payload: { sub: string; openid: string }) {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用或注销');
    }

    // 返回的 user 对象会挂载到 request.user
    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
    };
  }
}
