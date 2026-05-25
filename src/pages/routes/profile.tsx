/**
 * Tela de Perfil — CRUD do usuário autenticado.
 *
 *   READ    → GET    /api/users/me     (no carregamento)
 *   UPDATE  → PATCH  /api/users/me     (formulário "Dados pessoais"
 *                                       e formulário "Trocar senha")
 *   DELETE  → DELETE /api/users/me     (botão "Excluir conta")
 *
 * O CREATE acontece em /routes/register e o login em /routes/login,
 * completando o C-R-U-D sobre o agregado Usuário.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/Profile.module.css';
import { api, ApiError, type PublicUser } from '@/lib/apiClient';

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState<PublicUser | null>(null);
  const [carregando, setCarregando] = useState(true);

  /* Form de dados pessoais */
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtualEmail, setSenhaAtualEmail] = useState('');

  /* Form de senha */
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  /* Estado de UI */
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  /* Carrega usuário ao montar */
  useEffect(() => {
    (async () => {
      try {
        const { user } = await api.get<{ user: PublicUser }>('/api/users/me');
        setUser(user);
        setNome(user.nome);
        setSobrenome(user.sobrenome);
        setEmail(user.email);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/routes/login');
          return;
        }
        setErro(err instanceof Error ? err.message : 'Falha ao carregar perfil.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [router]);

  async function salvarDados(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);

    if (!user) return;

    const mudouEmail = email.trim().toLowerCase() !== user.email;
    if (mudouEmail && !senhaAtualEmail) {
      setErro('Informe sua senha atual para alterar o e-mail.');
      return;
    }

    setSalvando(true);
    try {
      const body: Record<string, string> = {
        nome,
        sobrenome,
      };
      if (mudouEmail) {
        body.email = email;
        body.senhaAtual = senhaAtualEmail;
      }
      const { user: atualizado } = await api.patch<{ user: PublicUser }>(
        '/api/users/me',
        body
      );
      setUser(atualizado);
      setSenhaAtualEmail('');
      setOk('Dados atualizados com sucesso.');
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Falha ao salvar dados.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);

    if (novaSenha !== confirmarSenha) {
      setErro('Nova senha e confirmação não conferem.');
      return;
    }

    setSalvando(true);
    try {
      await api.patch<{ user: PublicUser }>('/api/users/me', {
        senha: novaSenha,
        senhaAtual,
      });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setOk('Senha alterada com sucesso.');
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Falha ao trocar senha.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirConta() {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir sua conta? Esta ação é permanente.'
      )
    ) {
      return;
    }
    setErro(null);
    setExcluindo(true);
    try {
      await api.delete('/api/users/me');
      router.replace('/');
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Falha ao excluir conta.'
      );
      setExcluindo(false);
    }
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout');
    } catch {
      /* ignora — vamos sair de qualquer jeito */
    }
    router.replace('/');
  }

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
        <div className={styles.loading}>
          <p>{erro ?? 'Sessão expirada.'}</p>
        </div>
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
          <Link href="/routes/puzzles" className={styles.navLink}>Problemas</Link>
          <Link href="/routes/puzzles/history" className={styles.navLink}>
            Histórico
          </Link>
          <button onClick={logout} className={styles.logout}>
            Sair
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Meu perfil</h1>
          <p className={styles.sub}>
            @{user.username} · membro desde{' '}
            {new Date(user.criadoEm).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* --- Dados pessoais --- */}
        <form className={styles.card} onSubmit={salvarDados}>
          <h2 className={styles.cardTitle}>Dados pessoais</h2>
          <p className={styles.cardSub}>
            Para trocar o e-mail você precisa informar a senha atual.
          </p>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="nome">Nome</label>
              <input
                id="nome"
                className={styles.input}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="sobrenome">Sobrenome</label>
              <input
                id="sobrenome"
                className={styles.input}
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                disabled={salvando}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={salvando}
            />
          </div>

          {email.trim().toLowerCase() !== user.email && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="senhaAtualEmail">
                Senha atual (para confirmar troca de e-mail)
              </label>
              <input
                id="senhaAtualEmail"
                type="password"
                className={styles.input}
                value={senhaAtualEmail}
                onChange={(e) => setSenhaAtualEmail(e.target.value)}
                disabled={salvando}
              />
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={salvando}
            >
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>

        {/* --- Trocar senha --- */}
        <form className={styles.card} onSubmit={trocarSenha}>
          <h2 className={styles.cardTitle}>Trocar senha</h2>
          <p className={styles.cardSub}>Mínimo de 8 caracteres.</p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="senhaAtual">Senha atual</label>
            <input
              id="senhaAtual"
              type="password"
              className={styles.input}
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              disabled={salvando}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="novaSenha">Nova senha</label>
              <input
                id="novaSenha"
                type="password"
                className={styles.input}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                disabled={salvando}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmarSenha">
                Confirmar
              </label>
              <input
                id="confirmarSenha"
                type="password"
                className={styles.input}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                disabled={salvando}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={salvando || !senhaAtual || !novaSenha}
            >
              {salvando ? 'Salvando…' : 'Trocar senha'}
            </button>
          </div>
        </form>

        {/* --- Zona de perigo --- */}
        <div className={`${styles.card} ${styles.dangerZone}`}>
          <h2 className={styles.cardTitle}>Excluir conta</h2>
          <p className={styles.cardSub}>
            Sua conta e todo o histórico de puzzles resolvidos serão removidos
            permanentemente.
          </p>
          <div className={styles.actions}>
            <button
              onClick={excluirConta}
              className={styles.btnDanger}
              disabled={excluindo}
            >
              {excluindo ? 'Excluindo…' : 'Excluir minha conta'}
            </button>
          </div>
        </div>

        {erro && <p className={styles.msgErr} role="alert">{erro}</p>}
        {ok && <p className={styles.msgOk} role="status">{ok}</p>}
      </main>
    </div>
  );
}
