import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import { idSchema } from '../common/dto.ts';
import type { CreateUserDto, UpdateUserDto } from './users.dto.ts';
import { createUserSchema, updateUserSchema } from './users.dto.ts';
import { UserNotFoundError } from './users.exceptions.ts';
import { UsersService } from './users.service.ts';

@Controller('/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(':id')
    async findById(@Param('id', { schema: idSchema }) id: number) {
        try {
            return await this.usersService.findById(id);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                throw new NotFoundException(error.message);
            }

            throw error;
        }
    }

    @Get()
    async findAll() {
        return await this.usersService.findAll();
    }

    @Post()
    async create(@Body({ schema: createUserSchema }) body: CreateUserDto) {
        return await this.usersService.create(body);
    }

    @Patch(':id')
    async update(
        @Param('id', { schema: idSchema }) id: number,
        @Body({ schema: updateUserSchema }) body: UpdateUserDto,
    ) {
        try {
            return await this.usersService.update(id, body);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                throw new NotFoundException(error.message);
            }

            throw error;
        }
    }
}
