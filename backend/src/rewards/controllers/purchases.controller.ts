import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PurchasesService } from '../services/purchases.service';
import { UpdatePurchaseDto } from '../dto/update-purchase.dto';
import { Purchase } from '../entities/purchase.entity';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user';

@ApiTags('purchases')
@ApiBearerAuth()
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar compras do jogador',
    description:
      'Retorna o histórico de compras da loja, das mais recentes para as mais antigas.',
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
  async findAll(@CurrentUser() user: AuthUser): Promise<Purchase[]> {
    return this.purchasesService.findAll(user.id);
  }

  @Patch(':id')
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
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    return this.purchasesService.setUsed(id, updatePurchaseDto.used, user.id);
  }
}
