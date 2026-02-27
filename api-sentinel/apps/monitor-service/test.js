import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
try {
    new PrismaClient({ log: ['info'] });
    console.log("Success with valid parameter!");
} catch (e) {
    console.log("Error details:");
    console.log(e.message);
}
