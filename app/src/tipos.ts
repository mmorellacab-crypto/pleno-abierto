export type Postura = 'si' | 'no' | 'abstencion' | 'dividido' | 'novota';

export interface RecuentoGrupo {
  si: number;
  no: number;
  abstencion: number;
  novota: number;
  postura: Postura;
}

export interface Ley {
  id: string;
  fecha: string; // AAAA-MM-DD
  tipo: string;
  tema: string; // asignado por El Congreso en tu mano (IA, orientativo)
  fichaECETM: string;
  titulo: string; // texto oficial del Congreso
  apartado: string | null;
  aprobada: boolean;
  /** 'congreso': voto nominal oficial. 'ecetm': solo totales publicados por El Congreso en tu mano. */
  fuenteVotos: 'congreso' | 'ecetm';
  oficial: { sesion: number; votacion: number; fecha: string; url: string } | null;
  totales: {
    si: number;
    no: number;
    abstencion: number;
    novota: number;
    presentes: number | null;
    asentimiento: boolean;
  };
  grupos: Record<string, RecuentoGrupo> | null;
}

export interface Dataset {
  version: number;
  generado: string;
  legislatura: string;
  fuentes: {
    congreso: { nombre: string; url: string; condiciones: string; uso: string };
    ecetm: { nombre: string; url: string; licencia: string; licenciaUrl: string; datosHasta: string; uso: string };
  };
  temas: { id: string; nombre: string }[];
  proximas?: Proxima[];
  grupos: Record<string, { corto: string; nombre: string }>;
  leyes: Ley[];
}

export interface Proxima {
  id: string;
  fecha: string;
  titulo: string; // título oficial
  estado: 'prevista' | 'pendiente' | 'votada' | 'publicada' | string;
  fuente: string; // nota oficial del Congreso
  eli: string | null; // texto en el BOE
  articulos: string[]; // índice oficial de artículos (BOE)
  totales: { si: number; no: number; abstencion: number } | null;
  aprobada: boolean | null;
}

export interface Diputado {
  nombre: string;
  circunscripcion: string;
  formacion: string;
  grupo: string | null;
  alta: string;
  baja: string | null;
  votadas: number;
  total: number;
  votos: string; // un carácter por ley de `leyes` (S/N/A/- o espacio si no era diputado)
}

export interface DatosDiputados {
  version: number;
  generado: string;
  legislatura: string;
  diasConVotaciones: number;
  leyes: string[];
  diputados: Diputado[];
}
