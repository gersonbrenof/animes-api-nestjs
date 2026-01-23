import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface JwtUser {
  id: number;        // Alterei de sub para id para bater com o Strategy
  role: string;      
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Se a rota não exige roles, libera
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // --- DEBUG ---
    console.log('1. Roles Exigidas:', requiredRoles);
    console.log('2. Usuário no Request:', user);
    
    if (!user) {
        console.log('ERRO: Usuário não encontrado no request (verifique a ordem dos Guards)');
        return false;
    }

    const hasRole = requiredRoles.includes(user.role);
    console.log('3. Usuário tem permissão?', hasRole);
    // -------------

    return hasRole;
  }
}