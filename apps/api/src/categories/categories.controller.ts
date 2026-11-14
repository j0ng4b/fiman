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

import type { CreateCategoryDto, UpdateCategoryDto } from './categories.dto.ts';
import type { Category } from './categories.schema.ts';
import {
    createCategorySchema,
    updateCategorySchema,
} from './categories.dto.ts';
import { CategoriesExceptionFilter } from './categories.filter.ts';
import { CategoriesService } from './categories.service.ts';

@Controller('/users/:userId/categories')
@UseFilters(CategoriesExceptionFilter)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get(':id')
    async findById(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) id: number,
    ): Promise<Category> {
        return await this.categoriesService.findById(userId, id);
    }

    @Get()
    async findAll(
        @Param('userId', { schema: idParamSchema }) userId: number,
    ): Promise<Category[]> {
        return await this.categoriesService.findAll(userId);
    }

    @Post()
    async create(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Body({ schema: createCategorySchema }) body: CreateCategoryDto,
    ): Promise<Category> {
        return await this.categoriesService.create(userId, body);
    }

    @Patch(':id')
    async update(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) id: number,
        @Body({ schema: updateCategorySchema }) body: UpdateCategoryDto,
    ): Promise<Category> {
        return await this.categoriesService.update(userId, id, body);
    }

    @Patch(':id/active')
    async setActive(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) id: number,
        @Body({ schema: setActiveSchema }) body: SetActiveDto,
    ): Promise<Category> {
        return await this.categoriesService.setActive(userId, id, body.active);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('userId', { schema: idParamSchema }) userId: number,
        @Param('id', { schema: idParamSchema }) id: number,
    ): Promise<void> {
        await this.categoriesService.delete(userId, id);
    }
}
