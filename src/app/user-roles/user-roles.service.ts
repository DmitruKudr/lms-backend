import { Injectable } from '@nestjs/common';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { PrismaService } from '../../prisma.service';
import { NewUserRoleForm } from './dtos/new-user-role.form';

@Injectable()
export class UserRolesService {
  constructor(private prisma: PrismaService) {}
  public async create(form: NewUserRoleForm) {
    const newUserRole = await this.prisma.userRole.create({ data: form });

    return newUserRole;
  }

  public async findAll() {
    const userRoles = await this.prisma.userRole.findMany();

    return userRoles;
  }

  public async findById(id: string) {
    const useRole = await this.prisma.userRole.findUnique({
      where: { id: id },
    });

    return useRole;
  }

  update(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    return `This action updates a #${id} userRole`;
  }

  delete(id: number) {
    return `This action removes a #${id} userRole`;
  }
}
