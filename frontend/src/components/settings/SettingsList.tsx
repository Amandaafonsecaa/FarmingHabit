import type { ReactNode } from 'react';

/** Grupo de opções com título e nota de rodapé, como nas telas de ajustes de apps de celular */
export function SettingsGroup({ title, footer, tone, children }: { title: string; footer?: ReactNode; tone?: 'danger'; children: ReactNode }) {
  return <section className={`settings-group ${tone === 'danger' ? 'is-danger' : ''}`}>
    <h3 className="settings-group-title">{title}</h3>
    <div className="settings-group-card">{children}</div>
    {footer && <p className="settings-group-footer">{footer}</p>}
  </section>;
}

/** Linha de opção: nome e explicação à esquerda, controle à direita */
export function SettingsRow({ label, description, htmlFor, children }: { label: string; description?: ReactNode; htmlFor?: string; children?: ReactNode }) {
  return <div className="settings-row">
    <div className="settings-row-text">
      {htmlFor ? <label className="settings-row-label" htmlFor={htmlFor}>{label}</label> : <p className="settings-row-label">{label}</p>}
      {description && <p className="settings-row-description">{description}</p>}
    </div>
    {children && <div className="settings-row-control">{children}</div>}
  </div>;
}
