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
import { idParamSchema, setActiveSchema } from '../common/dto.ts';

import type { CreateAccountDto, UpdateAccountDto } from './accounts.dto.ts';
import type { Account } from './accounts.schema.ts';
import { createAccountSchema, updateAccountSchema } from './accounts.dto.ts';
import { AccountsExceptionFilter } from './accounts.filter.ts';
import { AccountsService } from './accounts.service.ts';

@Controller('/users/:userId/accounts')
@UseFilters(AccountsExceptionFilter)
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Get(':id')
    async findById(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) id: number,
    ): Promise<Account> {
        return await this.accountsService.findById(userId, id);
    }

    @Get()
    async findAll(
        @Param('userId', { schema: idParamSchema }) userId: number,
    ): Promise<Account[]> {
        return await this.accountsService.findAll(userId);
    }

    @Post()
    async create(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Body({ schema: createAccountSchema }) data: CreateAccountDto,
    ): Promise<Account> {
        return await this.accountsService.create(userId, data);
    }

    @Patch(':id')
    async update(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) id: number,
        @Body({ schema: updateAccountSchema }) data: UpdateAccountDto,
    ): Promise<Account> {
        return await this.accountsService.update(userId, id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) id: number,
    ): Promise<void> {
        await this.accountsService.delete(userId, id);
    }

    @Patch(':id/active')
    async setActive(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) id: number,
        @Body({ schema: setActiveSchema }) data: SetActiveDto,
    ): Promise<Account> {
        return await this.accountsService.setActive(userId, id, data.active);
    }
}
