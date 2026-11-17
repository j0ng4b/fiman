import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseFilters,
} from '@nestjs/common';

import { idParamSchema } from '../common/dto.ts';

import type {
    CreateTransactionDto,
    RealizeTransactionDto,
    ReverseTransactionDto,
    UpdateTransactionDto,
} from './transactions.dto.ts';
import type { Transaction } from './transactions.schema.ts';
import {
    createTransactionSchema,
    realizeTransactionSchema,
    reverseTransactionSchema,
    updateTransactionSchema,
} from './transactions.dto.ts';
import { TransactionsExceptionFilter } from './transactions.filter.ts';
import { TransactionsService } from './transactions.service.ts';

@Controller('/users/:userId/transactions')
@UseFilters(TransactionsExceptionFilter)
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get(':id')
    async findById(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) transactionId: number,
    ): Promise<Transaction> {
        return await this.transactionsService.findById(userId, transactionId);
    }

    @Get()
    async findAll(
        @Param('userId', { schema: idParamSchema }) userId: number,
    ): Promise<Transaction[]> {
        return await this.transactionsService.findAll(userId);
    }

    @Post()
    async create(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Body({ schema: createTransactionSchema }) body: CreateTransactionDto,
    ): Promise<Transaction> {
        return await this.transactionsService.create(userId, body);
    }

    @Patch(':id')
    async update(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) transactionId: number,
        @Body({ schema: updateTransactionSchema }) body: UpdateTransactionDto,
    ): Promise<Transaction> {
        return await this.transactionsService.update(
            userId,
            transactionId,
            body,
        );
    }

    @Post(':id/realize')
    @HttpCode(HttpStatus.OK)
    async realize(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) transactionId: number,
        @Body({ schema: realizeTransactionSchema }) body: RealizeTransactionDto,
    ): Promise<Transaction> {
        return await this.transactionsService.realize(
            userId,
            transactionId,
            body,
        );
    }

    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    async cancel(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) transactionId: number,
    ): Promise<Transaction> {
        return await this.transactionsService.cancel(userId, transactionId);
    }

    @Post(':id/reverse')
    @HttpCode(HttpStatus.OK)
    async reverse(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) transactionId: number,
        @Body({ schema: reverseTransactionSchema }) body: ReverseTransactionDto,
    ): Promise<Transaction> {
        return await this.transactionsService.reverse(
            userId,
            transactionId,
            body,
        );
    }
}
