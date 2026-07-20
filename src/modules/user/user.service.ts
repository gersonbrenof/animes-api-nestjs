import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  // Criação de usuário com suporte opcional à foto de perfil (Google Login ou Local)
  async createUser(
    nome: string,
    email: string,
    password: string,
    role = UserRole.USER,
    foto?: string,
  ) {
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Usuário já existe');

    const hash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      nome,
      email,
      password: hash,
      role,
      foto, // Salva a URL da foto de perfil
    });

    return this.userRepository.save(user);
  }

  // Busca simples por ID (usada internamente)
  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  // Busca simples por Email (usada no login)
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  // Retorna os dados do perfil sem expor o hash da senha por segurança
  async getProfile(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const { password, ...perfilSemSenha } = user;
    return perfilSemSenha;
  }

  // 👇 NOVO MÉTODO: Atualiza as informações do usuário (incluindo a URL da foto do R2)
  async update(
    id: number,
    updateData: { nome?: string; email?: string; password?: string; foto?: string },
  ) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Validação caso o usuário esteja tentando alterar o e-mail
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await this.findByEmail(updateData.email);
      if (emailExists) throw new BadRequestException('E-mail já está em uso por outro usuário');
      user.email = updateData.email;
    }

    if (updateData.nome) {
      user.nome = updateData.nome;
    }

    // Aqui você passa a URL pública gerada pelo Cloudflare R2
    if (updateData.foto) {
      user.foto = updateData.foto;
    }

    // Se o usuário estiver alterando a senha, criptografa a nova senha antes de salvar
    if (updateData.password) {
      user.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await this.userRepository.save(user);

    // Retorna o perfil atualizado de forma segura (sem a senha)
    const { password, ...perfilSemSenha } = updatedUser;
    return perfilSemSenha;
  }
}