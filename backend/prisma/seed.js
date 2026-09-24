"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Removed destructive deleteMany calls for production safety
        const adminPasswordRaw = process.env.ADMIN_INITIAL_PASSWORD;
        const volunteerPasswordRaw = process.env.VOLUNTEER_INITIAL_PASSWORD;
        if (process.env.NODE_ENV === 'production' && (!adminPasswordRaw || !volunteerPasswordRaw)) {
            throw new Error('Missing ADMIN_INITIAL_PASSWORD or VOLUNTEER_INITIAL_PASSWORD in production env');
        }
        const defaultPasswordAdmin = yield bcryptjs_1.default.hash(adminPasswordRaw || 'password123', 10);
        const defaultPasswordVolunteer = yield bcryptjs_1.default.hash(volunteerPasswordRaw || 'password123', 10);
        // Base required configuration (Users and Base Roles)
        yield prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: { username: 'admin', passwordHash: defaultPasswordAdmin, role: 'ADMIN' }
        });
        yield prisma.user.upsert({
            where: { username: 'volunteer' },
            update: {},
            create: { username: 'volunteer', passwordHash: defaultPasswordVolunteer, role: 'VOLUNTEER' }
        });
        // In production, we ONLY seed users, categories, and skip demo data.
        if (process.env.NODE_ENV === 'production') {
            console.log('Production mode detected. Seeding only base config (users/categories).');
            return;
        }
        // 1. Create Hotels
        const hotel1 = yield prisma.hotel.create({
            data: { name: 'Hotel 01', code: 'H01', location: 'Location A' }
        });
        const hotel2 = yield prisma.hotel.create({
            data: { name: 'Hotel 02', code: 'H02', location: 'Location B' }
        });
        const hotel3 = yield prisma.hotel.create({
            data: { name: 'Hotel 03', code: 'H03', location: 'Location C' }
        });
        // Seed Rooms & Beds for Hotel 1 (20 rooms, 4 beds each)
        for (let i = 1; i <= 20; i++) {
            const gender = i <= 12 ? 'MALE' : 'FEMALE';
            const room = yield prisma.room.create({
                data: {
                    hotelId: hotel1.id,
                    number: `1${i.toString().padStart(2, '0')}`,
                    capacity: 4,
                    gender
                }
            });
            for (let b = 1; b <= 4; b++) {
                yield prisma.bed.create({
                    data: { roomId: room.id, number: `B${b}` }
                });
            }
        }
        // Seed limited Rooms for Hotel 2 and 3 for dev
        const hotels = [hotel2, hotel3];
        for (const h of hotels) {
            for (let i = 1; i <= 5; i++) {
                const room = yield prisma.room.create({
                    data: {
                        hotelId: h.id,
                        number: `1${i.toString().padStart(2, '0')}`,
                        capacity: 4,
                        gender: i <= 3 ? 'MALE' : 'FEMALE'
                    }
                });
                for (let b = 1; b <= 4; b++) {
                    yield prisma.bed.create({
                        data: { roomId: room.id, number: `B${b}` }
                    });
                }
            }
        }
        // 2. Create Ground Accommodation (Shads)
        const shadsData = [
            { name: 'Shad 1', code: 'S01', capacity: 300 },
            { name: 'Shad 2', code: 'S02', capacity: 300 },
            { name: 'Shad 3', code: 'S03', capacity: 200 }
        ];
        for (const sData of shadsData) {
            const shad = yield prisma.shad.create({
                data: { name: sData.name, code: sData.code, capacity: sData.capacity }
            });
            // Create first 100 beds for dev to avoid huge seed time, but could be full capacity
            const bedsToCreate = Math.min(sData.capacity, 100);
            const shadBeds = Array.from({ length: bedsToCreate }).map((_, idx) => ({
                shadId: shad.id,
                number: `S${shad.code.slice(1)}-${idx + 1}`
            }));
            yield prisma.shadBed.createMany({
                data: shadBeds
            });
        }
        // 3. Create sample participant category
        const genCategory = yield prisma.participantCategory.create({
            data: { name: 'General Participant' }
        });
        // 4. Create Volunteers
        const v1 = yield prisma.volunteer.create({
            data: { name: 'John Doe', phone: '1234567890' }
        });
        yield prisma.volunteerShift.create({
            data: {
                volunteerId: v1.id,
                hotelId: hotel1.id,
                date: new Date(),
                shiftName: 'Shift 1',
                startTime: '07:00',
                endTime: '13:00'
            }
        });
        console.log('Seeding complete!');
    });
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
