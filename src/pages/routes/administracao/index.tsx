/**
 * Administração — hub do modo admin.
 *
 * Protegida por useAdmin: usuário sem sessão vai para /routes/login e usuário
 * logado sem ser admin vai para /routes/profile. Lista as quatro opções:
 * Listar Usuários, Gerenciar Puzzles, Gerenciar Bots e Gerenciar Temas.
 */

import React from 'react';
import Link from 'next/link';
import styles from '@/styles/Administracao.module.css';
import { useAdmin } from '@/hooks/useAdmin';

export default function Administracao() {
  const { carregando, user } = useAdmin();

  if (carregando) {
    return (
      <div className={styles.root}>
        <div className={styles.gridBg} aria-hidden="true" />
        <div className={styles.loading}>Carregando…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.root}>
        <div className={styles.gridBg} aria-hidden="true" />
        <div className={styles.loading}>Redirecionando…</div>
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
          <Link href="/routes/profile" className={styles.navLink}>Perfil</Link>
          <Link href="/routes/puzzles" className={styles.navLink}>Problemas</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Administração<span className={styles.badge}>admin</span>
          </h1>
          <p className={styles.sub}>
            Olá, {user.nome}. Escolha uma das ferramentas administrativas.
          </p>
        </div>

        <div className={styles.cards}>
          <Link href="/routes/administracao/usuarios" className={styles.cardLink}>
            <span className={styles.cardLinkIcon}>👥</span>
            <h2 className={styles.cardLinkTitle}>Listar Usuários</h2>
            <p className={styles.cardLinkSub}>
              Veja todos os usuários cadastrados na plataforma.
            </p>
          </Link>

          <Link href="/routes/administracao/puzzles" className={styles.cardLink}>
            <span className={styles.cardLinkIcon}>🧩</span>
            <h2 className={styles.cardLinkTitle}>Gerenciar Puzzles</h2>
            <p className={styles.cardLinkSub}>
              Adicione um novo puzzle ao catálogo da plataforma.
            </p>
          </Link>

          <Link href="/routes/administracao/bots" className={styles.cardLink}>
            <span className={styles.cardLinkIcon}>🤖</span>
            <h2 className={styles.cardLinkTitle}>Gerenciar Bots</h2>
            <p className={styles.cardLinkSub}>
              Cadastre um bot com nível de dificuldade.
            </p>
          </Link>

          <Link href="/routes/administracao/temas" className={styles.cardLink}>
            <span className={styles.cardLinkIcon}>🏷</span>
            <h2 className={styles.cardLinkTitle}>Gerenciar Temas</h2>
            <p className={styles.cardLinkSub}>
              Organize as classificações táticas dos puzzles.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
