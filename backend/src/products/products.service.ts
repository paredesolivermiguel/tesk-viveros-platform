import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Catalogo para un usuario concreto. Clientes ven el precio de su
   * perfil; los gestores (sin perfil de precio propio) ven los tres
   * precios a la vez, para poder orientar a cualquier cliente.
   * Ofertas primero, despues novedades, despues el resto.
   */
  async catalogFor(tenantId: number, priceProfileId: number | null, isGestor: boolean, search?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        tenantId,
        active: true,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ isOffer: 'desc' }, { isNew: 'desc' }, { name: 'asc' }],
      include: { prices: { include: { priceProfile: true } } },
    });

    return products.map((p) => {
      let price: number | null = null;
      let pricesByProfile: { profile: string; price: number }[] | null = null;

      if (isGestor) {
        pricesByProfile = p.prices.map((pr) => ({
          profile: pr.priceProfile.name,
          price: Number(pr.price),
        }));
      } else {
        const priceRow = priceProfileId ? p.prices.find((pr) => pr.priceProfileId === priceProfileId) : undefined;
        price = priceRow ? Number(priceRow.price) : null;
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        imageUrl: p.imageUrl,
        trayEnabled: p.trayEnabled,
        unitsPerTray: p.unitsPerTray,
        isOffer: p.isOffer,
        isNew: p.isNew,
        sunInfo: p.sunInfo,
        waterInfo: p.waterInfo,
        price,
        pricesByProfile,
      };
    });
  }

  async findOne(tenantId: number, id: number) {
    return this.prisma.product.findFirst({ where: { id, tenantId }, include: { prices: true } });
  }
}
