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

  // 👇 1. Adicione o 'nome' aqui como o primeiro parâmetro
  async createUser(nome: string, email: string, password: string, role = UserRole.USER) {
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Usuário já existe');

    const hash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      nome, // 👇 2. Adicione o 'nome' aqui para salvar no banco
      email,
      password: hash,
      role,
    });

    return this.userRepository.save(user);
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}