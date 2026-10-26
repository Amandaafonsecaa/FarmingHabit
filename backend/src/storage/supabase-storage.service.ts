import { Injectable, ServiceUnavailableException } from '@nestjs/common';

/**
 * Acesso ao Supabase Storage pela API REST, com a chave service_role (só no backend).
 * Usado para as fotos da motivação, guardadas num bucket privado e servidas por links assinados.
 */
@Injectable()
export class SupabaseStorageService {
  private readonly url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  private readonly key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  private config() {
    if (!this.url || !this.key) {
      throw new ServiceUnavailableException('Fotos indisponíveis: configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env do backend.');
    }
    return { url: this.url, headers: { Authorization: `Bearer ${this.key}`, apikey: this.key } };
  }

  get configured() {
    return Boolean(this.url && this.key);
  }

  async upload(bucket: string, path: string, body: Buffer, contentType: string): Promise<void> {
    const { url, headers } = this.config();
    const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST', headers: { ...headers, 'Content-Type': contentType, 'x-upsert': 'true' }, body: new Uint8Array(body),
    });
    if (!response.ok) throw new ServiceUnavailableException(`Não foi possível enviar a foto (${response.status}).`);
  }

  async remove(bucket: string, paths: string[]): Promise<void> {
    if (!paths.length) return;
    const { url, headers } = this.config();
    // Falha ao apagar a foto antiga não deve impedir a troca: no pior caso sobra um arquivo órfão
    await fetch(`${url}/storage/v1/object/${bucket}`, {
      method: 'DELETE', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: paths }),
    }).catch(() => undefined);
  }

  /** Link temporário para exibir um arquivo de bucket privado */
  async signedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
    if (!this.configured) return null;
    const { url, headers } = this.config();
    const response = await fetch(`${url}/storage/v1/object/sign/${bucket}/${path}`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn }),
    }).catch(() => null);
    if (!response?.ok) return null;
    const { signedURL } = (await response.json()) as { signedURL?: string };
    return signedURL ? `${url}/storage/v1${signedURL}` : null;
  }
}
