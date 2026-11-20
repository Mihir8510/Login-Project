import { JwtService } from '@nestjs/jwt';
import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { LoginUserDto } from "./dto/login-user.dto.js";
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { MailService } from '../mail/mail.service.js';
import * as bcrypt from "bcrypt";
import { randomInt } from 'node:crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto.js';
@Injectable()
export class AuthService{
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}
    getMessage(){
        return 'Message from AuthService!';
    }
    async register(createUserDto:CreateUserDto){
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    try{
        const user = await this.prisma.user.create({
            data: {
                name: createUserDto.name,
                email: createUserDto.email,
                password: hashedPassword,
            },
        });

        return {
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }   catch (error) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Email already registered');
            }
            throw error;
        }
    }
    async login(loginUserDto: LoginUserDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: loginUserDto.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(
            loginUserDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            tokenVersion: user.tokenVersion,
        });

        return {
            message: 'Login successful',
            access_token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }

    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
    }

    async updateProfile(
        userId: number,
        updateProfileDto: UpdateProfileDto,
    ) {
        try {
            return await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    ...(updateProfileDto.name !== undefined && {
                        name: updateProfileDto.name,
                    }),
                    ...(updateProfileDto.email !== undefined && {
                        email: updateProfileDto.email,
                    }),
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                },
            });
        } catch (error) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Email already registered');
            }

            throw error;
        }
    }

    async changePassword(
        userId: number,
        changePasswordDto: ChangePasswordDto,
    ) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            changePasswordDto.currentPassword,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(
            changePasswordDto.newPassword,
            10,
        );

        await this.prisma.user.update({
            where: { id: userId },
            data: { 
                password: hashedPassword,
                tokenVersion:{increment:1},
            },
        });

        return {
            message: 'Password changed successfully',
        };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: forgotPasswordDto.email },
        });

        if (!user) {
            return {
                message: 'If the email is registered, an OTP will be sent.',
            };
        }

        const otp = randomInt(100000, 1000000).toString();

        const otpHash = await bcrypt.hash(otp, 10);

        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetOtpHash: otpHash,
                resetOtpExpiry: otpExpiry,
            },
        });

        await this.mailService.sendOtpEmail(user.email, otp);

        return {
            message: 'If the email is registered, an OTP will be sent.',
        };
    }

    async verifyResetOtp(verifyResetOtpDto: VerifyResetOtpDto){
        const user = await this.prisma.user.findUnique({
            where:{
                email:verifyResetOtpDto.email,
            },
        });
        if(
            !user ||
            !user.resetOtpHash ||
            !user.resetOtpExpiry ||
            user.resetOtpExpiry < new Date()
        ){
            throw new BadRequestException('Invalid or expired OTP');
        }
        const isOtpValid = await bcrypt.compare(
            verifyResetOtpDto.otp,
            user.resetOtpHash,
        );
        if (!isOtpValid){
            throw new BadRequestException('Invalid or expired OTP');
        }
        await this.prisma.user.update({
            where:{ id: user.id},
            data: {
                resetOtpVerified:true,
            },
        });
        return{
            message:"OTP verified successfully!",
        };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: resetPasswordDto.email },
        });

        if (
            !user ||
            !user.resetOtpHash ||
            !user.resetOtpExpiry ||
            !user.resetOtpVerified
        ) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        if (user.resetOtpExpiry < new Date()) {
            throw new BadRequestException('OTP has expired');
        }

        const isOtpValid = await bcrypt.compare(
            resetPasswordDto.otp,
            user.resetOtpHash,
        );

        if (!isOtpValid) {
            throw new BadRequestException('Invalid OTP');
        }

        const hashedPassword = await bcrypt.hash(
            resetPasswordDto.newPassword,
            10,
        );

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetOtpHash: null,
                resetOtpExpiry: null,
                resetOtpVerified:false,
                tokenVersion: { increment: 1 },
            },
        });

        return {
            message: 'Password reset successfully',
        };
    }
    
    async logout(userId: number) {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                tokenVersion: {
                    increment: 1,
                },
            },
        });

        return {
            message: 'Logout successful',
        };
    }
}