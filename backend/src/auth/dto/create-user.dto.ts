import { IsEmail, IsString,IsNotEmpty, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}