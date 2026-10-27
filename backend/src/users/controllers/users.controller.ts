import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateMotivationDto } from '../dto/update-motivation.dto';
import { SaveUserDataDto } from '../dto/save-user-data.dto';
import { User } from '../entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar um novo usuário/jogador',
    description:
      'Cria um usuário inicializando seus atributos de gamificação (Level 1, 0 XP, 0 Moedas).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário cadastrado com sucesso.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de validação incorretos.',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna a lista de usuários com seu progresso e atributos de gamificação.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista recuperada com sucesso.',
    type: [User],
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar perfil e status de gamificação',
    description:
      'Retorna os dados do jogador incluindo nível atual, XP acumulado e saldo de moedas.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único do usuário',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário encontrado com sucesso.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar dados ou progresso do usuário',
    description: 'Permite atualizar informações cadastrais ou atributos do usuário.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a atualizar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário atualizado com sucesso.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Get(':id/motivation')
  @ApiOperation({ summary: 'Buscar a motivação do jogador', description: 'Frase do quadro-negro e foto do porta-retrato (vazias se ainda não foram escritas).' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Motivação do jogador.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuário não encontrado.' })
  async getMotivation(@Param('id') id: string) {
    return this.usersService.getMotivation(id);
  }

  @Put(':id/motivation')
  @ApiOperation({ summary: 'Salvar a motivação do jogador', description: 'Grava a frase e, opcionalmente, a foto. Enviar photo: null remove a foto.' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Motivação salva.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Frase longa demais ou foto inválida.' })
  async saveMotivation(@Param('id') id: string, @Body() dto: UpdateMotivationDto) {
    return this.usersService.saveMotivation(id, dto);
  }

  @Get(':id/storage')
  @ApiOperation({ summary: 'Buscar os dados sincronizados do jogador', description: 'Metas, diário, baús, perfil, preferências... (uma entrada por chave, com updatedAt).' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  async listData(@Param('id') id: string) {
    return this.usersService.listData(id);
  }

  @Put(':id/storage/:key')
  @ApiOperation({ summary: 'Salvar uma chave de dados do jogador', description: 'Guarda o conteúdo (texto JSON) de uma chave do navegador, como "farminghabit.goals.v1".' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiParam({ name: 'key', description: 'Chave, no formato farminghabit.nome.v1' })
  async saveData(@Param('id') id: string, @Param('key') key: string, @Body() dto: SaveUserDataDto) {
    return this.usersService.saveData(id, key, dto);
  }

  @Delete(':id/storage/:key')
  @ApiOperation({ summary: 'Apagar uma chave de dados do jogador' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiParam({ name: 'key', description: 'Chave, no formato farminghabit.nome.v1' })
  async deleteData(@Param('id') id: string, @Param('key') key: string) {
    return this.usersService.deleteData(id, key);
  }

  @Delete(':id/data')
  @ApiOperation({
    summary: 'Apagar os dados do jogador, mantendo a conta',
    description:
      'Remove missões, compras, hábitos e recompensas próprias do usuário e zera o progresso (Level 1, 0 XP, 0 Moedas). Nome e e-mail continuam.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dados apagados; retorna o usuário zerado.', type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuário não encontrado.' })
  async resetData(@Param('id') id: string): Promise<User> {
    return this.usersService.resetData(id);
  }
}
