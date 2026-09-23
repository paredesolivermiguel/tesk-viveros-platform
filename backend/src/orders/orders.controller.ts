import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    const { tenantId, sub: userId, priceProfileId } = req.user;
    return this.orders.create(tenantId, userId, priceProfileId, dto);
  }

  @Get()
  list(@Req() req: any) {
    const { tenantId, sub: userId, role } = req.user;
    if (role === 'gestor') return this.orders.listForTenant(tenantId);
    return this.orders.listForUser(tenantId, userId);
  }
}
