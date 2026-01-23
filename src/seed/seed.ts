import { AppDataSource } from '../data-source';
import { User, UserRole } from '../modules/user/user.entity';
import { Anime } from '../modules/anime/entities/anime.entity';
import * as bcrypt from 'bcrypt';
async function bootstrap() {
    try {
        // 1. Inicializa a conexão
        await AppDataSource.initialize();
        console.log('📦 Conectado ao banco de dados para Seed!');

        // 2. Repositórios
        const userRepository = AppDataSource.getRepository(User);
        const animeRepository = AppDataSource.getRepository(Anime);

        // (Opcional) Limpar tabelas antes de popular
        // await animeRepository.delete({});
        // await userRepository.delete({});

        // 3. Criar Usuário Admin
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('123456', salt);

        const admin = userRepository.create({
            email: 'admin@teste.com',
            password: passwordHash,
            role: UserRole.ADMIN, // 👈 USE O ENUM AQUI (em vez de 'admin')
        })

        // Verifica se já existe para não dar erro de duplicidade
        const adminExists = await userRepository.findOneBy({ email: admin.email });
        if (!adminExists) {
            await userRepository.save(admin);
            console.log('✅ Usuário Admin criado: admin@teste.com / 123456');
        } else {
            console.log('⚠️ Admin já existe.');
        }

        // 4. Criar Animes Iniciais
        const animes = [
            {
                titulo: 'One Piece',
                descricao: 'Pirata que estica.',
                genero: 'Aventura',
                foto: 'uploads/onepiece.jpg',
            },
            {
                titulo: 'Dragon Ball Z',
                descricao: 'Lutas e gritos.',
                genero: 'Ação',
                foto: 'uploads/dbz.jpg',
            },
        ];

        for (const data of animes) {
            // Verifica se já existe pelo título
            const exists = await animeRepository.findOneBy({ titulo: data.titulo });
            if (!exists) {
                await animeRepository.save(animeRepository.create(data));
                console.log(`✅ Anime criado: ${data.titulo}`);
            }
        }

        console.log('🌱 Seed finalizado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro no Seed:', error);
        process.exit(1);
    }
}

bootstrap();