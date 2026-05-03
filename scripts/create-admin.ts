import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";

const prisma = new PrismaClient();

async function ask(rl: ReturnType<typeof createInterface>, q: string): Promise<string> {
  const a = await rl.question(q);
  return a.trim();
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const email = (await ask(rl, "Email: ")).toLowerCase();
    if (!email.includes("@")) throw new Error("email inválido");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const replace = (await ask(rl, "Usuario existe. Reemplazar password? (y/n): ")).toLowerCase();
      if (replace !== "y") {
        console.log("cancelado");
        return;
      }
    }

    const password = await ask(rl, "Password (min 6): ");
    if (password.length < 6) throw new Error("password muy corta");
    const name = await ask(rl, "Nombre (opcional): ");

    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      await prisma.user.update({
        where: { email },
        data: { passwordHash, name: name || existing.name },
      });
      console.log(`OK actualizado: ${email}`);
    } else {
      await prisma.user.create({
        data: { email, passwordHash, name: name || null },
      });
      console.log(`OK creado: ${email}`);
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
