/**
 * Administração → Listar Usuários.
 * Carrega GET /api/admin/users (protegido por admin) e exibe a tabela.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Administracao.module.css';
import { useAdmin } from '@/hooks/useAdmin';
import { api, ApiError, type AdminUser } from '@/lib/apiClient';

export default function ListarUsuarios() {
  const { carregando, user } = useAdmin();
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { users } = await api.get<{ users: AdminUser[] }>('/api/admin/users');
        setUsuarios(users);
      } catch (err) {
        setErro(err instanceof ApiError ? err.message : 'Falha ao listar usuários.');
      } finally {
        setBuscando(false);
      }
    })();
  }, [user]);

  if (carregando || !user) {
    return (
      <div className={styles.root}>
        <div className={styles.gridBg} aria-hidden="true" />
        <div className={styles.loading}>Carregando…</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.gridBg} aria-hidden="true" />

      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>♟</span>
          <span>
            Cesu<span className={styles.logoAccent}>Chess</span>
          </span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/routes/administracao" className={styles.navLink}>← Administração</Link>
          <Link href="/routes/profile" className={styles.navLink}>Perfil</Link>
          <Link href="/routes/puzzles" className={styles.navLink}>Problemas</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Usuários</h1>
          <p className={styles.sub}>
            {buscando ? 'Carregando…' : `${usuarios.length} usuário(s) cadastrado(s).`}
          </p>
        </div>

        <div className={styles.card}>
          {erro && <p className={styles.msgErr} role="alert">{erro}</p>}

          {!buscando && usuarios.length === 0 && !erro && (
            <p className={styles.empty}>Nenhum usuário cadastrado ainda.</p>
          )}

          {usuarios.length > 0 && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Username</th>
                    <th>E-mail</th>
                    <th>Status</th>
                    <th>Desde</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nome} {u.sobrenome}</td>
                      <td>@{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`${styles.pill} ${u.ativo ? styles.pillOn : styles.pillOff}`}>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>{new Date(u.criadoEm).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
