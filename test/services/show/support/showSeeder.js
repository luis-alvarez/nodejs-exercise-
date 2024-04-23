import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import * as fs from 'fs';

const showSeeder = async ({
    filename = 'example1',
} = {
    filename: 'example1',
}) => {
    const path = `test/services/show/support/fixtures/${filename}.txt`;

    const data = fs.readFileSync(path, 'utf8');

    const lines = data.split('\n');

    const showsToInsert = []

    for (const line of lines) {
        let [id, quantity, last_update] = line.split(',');

        if (!quantity) continue;

        last_update = parseInt(last_update);

        if (isNaN(last_update)) last_update = null

        const show = {
            id: parseInt(id),
            quantity: parseInt(quantity),
            last_update
        };

        showsToInsert.push(show);
    }

    return await prisma.show.createMany({
        data: showsToInsert,
        skipDuplicates: true
    });
}

export { showSeeder };
