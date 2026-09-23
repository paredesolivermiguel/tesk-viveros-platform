import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  catalog(@Req() req: any) {
    const { tenantId, priceProfileId } = req.user;
    return this.products.catalogFor(tenantId, priceProfileId);
  }
}
