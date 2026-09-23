import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Guard simple basado en @nestjs/jwt (sin passport, para mantener el
// arranque minimo). Se usa desde AuthGuard mas abajo.
@Injectable()
export class TokenReader {
  constructor(private jwt: JwtService) {}

  verify(token: string) {
    return this.jwt.verify(token);
  }
}
