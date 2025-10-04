import { createLogger, transports, format } from 'winston'

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logDir = path.join(__dirname, '..', '..', '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

interface user {
  username: string
  id: number
}

const baseFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  })
);

export const infoLogger = createLogger({
  level: 'info',
  format: baseFormat,
  transports: [
    new transports.File({ filename: path.join(logDir, 'info.log')})
  ]
});

export const errorLogger = createLogger({
  level: 'error',
  format: baseFormat,
  transports: [
    new transports.File({ filename: path.join(logDir, 'error.log')})
  ]
});

export const auditLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => {
      const { timestamp, message } = info;
      const { entity, action, user, data } = message as { entity: string; action: string; user: user; data: any };
      return `[${timestamp}] ${entity} - ${action}:\nby user: ${user.username} [ID: ${user.id}]\n${JSON.stringify(data, null, 2)}\n`;
    })
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'audit.log')})
  ]
});

export const pedidoLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => {
      const { timestamp, message } = info;
      const { action, data } = message as {action: string; data: any };
      return `[${timestamp}] pedido - ${action}:\n${JSON.stringify(data, null, 2)}\n`;
    })
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'pedido.log')})
  ]
});

export const securityLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => {
      const { timestamp, message } = info;
      const { action, data } = message as { action: string; data: any };
      return `[${timestamp}] ${action}:\n${JSON.stringify(data, null, 2)}\n`;
    })
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'security.log')})
  ]
});