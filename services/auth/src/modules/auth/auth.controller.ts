import { Body, Controller, Get, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

function extractBearerToken(authorization?: string) {
  return authorization?.replace('Bearer ', '').trim();
}

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
    const token = extractBearerToken(authorization);
    if (!token) {
      return { success: true };
    }

    return this.authService.logout(token);
  }

  @Get('session')
  @HttpCode(200)
  session(@Headers('authorization') authorization?: string) {
    const token = extractBearerToken(authorization);
    if (!token) {
      throw new UnauthorizedException('Missing session token.');
    }

    return this.authService.getSession(token);
  }
}
