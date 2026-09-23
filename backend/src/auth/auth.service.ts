import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

const MIGRATED_PLACEHOLDER = 'MIGRATED_RESET_REQUIRED';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { email, active: true } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    if (user.passwordHash === MIGRATED_PLACEHOLDER) {
      throw new UnauthorizedException(
        'Esta cuenta viene de la migracion desde WordPress y todavia no tiene contrasena nueva. Usa "Establecer contrasena" con tu email.',
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    return this.issueToken(user);
  }

  async setPassword(email: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { email, active: true } });
    if (!user) throw new NotFoundException('No existe ese usuario');

    // Solo se permite establecer contrasena nueva si viene de la migracion
    // (todavia no tiene una) - para cambiar una contrasena YA activa hara
    // falta un flujo de "olvide mi contrasena" aparte, no este.
    if (user.passwordHash !== MIGRATED_PLACEHOLDER) {
      throw new BadRequestException('Esta cuenta ya tiene una contrasena establecida.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return this.issueToken(user);
  }

  private async issueToken(user: { id: number; tenantId: number; email: string; role: string; priceProfileId: number | null }) {
    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      priceProfileId: user.priceProfileId,
    };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: payload,
    };
  }
}
