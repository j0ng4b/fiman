import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseFilters,
} from '@nestjs/common';

import type { SetActiveDto } from '../common/dto.ts';
import { idSchema, setActiveSchema } from '../common/dto.ts';
import type { CreateAccountDto, UpdateAccountDto } from './accounts.dto.ts';
import { createAccountSchema, updateAccountSchema } from './accounts.dto.ts';
import { AccountsExceptionFilter } from './accounts.filter.ts';
import { Account } from './accounts.schema.ts';
import { AccountsService } from './accounts.service.ts';

@Controller('/users/:userId/accounts')
@UseFilters(AccountsExceptionFilter)
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Get(':id')
    async findById(
        @Param('userId', { schema: idSchema }) userId: number,
        @Param('id', { schema: idSchema }) id: number,
    ): Promise<Account> {
        return await this.accountsService.findById(userId, id);
    }

    @Get()
    async findAll(
        @Param('userId', { schema: idSchema }) userId: number,
    ): Promise<Account[]> {
        return await this.accountsService.findAll(userId);
    }

    @Post()
    async create(
        @Param('userId', { schema: idSchema }) userId: number,
        @Body({ schema: createAccountSchema }) data: CreateAccountDto,
    ): Promise<Account> {
        return await this.accountsService.create(userId, data);
    }

    @Patch(':id')
    async update(
        @Param('userId', { schema: idSchema }) userId: number,
        @Param('id', { schema: idSchema }) id: number,
        @Body({ schema: updateAccountSchema }) data: UpdateAccountDto,
    ): Promise<Account> {
        return await this.accountsService.update(userId, id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('userId', { schema: idSchema }) userId: number,
        @Param('id', { schema: idSchema }) id: number,
    ): Promise<void> {
        await this.accountsService.delete(userId, id);
    }

    @Patch(':id/active')
    async setActive(
        @Param('userId', { schema: idSchema }) userId: number,
        @Param('id', { schema: idSchema }) id: number,
        @Body({ schema: setActiveSchema }) data: SetActiveDto,
    ): Promise<Account> {
        return await this.accountsService.disable(userId, id, !data.active);
    }
}
