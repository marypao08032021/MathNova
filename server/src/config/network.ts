import net from 'net';
import os from 'os';

export interface NetworkAddress {
  name: string;
  address: string;
}

export function isLanEnabled(): boolean {
  return !['false', '0', 'no'].includes(
    String(process.env.LAN_ENABLED ?? 'true').toLowerCase(),
  );
}

export function getServerHost(): string {
  return isLanEnabled() ? '0.0.0.0' : '127.0.0.1';
}

export function getLanAddresses(): NetworkAddress[] {
  const addresses: NetworkAddress[] = [];

  let interfacesByName: ReturnType<typeof os.networkInterfaces>;
  try { interfacesByName = os.networkInterfaces(); }
  catch { console.warn('No se pudieron obtener las IP de red. Consulta la IP del equipo; el servidor continúa activo.'); return addresses; }
  for (const [name, interfaces] of Object.entries(interfacesByName)) {
    for (const networkInterface of interfaces ?? []) {
      if (
        networkInterface.family === 'IPv4' &&
        !networkInterface.internal &&
        !networkInterface.address.startsWith('169.254.')
      ) {
        addresses.push({ name, address: networkInterface.address });
      }
    }
  }

  return addresses;
}

function canListen(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = net.createServer();

    probe.unref();
    probe.once('error', () => resolve(false));
    probe.listen({ port, host }, () => {
      probe.close(() => resolve(true));
    });
  });
}

export async function findAvailablePort(
  preferredPort: number,
  host: string,
  attempts = 20,
): Promise<number> {
  for (let offset = 0; offset < attempts; offset += 1) {
    const candidate = preferredPort + offset;
    if (await canListen(candidate, host)) {
      return candidate;
    }
  }

  throw new Error(
    `No se encontró un puerto disponible entre ${preferredPort} y ${preferredPort + attempts - 1}.`,
  );
}

export function getAccessUrls(port: number): {
  local: string;
  lan: NetworkAddress[];
} {
  return {
    local: `http://127.0.0.1:${port}`,
    lan: isLanEnabled()
      ? getLanAddresses().map(({ name, address }) => ({
          name,
          address: `http://${address}:${port}`,
        }))
      : [],
  };
}
