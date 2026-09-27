import { prisma } from '../../../configs/database.config.js';
import { AppError } from '../../../errors/index.js';
import { MESSAGES } from '../../../constants/message.constant.js';

type PrismaModel = {
  findUnique: (args: { where: { id: number } }) => Promise<{ id: number } | null>;
  update: (args: { where: { id: number }; data: { name: string } }) => Promise<unknown>;
};

const modelMap: Record<string, PrismaModel> = {
  state: prisma.state as unknown as PrismaModel,
  lga: prisma.lGA as unknown as PrismaModel,
  city: prisma.city as unknown as PrismaModel,
  town: prisma.town as unknown as PrismaModel,
  neighborhood: prisma.neighborhood as unknown as PrismaModel,
};

export class UpdateLocationCommand {
  async execute(params: {
    type: 'state' | 'lga' | 'city' | 'town' | 'neighborhood';
    id: number;
    name: string;
  }) {
    const model = modelMap[params.type];
    if (!model) {
      throw new AppError(400, 'Invalid location type.');
    }

    const existing = await model.findUnique({ where: { id: params.id } });
    if (!existing) {
      throw new AppError(404, MESSAGES.NOT_FOUND);
    }

    return model.update({
      where: { id: params.id },
      data: { name: params.name },
    });
  }
}
