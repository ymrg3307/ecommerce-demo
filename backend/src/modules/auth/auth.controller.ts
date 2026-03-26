import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace('Bearer ', '').trim();
    if (!token) {
      return { success: true };
    }

    return this.authService.logout(token);
  }
}
