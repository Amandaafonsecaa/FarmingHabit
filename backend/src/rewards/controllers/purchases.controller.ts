import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PurchasesService } from '../services/purchases.service';
import { UpdatePurchaseDto } from '../dto/update-purchase.dto';
import { Purchase } from '../entities/purchase.entity';

@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar compras do jogador',
    description:
      'Retorna o histórico de compras da loja, das mais recentes para as mais antigas.',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'ID do jogador',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Histórico de compras.',
    type: [Purchase],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  async findAll(
    @Query('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
  ): Promise<Purchase[]> {
    return this.purchasesService.findAll(userId);
  }

  @Patch(':id')
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'ID do jogador proprietário da compra',
  })
  @ApiOperation({
    summary: 'Marcar compra como aproveitada',
    description:
      'Marca (ou desmarca) que a recompensa comprada já foi aproveitada.',
  })
  @ApiParam({ name: 'id', description: 'ID da compra' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compra atualizada.',
    type: Purchase,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Compra não encontrada.',
  })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    return this.purchasesService.setUsed(id, updatePurchaseDto.used, userId);
  }
}
