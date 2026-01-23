import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../user/user.entity';

export class RegisterDto {
    @IsEmail()
    email: string;
    @IsString()
    @MinLength(6)
    password: string;
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}