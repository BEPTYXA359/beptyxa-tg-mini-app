import { z } from 'zod';
import { normalizePlate, RU_PLATE_REGEX } from '../utils/plateFormat';

export type CarPlateFormat = 'ru';

export interface Plate {
  _id: string;
  chatId: number;
  plate: string;
  name: string;
  format: CarPlateFormat;
  createdAt: string;
  updatedAt?: string;
  createdBy: number;
  creatorFirstName: string;
  creatorUsername?: string;
}

export const createPlateSchema = z
  .object({
    plate: z.string().trim().min(1, 'Введите номер автомобиля').max(20),
    name: z.string().trim().min(1, 'Введите имя владельца').max(100, 'Максимум 100 символов'),
  })
  .superRefine((data, ctx) => {
    if (!RU_PLATE_REGEX.test(normalizePlate(data.plate))) {
      ctx.addIssue({
        code: 'custom',
        message: 'Неверный формат номера. Пример: А123ВС77',
        path: ['plate'],
      });
    }
  });

export type CreatePlateInput = z.infer<typeof createPlateSchema>;
