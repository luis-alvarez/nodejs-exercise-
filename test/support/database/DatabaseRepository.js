import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const emptyDatabase = async () => {
    await prisma.show.deleteMany();
};

export { emptyDatabase };
