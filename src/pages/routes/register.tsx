import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Register.module.css';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
              "O xadrez é a arte da análise."
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

        {/* Formulário */}
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

          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
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
              <input id="terms" type="checkbox" className={styles.checkbox} />
              <label htmlFor="terms" className={styles.checkLabel}>
                Concordo com os{' '}
                <span className={styles.formLink}>termos de uso</span> e{' '}
                <span className={styles.formLink}>política de privacidade</span>
              </label>
            </div>

            <button type="submit" className={styles.btnSubmit}>
              Criar conta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}