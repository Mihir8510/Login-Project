import { Controller, Get, Post, Body, UseGuards, Req, Patch } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { LoginUserDto } from "./dto/login-user.dto.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";
import { ChangePasswordDto } from "./dto/change-password.dto.js";
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { VerifyResetOtpDto } from "./dto/verify-reset-otp.dto.js";
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    getAuth() {
        
        return this.authService.getMessage();
    }

    @Post('register')
    register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Post('login')
    login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Post('forgot-password')
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('verify-reset-otp')
    verifyResetOtp(@Body() verifyResetOtpDto: VerifyResetOtpDto){
        return this.authService.verifyResetOtp(verifyResetOtpDto);
    }
    
    @Post('reset-password')
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Get('users')
    getAllUsers() {
        return this.authService.getAllUsers();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Req() req: any) {
        return {
            message: 'You are authenticated!',
            user: req.user,
        };
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
        return this.authService.updateProfile(
            req.user.userId,
            updateProfileDto,
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('change-password')
    changePassword(
        @Req() req: any,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(
            req.user.userId,
            changePasswordDto,
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    logout(@Req() req: any) {
        return this.authService.logout(req.user.userId);
    }

}