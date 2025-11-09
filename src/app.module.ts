import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsuntoModule } from './seeders/asunto/asunto.module';
import { MotivoModule } from './seeders/motivo/motivo.module';
import { ComonosconocioModule } from './seeders/comonosconocio/comonosconocio.module';
import { JwtModule } from '@nestjs/jwt';
import { CountriesModule } from './countries/countries.module';
import { CitiesModule } from './cities/cities.module';
import { HobbiesModule } from './hobbies/hobbies.module';

@Module({
  imports: [
    AuthModule,
    TicketsModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true, load: [typeorm] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm')!,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '12h' },
    }),
    AsuntoModule,
    MotivoModule,
    ComonosconocioModule,
    CountriesModule,
    CitiesModule,
    HobbiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
