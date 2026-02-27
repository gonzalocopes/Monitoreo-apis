import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.endpoint.createMany({
        data: [
            { userId: 1, name: 'Google Search', url: 'https://www.google.com', method: 'GET', interval: 10, status: 'ONLINE' },
            { userId: 1, name: 'Random API', url: 'https://api.publicapis.org/random', method: 'GET', interval: 30, status: 'ONLINE' },
            { userId: 1, name: 'Broken Endpoint', url: 'https://thiswebsitedoesnotexist.com/api', method: 'GET', interval: 15, status: 'OFFLINE' }
        ],
        skipDuplicates: true
    });
    console.log('Seeded database with initial endpoints.');
}
main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
