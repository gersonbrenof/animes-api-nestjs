import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole} from './user.entity';


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // cria um usuario normal
    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.userService.createUser(dto.email, dto.password, UserRole.USER);
    }
    // cria um usuario admin
    @Post('admin')
    createAdmim(@Body() dto: CreateUserDto) {
        return this.userService.createUser(
            dto.email,
            dto.password,
            UserRole.ADMIN
        );
    }

}
