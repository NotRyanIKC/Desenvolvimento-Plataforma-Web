import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Login.module.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.gridBg} aria-hidden="true" />

      <div className={styles.wrapper}>
        {/* Painel esquerdo — decorativo */}
        <div className={styles.side} aria-hidden="true">
          <div className={styles.sideContent}>
            <div className={styles.sideLogo}>
              <span className={styles.sideLogoIcon}>♟</span>
              <span className={styles.sideLogoText}>
                Cesu<span className={styles.sideLogoAccent}>Chess</span>
              </span>
            </div>
            <p className={styles.sideQuote}>
              "O xadrez é a ginástica da mente."
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

        {/* Formulário */}
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

          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
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

            <button type="submit" className={styles.btnSubmit}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}