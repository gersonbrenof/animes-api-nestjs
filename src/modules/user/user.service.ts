import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(email: string, password: string, role = UserRole.USER) {
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Usuário já existe');

    const hash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hash,
      role,
    });

    return this.userRepository.save(user);
  }

  // 🔹 Corrigido para number
  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}
