import {
  Controller,
  Get,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateMotivationDto } from '../dto/update-motivation.dto';
import { SaveUserDataDto } from '../dto/save-user-data.dto';
import { ResetUserDataDto } from '../dto/reset-user-data.dto';
import { User } from '../entities/user.entity';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user';

/** Todas as rotas são do jogador logado: o id vem do token, nunca da URL */
@ApiTags('users')
@ApiBearerAuth()
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar perfil e status de gamificação',
    description: 'Dados do jogador logado: nível, XP acumulado e saldo de moedas. Cria o jogador no primeiro acesso.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Jogador do token.', type: User })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token ausente, inválido ou expirado.' })
  async getMe(@CurrentUser() user: AuthUser): Promise<User> {
    return this.usersService.findOne(user.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Atualizar dados ou progresso do jogador',
    description: 'Nome, nível, XP e moedas do jogador logado.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Jogador atualizado com sucesso.', type: User })
  async update(@CurrentUser() user: AuthUser, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Get('motivation')
  @ApiOperation({ summary: 'Buscar a motivação do jogador', description: 'Frase do quadro-negro e foto do porta-retrato (vazias se ainda não foram escritas).' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Motivação do jogador.' })
  async getMotivation(@CurrentUser() user: AuthUser) {
    return this.usersService.getMotivation(user.id);
  }

  @Put('motivation')
  @ApiOperation({ summary: 'Salvar a motivação do jogador', description: 'Grava a frase e, opcionalmente, a foto. Enviar photo: null remove a foto.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Motivação salva.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Frase longa demais ou foto inválida.' })
  async saveMotivation(@CurrentUser() user: AuthUser, @Body() dto: UpdateMotivationDto) {
    return this.usersService.saveMotivation(user.id, dto);
  }

  @Get('storage')
  @ApiOperation({ summary: 'Buscar os dados sincronizados do jogador', description: 'Metas, diário, baús, perfil, preferências... (uma entrada por chave, com updatedAt).' })
  async listData(@CurrentUser() user: AuthUser) {
    return this.usersService.listData(user.id);
  }

  @Put('storage/:key')
  @ApiOperation({ summary: 'Salvar uma chave de dados do jogador', description: 'Guarda o conteúdo (texto JSON) de uma chave do navegador, como "farminghabit.goals.v1".' })
  @ApiParam({ name: 'key', description: 'Chave, no formato farminghabit.nome.v1' })
  async saveData(@CurrentUser() user: AuthUser, @Param('key') key: string, @Body() dto: SaveUserDataDto) {
    return this.usersService.saveData(user.id, key, dto);
  }

  @Delete('storage/:key')
  @ApiOperation({ summary: 'Apagar uma chave de dados do jogador' })
  @ApiParam({ name: 'key', description: 'Chave, no formato farminghabit.nome.v1' })
  async deleteData(@CurrentUser() user: AuthUser, @Param('key') key: string) {
    return this.usersService.deleteData(user.id, key);
  }

  @Delete('data')
  @ApiOperation({
    summary: 'Apagar partes escolhidas dos dados do jogador, mantendo a conta',
    description:
      'Cada parte em "scopes" é apagada numa única transação: goals (metas e histórico), diary (diário e aventuras), missions, shop (compras, recompensas próprias e favoritos), treasure (baús e coleção), motivation (frase e foto) e progress (volta para Level 1, 0 XP, 0 Moedas). Nome, e-mail, perfil e preferências continuam.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Partes apagadas; retorna o jogador atualizado.', type: User })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Nenhuma parte escolhida ou parte desconhecida.' })
  async resetData(@CurrentUser() user: AuthUser, @Query() query: ResetUserDataDto): Promise<User> {
    return this.usersService.resetData(user.id, query.scopes);
  }
}
