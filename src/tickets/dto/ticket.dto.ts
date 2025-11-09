export class CreateTicketDto {
  asuntoId: number;
  descripcion: string;
}

export class UpdateTicketDto {
  adminComment?: string;
  estado?: 'abierto' | 'en progreso' | 'cerrado';
}
