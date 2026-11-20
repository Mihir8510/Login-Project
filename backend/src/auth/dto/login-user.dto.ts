import { IsEmail, IsString, MinLength,IsNotEmpty } from 'class-validator';

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string;
}