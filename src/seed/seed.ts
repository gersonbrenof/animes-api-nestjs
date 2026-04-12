import { AppDataSource } from '../data-source';
import { User, UserRole } from '../modules/user/user.entity'; // Ajuste o caminho se necessário
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    try {
        // 1. Inicializa a conexão
        await AppDataSource.initialize();
        console.log('📦 Conectado ao banco de dados para Seed!');

        // 2. Repositórios (Removido o repositório de Anime)
        const userRepository = AppDataSource.getRepository(User);

        // (Opcional) Limpar tabelas antes de popular
        // await userRepository.delete({});

        // 3. Criar Usuário Admin
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('123456', salt);

        const admin = userRepository.create({
            email: 'admin@teste.com',
            password: passwordHash,
            role: UserRole.ADMIN, // 👈 Usa o Enum corretamente
        });

        // Verifica se já existe para não dar erro de duplicidade
        const adminExists = await userRepository.findOneBy({ email: admin.email });
        if (!adminExists) {
            await userRepository.save(admin);
            console.log('✅ Usuário Admin criado: admin@teste.com / 123456');
        } else {
            console.log('⚠️ Admin já existe.');
        }

        console.log('🌱 Seed finalizado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro no Seed:', error);
        process.exit(1);
    }
}

bootstrap();