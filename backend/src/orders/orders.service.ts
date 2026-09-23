import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeTrayUnits } from '../common/trays.util';
import { CreateOrderDto } from './dto';

const IVA_RATE = 0.21;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, userId: number, priceProfileId: number | null, dto: CreateOrderDto) {
    if (!priceProfileId) {
      throw new BadRequestException('Este usuario no tiene un perfil de precio asignado.');
    }
    if (dto.items.length === 0) {
      throw new BadRequestException('El pedido no tiene productos.');
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, tenantId },
      include: { prices: { where: { priceProfileId } } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems: {
      productId: number;
      trays: number;
      looseUnits: number;
      totalUnits: number;
      unitPrice: number;
      lineTotal: number;
    }[] = [];

    for (const item of dto.items) {
      const product = byId.get(item.productId);
      if (!product) throw new BadRequestException(`Producto ${item.productId} no encontrado.`);
      const priceRow = product.prices[0];
      if (!priceRow) throw new BadRequestException(`El producto "${product.name}" no tiene precio para tu perfil.`);

      // El servidor SIEMPRE recalcula bandejas/unidades y el total: nunca
      // se confia en lo que mande el cliente para el precio final.
      const norm = normalizeTrayUnits(item.units, item.trays, product.trayEnabled ? product.unitsPerTray : 1);
      const unitPrice = Number(priceRow.price);
      const lineTotal = Math.round(unitPrice * norm.totalUnits * 100) / 100;
      subtotal += lineTotal;

      lineItems.push({
        productId: product.id,
        trays: product.trayEnabled ? norm.trays : 0,
        looseUnits: product.trayEnabled ? norm.looseUnits : norm.totalUnits,
        totalUnits: norm.totalUnits,
        unitPrice,
        lineTotal,
      });
    }

    const vatAmount = dto.paymentMethod === 'factura' ? Math.round(subtotal * IVA_RATE * 100) / 100 : 0;
    const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;

    return this.prisma.order.create({
      data: {
        tenantId,
        userId,
        paymentMethod: dto.paymentMethod,
        vatAmount,
        totalAmount,
        status: 'recibido',
        items: { create: lineItems },
      },
      include: { items: true },
    });
  }

  async listForUser(tenantId: number, userId: number) {
    return this.prisma.order.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
  }

  async listForTenant(tenantId: number) {
    return this.prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } }, user: true },
    });
  }
}
