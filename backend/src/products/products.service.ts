import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Catalogo para un usuario concreto: precio segun su perfil, y
   * ofertas primero, despues novedades, despues el resto - la misma
   * regla que arreglamos varias veces en WordPress, aqui es una sola
   * consulta ordenada por dos columnas booleanas, sin ambiguedad
   * posible entre "API REST" y "consulta clasica" como pasaba alli.
   */
  async catalogFor(tenantId: number, priceProfileId: number | null) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, active: true },
      orderBy: [{ isOffer: 'desc' }, { isNew: 'desc' }, { name: 'asc' }],
      include: { prices: true },
    });

    return products.map((p) => {
      const priceRow = priceProfileId ? p.prices.find((pr) => pr.priceProfileId === priceProfileId) : undefined;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        imageUrl: p.imageUrl,
        trayEnabled: p.trayEnabled,
        unitsPerTray: p.unitsPerTray,
        isOffer: p.isOffer,
        isNew: p.isNew,
        price: priceRow ? Number(priceRow.price) : null,
      };
    });
  }

  async findOne(tenantId: number, id: number) {
    return this.prisma.product.findFirst({ where: { id, tenantId }, include: { prices: true } });
  }
}
