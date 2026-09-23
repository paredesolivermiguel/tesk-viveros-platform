import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  catalog(@Req() req: any, @Query('search') search?: string) {
    const { tenantId, priceProfileId, role } = req.user;
    return this.products.catalogFor(tenantId, priceProfileId, role === 'gestor', search);
  }
}
