import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // Criar status básicos (Ativo e Inativo)
  const statusAtivo = await prisma.status.upsert({
    where: { name: "Ativo" },
    update: {},
    create: {
      name: "Ativo",
    },
  });

  const statusInativo = await prisma.status.upsert({
    where: { name: "Inativo" },
    update: {},
    create: {
      name: "Inativo",
    },
  });

  console.log("Status criados:", { statusAtivo, statusInativo });

  // Criar roles básicas
  const roleAdmin = await prisma.role.upsert({
    where: { name: "Administrador" },
    update: {},
    create: {
      name: "Administrador",
      level: 100, // Nível mais alto
      status: 1, // Ativo
    },
  });

  const roleGerente = await prisma.role.upsert({
    where: { name: "Gerente" },
    update: {},
    create: {
      name: "Gerente",
      level: 50,
      status: 1,
    },
  });

  const roleOperador = await prisma.role.upsert({
    where: { name: "Operador" },
    update: {},
    create: {
      name: "Operador",
      level: 10,
      status: 1,
    },
  });

  console.log("Roles criadas:", { roleAdmin, roleGerente, roleOperador });

  // Criar um usuário admin para testes
  const hashedPassword = await hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@exemplo.com" },
    update: {},
    create: {
      cpf: "12345678900",
      nome: "Administrador",
      telefone: "(11) 99999-9999",
      email: "admin@exemplo.com",
      senha: hashedPassword,
      cidade: "São Paulo",
      estado: "SP",
      roleId: roleAdmin.id,
      statusId: statusAtivo.id,
    },
  });

  console.log("Usuário admin criado:", adminUser);

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
