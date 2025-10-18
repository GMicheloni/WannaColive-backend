export class CreateTicketDto {
  asunto: string;
  descripcion: string;
  userId: number;
}

export class UpdateTicketDto {
  adminComment?: string;
  estado?: 'abierto' | 'en progreso' | 'cerrado';
}
