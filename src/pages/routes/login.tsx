import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/Login.module.css';
import { api, ApiError, type MeResponse } from '@/lib/apiClient';

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    if (!identifier.trim() || !senha) {
      setErro('Preencha e-mail/usuário e senha.');
      return;
    }

    setLoading(true);
    try {
      const { isAdmin } = await api.post<MeResponse>('/api/auth/login', {
        identifier: identifier.trim(),
        senha,
      });
      router.push(isAdmin ? '/routes/administracao' : '/routes/profile');
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Falha inesperada no login.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.gridBg} aria-hidden="true" />

      <div className={styles.wrapper}>
        <div className={styles.side} aria-hidden="true">
          <div className={styles.sideContent}>
            <div className={styles.sideLogo}>
              <span className={styles.sideLogoIcon}>♟</span>
              <span className={styles.sideLogoText}>
                Cesu<span className={styles.sideLogoAccent}>Chess</span>
              </span>
            </div>
            <p className={styles.sideQuote}>
              &quot;O xadrez é a ginástica da mente.&quot;
            </p>
            <span className={styles.sideQuoteAuthor}>— Blaise Pascal</span>

            <div className={styles.sideBoardMini}>
              {Array.from({ length: 64 }).map((_, i) => {
                const r = Math.floor(i / 8);
                const c = i % 8;
                const isLight = (r + c) % 2 === 0;
                return (
                  <div
                    key={i}
                    className={`${styles.miniCell} ${isLight ? styles.miniLight : styles.miniDark}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <Link href="/" className={styles.back}>
              ← Voltar
            </Link>
            <h1 className={styles.formTitle}>Bem-vindo de volta</h1>
            <p className={styles.formSub}>
              Não tem uma conta?{' '}
              <Link href="/routes/register" className={styles.formLink}>
                Criar conta
              </Link>
            </p>
          </div>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="identifier">
                E-mail ou nome de usuário
              </label>
              <input
                id="identifier"
                type="text"
                className={styles.input}
                placeholder="joao@exemplo.com"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="password">
                  Senha
                </label>
                <span className={styles.formLink}>Esqueci minha senha</span>
              </div>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className={styles.checkRow}>
              <input id="remember" type="checkbox" className={styles.checkbox} />
              <label htmlFor="remember" className={styles.checkLabel}>
                Lembrar de mim
              </label>
            </div>

            {erro && (
              <p role="alert" style={{ color: '#ff6b6b', marginTop: 4 }}>
                {erro}
              </p>
            )}

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
