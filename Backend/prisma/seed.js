
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ejercicios = [
  {
    nombre: 'Press Banca',
    grupo_muscular: 'Pecho',
    tipo: 'repeticiones',
    descripcion: 'Advertencias: La simetría entre brazos solo se evalúa si los dos se ven; de perfil, el brazo lejano queda tapado.',
    script_key: 'press_banca',
  },
  {
    nombre: 'Sentadilla',
    grupo_muscular: 'Cuádriceps',
    tipo: 'repeticiones',
    script_key: 'sentadilla',
  },
  {
    nombre: 'Push-Up',
    grupo_muscular: 'Pecho',
    tipo: 'repeticiones',
    script_key: 'flexiones',
  },
  {
    nombre: 'Plancha',
    grupo_muscular: 'Core',
    tipo: 'isometrico',
    script_key: 'plancha',
  },
  {
    nombre: 'Press militar',
    grupo_muscular: 'Hombros',
    tipo: 'repeticiones',
    script_key: 'press_militar',
  },
  {
    nombre: 'Curl de Bíceps',
    grupo_muscular: 'Bíceps',
    tipo: 'repeticiones',
    script_key: 'curl_biceps',
  },
  {
    nombre: 'Peso Muerto Rumano',
    grupo_muscular: 'Isquiotibiales',
    tipo: 'repeticiones',
    descripcion: 'Advertencias: No se evalúa la curvatura lumbar (redondeo de espalda) de forma fiable con un modelo en 2D.',
    script_key: 'peso_muerto_rumano',
  },
  {
    nombre: 'Elevación de talones',
    grupo_muscular: 'Pantorrillas',
    tipo: 'repeticiones',
    descripcion: 'Advertencias: El talón y la punta del pie son los puntos menos estables del modelo de pose.',
    script_key: 'elevacion_talones',
  },
  {
    nombre: 'Jalón al pecho',
    grupo_muscular: 'Espalda',
    tipo: 'repeticiones',
    descripcion: 'Advertencias: La inclinación hacia atrás y el balanceo del tronco solo se miden bien de perfil.',
    script_key: 'jalon_pecho',
  },
  {
    nombre: 'Zancada',
    grupo_muscular: 'Cuádriceps',
    tipo: 'repeticiones',
    script_key: 'zancada',
  },
  {
    nombre: 'Remo con mancuerna',
    grupo_muscular: 'Espalda',
    tipo: 'repeticiones',
    script_key: 'remo_mancuerna',
  },
  {
    nombre: 'Crunch abdominal',
    grupo_muscular: 'Core',
    tipo: 'repeticiones',
    descripcion: 'Advertencias: No se mide la activación del abdomen ni la curvatura lumbar.',
    script_key: 'crunch_abdominal',
  },
  {
    nombre: 'Aperturas con mancuernas',
    grupo_muscular: 'Pecho',
    tipo: 'repeticiones',
    script_key: 'aperturas_mancuernas',
  },
  {
    nombre: 'Elevaciones laterales',
    grupo_muscular: 'Hombros',
    tipo: 'repeticiones',
    script_key: 'elevaciones_laterales',
  },
  {
    nombre: 'Extensión de tríceps en polea',
    grupo_muscular: 'Tríceps',
    tipo: 'repeticiones',
    script_key: 'triceps_polea',
  },
];

async function main() {
  for (const ejercicio of ejercicios) {
    const { script_key, ...datos } = ejercicio;

    await prisma.ejercicio.upsert({
      where: { script_key },
      update: datos,
      create: {
        ...datos,
        script_key,
        activo: true,
      },
    });
  }

  console.log(`${ejercicios.length} ejercicios cargados correctamente.`);
}

main()
  .catch((error) => {
    console.error('Error al cargar los ejercicios:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
