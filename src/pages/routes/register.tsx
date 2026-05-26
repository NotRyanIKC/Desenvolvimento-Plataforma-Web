import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/Register.module.css';
import { api, ApiError, type PublicUser } from '@/lib/apiClient';

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    username: '',
    email: '',
    senha: '',
    confirm: '',
    aceitouTermos: false,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    if (!form.aceitouTermos) {
      setErro('Você precisa aceitar os termos de uso.');
      return;
    }
    if (form.senha !== form.confirm) {
      setErro('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      await api.post<{ user: PublicUser }>('/api/auth/register', {
        nome: form.nome,
        sobrenome: form.sobrenome,
        username: form.username,
        email: form.email,
        senha: form.senha,
      });
      router.push('/');
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Falha inesperada no cadastro.'
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
              &quot;O xadrez é a arte da análise.&quot;
            </p>
            <span className={styles.sideQuoteAuthor}>— Mikhail Botvinnik</span>

            <div className={styles.sideBoardMini} aria-hidden="true">
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
            <h1 className={styles.formTitle}>Criar conta</h1>
            <p className={styles.formSub}>
              Já tem uma conta?{' '}
              <Link href="/routes/login" className={styles.formLink}>
                Entrar
              </Link>
            </p>
          </div>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="firstName">
                  Nome
                </label>
                <input
                  id="firstName"
                  type="text"
                  className={styles.input}
                  placeholder="João"
                  autoComplete="given-name"
                  value={form.nome}
                  onChange={(e) => update('nome', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="lastName">
                  Sobrenome
                </label>
                <input
                  id="lastName"
                  type="text"
                  className={styles.input}
                  placeholder="Silva"
                  autoComplete="family-name"
                  value={form.sobrenome}
                  onChange={(e) => update('sobrenome', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">
                Nome de usuário
              </label>
              <input
                id="username"
                type="text"
                className={styles.input}
                placeholder="joaosilva99"
                autoComplete="username"
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="joao@exemplo.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Senha
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  value={form.senha}
                  onChange={(e) => update('senha', e.target.value)}
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

            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm">
                Confirmar senha
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => update('confirm', e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className={styles.checkRow}>
              <input
                id="terms"
                type="checkbox"
                className={styles.checkbox}
                checked={form.aceitouTermos}
                onChange={(e) => update('aceitouTermos', e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="terms" className={styles.checkLabel}>
                Concordo com os{' '}
                <span className={styles.formLink}>termos de uso</span> e{' '}
                <span className={styles.formLink}>política de privacidade</span>
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
              {loading ? 'Criando…' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
