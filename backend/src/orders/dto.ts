import { IsArray, IsIn, IsInt, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemInput {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(0)
  units: number;

  @IsInt()
  @Min(0)
  trays: number;
}

export class CreateOrderDto {
  @IsIn(['factura', 'contado'])
  paymentMethod: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];
}
