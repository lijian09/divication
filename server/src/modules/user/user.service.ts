import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * 用户服务
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 根据 OpenID 查找用户
   */
  async findByOpenid(openid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { openid } });
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 创建用户
   */
  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  /**
   * 获取用户详情
   */
  async getProfile(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 不返回敏感字段
    const { ...profile } = user;
    return profile;
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  /**
   * 确认免责协议
   */
  async acceptAgreement(userId: string) {
    await this.userRepository.update(userId, {
      agreement_accepted: true,
      agreement_accepted_at: new Date(),
    });

    this.logger.log(`[DEBUG] 用户 ${userId} 确认免责协议`);
    return { message: '已确认免责协议' };
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(userId: string) {
    await this.userRepository.update(userId, {
      last_login_at: new Date(),
    });
  }
}
