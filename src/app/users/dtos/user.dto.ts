import { User } from '@prisma/client';
import { StatusDto } from '../../../shared/dtos/status.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UserDto extends StatusDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe Junior',
  })
  name!: string;

  @ApiProperty({
    description: 'User username',
    example: 'johndoejunior123',
  })
  username!: string;

  @ApiProperty({
    description: 'User email',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    description: 'User password',
    required: false,
  })
  password?: string;

  @ApiProperty({
    description: 'User role id',
    format: 'uuid',
  })
  @IsUUID()
  roleId!: string;

  public static fromModel(model: User, password: string) {
    const it = super.fromModel(model) as UserDto;
    it.name = model.name;
    it.username = model.username;
    it.email = model.email;
    it.password = password;
    it.roleId = model.roleId;

    return it;
  }
}
