--
-- PostgreSQL database dump
--

\restrict gkR4078spvlJp7XzNomfow0IAttI9jjX5U2XeHcvAYIZ9MFn32c5cFarVQSDdqo

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: dificuldade_bot; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.dificuldade_bot AS ENUM (
    'facil',
    'medio',
    'dificil'
);


ALTER TYPE public.dificuldade_bot OWNER TO postgres;

--
-- Name: resultado_partida; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.resultado_partida AS ENUM (
    'brancas',
    'pretas',
    'empate',
    'abandono_brancas',
    'abandono_pretas'
);


ALTER TYPE public.resultado_partida OWNER TO postgres;

--
-- Name: status_partida; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_partida AS ENUM (
    'em_andamento',
    'encerrada',
    'abandonada'
);


ALTER TYPE public.status_partida OWNER TO postgres;

--
-- Name: set_atualizado_em(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_atualizado_em() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_atualizado_em() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- Name: bot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bot (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    criado_por_id uuid NOT NULL,
    nome character varying(60) NOT NULL,
    nivel_dificuldade public.dificuldade_bot NOT NULL,
    descricao text,
    parametros_estrategia jsonb DEFAULT '{}'::jsonb NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bot OWNER TO postgres;

--
-- Name: comentario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comentario (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    jogador_id uuid NOT NULL,
    puzzle_lichess_id character varying(40) NOT NULL,
    texto text NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT comentario_texto_check CHECK (((length(btrim(texto)) >= 1) AND (length(btrim(texto)) <= 1000)))
);


ALTER TABLE public.comentario OWNER TO postgres;

--
-- Name: jogador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jogador (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    rating integer DEFAULT 1200 NOT NULL,
    partidas_jogadas integer DEFAULT 0 NOT NULL,
    partidas_vencidas integer DEFAULT 0 NOT NULL,
    partidas_perdidas integer DEFAULT 0 NOT NULL,
    puzzles_resolvidos integer DEFAULT 0 NOT NULL,
    serie_dias integer DEFAULT 0 NOT NULL,
    ultima_atividade timestamp with time zone,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_jogador_totais CHECK (((partidas_vencidas + partidas_perdidas) <= partidas_jogadas)),
    CONSTRAINT jogador_partidas_jogadas_check CHECK ((partidas_jogadas >= 0)),
    CONSTRAINT jogador_partidas_perdidas_check CHECK ((partidas_perdidas >= 0)),
    CONSTRAINT jogador_partidas_vencidas_check CHECK ((partidas_vencidas >= 0)),
    CONSTRAINT jogador_puzzles_resolvidos_check CHECK ((puzzles_resolvidos >= 0)),
    CONSTRAINT jogador_rating_check CHECK ((rating > 0)),
    CONSTRAINT jogador_serie_dias_check CHECK ((serie_dias >= 0))
);


ALTER TABLE public.jogador OWNER TO postgres;

--
-- Name: lance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    partida_id uuid NOT NULL,
    numero integer NOT NULL,
    uci character varying(6) NOT NULL,
    fen_antes text NOT NULL,
    tempo_ms integer,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lance_numero_check CHECK ((numero > 0)),
    CONSTRAINT lance_tempo_ms_check CHECK (((tempo_ms IS NULL) OR (tempo_ms >= 0)))
);


ALTER TABLE public.lance OWNER TO postgres;

--
-- Name: partida; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partida (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    jogador_brancas_id uuid NOT NULL,
    jogador_pretas_id uuid NOT NULL,
    resultado public.resultado_partida,
    status public.status_partida DEFAULT 'em_andamento'::public.status_partida NOT NULL,
    fen_final text,
    iniciada_em timestamp with time zone DEFAULT now() NOT NULL,
    encerrada_em timestamp with time zone,
    CONSTRAINT ck_partida_jogadores_distintos CHECK ((jogador_brancas_id <> jogador_pretas_id)),
    CONSTRAINT ck_partida_ordem_temporal CHECK (((encerrada_em IS NULL) OR (encerrada_em >= iniciada_em))),
    CONSTRAINT ck_partida_status_resultado CHECK ((((status = 'em_andamento'::public.status_partida) AND (resultado IS NULL) AND (encerrada_em IS NULL)) OR ((status = ANY (ARRAY['encerrada'::public.status_partida, 'abandonada'::public.status_partida])) AND (resultado IS NOT NULL) AND (encerrada_em IS NOT NULL))))
);


ALTER TABLE public.partida OWNER TO postgres;

--
-- Name: progresso_puzzle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progresso_puzzle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    jogador_id uuid NOT NULL,
    fase integer NOT NULL,
    puzzles_concluidos integer DEFAULT 0 NOT NULL,
    fase_concluida boolean DEFAULT false NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT progresso_puzzle_fase_check CHECK ((fase > 0)),
    CONSTRAINT progresso_puzzle_puzzles_concluidos_check CHECK ((puzzles_concluidos >= 0))
);


ALTER TABLE public.progresso_puzzle OWNER TO postgres;

--
-- Name: puzzle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puzzle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    adicionado_por_id uuid,
    lichess_id character varying(20),
    nome character varying(120),
    fen text NOT NULL,
    solucao text[] NOT NULL,
    rating integer DEFAULT 1200 NOT NULL,
    temas text[],
    fase integer NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT puzzle_fase_check CHECK ((fase > 0)),
    CONSTRAINT puzzle_rating_check CHECK (((rating >= 0) AND (rating <= 4000)))
);


ALTER TABLE public.puzzle OWNER TO postgres;

--
-- Name: puzzles_resolvidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puzzles_resolvidos (
    id integer NOT NULL,
    jogador_id uuid NOT NULL,
    puzzle_id character varying(40) NOT NULL,
    fase integer NOT NULL,
    rating integer,
    tentativas integer DEFAULT 1 NOT NULL,
    acertou boolean DEFAULT true NOT NULL,
    anotacao text,
    resolvido_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT puzzles_resolvidos_fase_check CHECK ((fase > 0)),
    CONSTRAINT puzzles_resolvidos_rating_check CHECK (((rating IS NULL) OR ((rating >= 0) AND (rating <= 4000)))),
    CONSTRAINT puzzles_resolvidos_tentativas_check CHECK ((tentativas >= 1))
);


ALTER TABLE public.puzzles_resolvidos OWNER TO postgres;

--
-- Name: puzzles_resolvidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.puzzles_resolvidos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.puzzles_resolvidos_id_seq OWNER TO postgres;

--
-- Name: puzzles_resolvidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.puzzles_resolvidos_id_seq OWNED BY public.puzzles_resolvidos.id;


--
-- Name: tema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tema (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    criado_por_id uuid NOT NULL,
    nome character varying(60) NOT NULL,
    descricao text,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tema OWNER TO postgres;

--
-- Name: tentativa_puzzle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tentativa_puzzle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    jogador_id uuid NOT NULL,
    puzzle_id uuid NOT NULL,
    lance_enviado character varying(6) NOT NULL,
    correto boolean NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tentativa_puzzle OWNER TO postgres;

--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(80) NOT NULL,
    sobrenome character varying(80) NOT NULL,
    username character varying(40) NOT NULL,
    email character varying(120) NOT NULL,
    senha_hash text NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: puzzles_resolvidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puzzles_resolvidos ALTER COLUMN id SET DEFAULT nextval('public.puzzles_resolvidos_id_seq'::regclass);


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (id, usuario_id, criado_em) FROM stdin;
af228d8b-c413-49fa-abff-df6ec5826de9	f40270a3-8b92-41d0-9344-9c07e4998db0	2026-06-09 00:10:53.83319-03
\.


--
-- Data for Name: bot; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bot (id, criado_por_id, nome, nivel_dificuldade, descricao, parametros_estrategia, ativo, criado_em) FROM stdin;
8e12ed3e-376d-4687-9de3-26f23d0728ab	af228d8b-c413-49fa-abff-df6ec5826de9	ryan iketani	medio	putinha	{"agressividade": 50}	t	2026-06-09 11:47:57.060688-03
\.


--
-- Data for Name: comentario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comentario (id, jogador_id, puzzle_lichess_id, texto, criado_em, atualizado_em) FROM stdin;
\.


--
-- Data for Name: jogador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jogador (id, usuario_id, rating, partidas_jogadas, partidas_vencidas, partidas_perdidas, puzzles_resolvidos, serie_dias, ultima_atividade, criado_em) FROM stdin;
e3c498c4-1543-4e9a-add5-a29ffed64a08	f40270a3-8b92-41d0-9344-9c07e4998db0	1200	0	0	0	0	0	\N	2026-06-09 00:09:52.798992-03
\.


--
-- Data for Name: lance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lance (id, partida_id, numero, uci, fen_antes, tempo_ms, criado_em) FROM stdin;
\.


--
-- Data for Name: partida; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partida (id, jogador_brancas_id, jogador_pretas_id, resultado, status, fen_final, iniciada_em, encerrada_em) FROM stdin;
\.


--
-- Data for Name: progresso_puzzle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progresso_puzzle (id, jogador_id, fase, puzzles_concluidos, fase_concluida, atualizado_em) FROM stdin;
\.


--
-- Data for Name: puzzle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.puzzle (id, adicionado_por_id, lichess_id, nome, fen, solucao, rating, temas, fase, ativo, criado_em) FROM stdin;
\.


--
-- Data for Name: puzzles_resolvidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.puzzles_resolvidos (id, jogador_id, puzzle_id, fase, rating, tentativas, acertou, anotacao, resolvido_em, atualizado_em) FROM stdin;
\.


--
-- Data for Name: tema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tema (id, criado_por_id, nome, descricao, ativo, criado_em, atualizado_em) FROM stdin;
\.


--
-- Data for Name: tentativa_puzzle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tentativa_puzzle (id, jogador_id, puzzle_id, lance_enviado, correto, criado_em) FROM stdin;
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id, nome, sobrenome, username, email, senha_hash, ativo, criado_em, atualizado_em) FROM stdin;
f40270a3-8b92-41d0-9344-9c07e4998db0	Victor	Sampaio	administrador	admin@gmail.com	$2a$10$HegtfcV8yj.kc1Iu8AJDpeWfBU9qHz4ds9s3J0tUU06S6OACbFUEG	t	2026-06-09 00:09:52.798992-03	2026-06-09 00:09:52.798992-03
\.


--
-- Name: puzzles_resolvidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.puzzles_resolvidos_id_seq', 1, false);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- Name: admin admin_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_usuario_id_key UNIQUE (usuario_id);


--
-- Name: bot bot_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot
    ADD CONSTRAINT bot_pkey PRIMARY KEY (id);


--
-- Name: comentario comentario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_pkey PRIMARY KEY (id);


--
-- Name: jogador jogador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jogador
    ADD CONSTRAINT jogador_pkey PRIMARY KEY (id);


--
-- Name: jogador jogador_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jogador
    ADD CONSTRAINT jogador_usuario_id_key UNIQUE (usuario_id);


--
-- Name: lance lance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lance
    ADD CONSTRAINT lance_pkey PRIMARY KEY (id);


--
-- Name: partida partida_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partida
    ADD CONSTRAINT partida_pkey PRIMARY KEY (id);


--
-- Name: progresso_puzzle progresso_puzzle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresso_puzzle
    ADD CONSTRAINT progresso_puzzle_pkey PRIMARY KEY (id);


--
-- Name: puzzle puzzle_lichess_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puzzle
    ADD CONSTRAINT puzzle_lichess_id_key UNIQUE (lichess_id);


--
-- Name: puzzle puzzle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puzzle
    ADD CONSTRAINT puzzle_pkey PRIMARY KEY (id);


--
-- Name: puzzles_resolvidos puzzles_resolvidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puzzles_resolvidos
    ADD CONSTRAINT puzzles_resolvidos_pkey PRIMARY KEY (id);


--
-- Name: tema tema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tema
    ADD CONSTRAINT tema_pkey PRIMARY KEY (id);


--
-- Name: tentativa_puzzle tentativa_puzzle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tentativa_puzzle
    ADD CONSTRAINT tentativa_puzzle_pkey PRIMARY KEY (id);


--
-- Name: bot uq_bot_nome; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot
    ADD CONSTRAINT uq_bot_nome UNIQUE (nome);


--
-- Name: puzzles_resolvidos uq_jogador_puzzle; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puzzles_resolvidos
    ADD CONSTRAINT uq_jogador_puzzle UNIQUE (jogador_id, puzzle_id);


--
-- Name: lance uq_lance_partida_numero; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lance
    ADD CONSTRAINT uq_lance_partida_numero UNIQUE (partida_id, numero);


--
-- Name: progresso_puzzle uq_progresso_jogador_fase; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresso_puzzle
    ADD CONSTRAINT uq_progresso_jogador_fase UNIQUE (jogador_id, fase);


--
-- Name: tema uq_tema_nome; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tema
    ADD CONSTRAINT uq_tema_nome UNIQUE (nome);


--
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- Name: usuario usuario_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_username_key UNIQUE (username);


--
-- Name: idx_comentario_jogador; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comentario_jogador ON public.comentario USING btree (jogador_id);


--
-- Name: idx_comentario_puzzle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comentario_puzzle ON public.comentario USING btree (puzzle_lichess_id, criado_em DESC);


--
-- Name: idx_lance_partida; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lance_partida ON public.lance USING btree (partida_id);


--
-- Name: idx_partida_brancas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_partida_brancas ON public.partida USING btree (jogador_brancas_id);


--
-- Name: idx_partida_pretas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_partida_pretas ON public.partida USING btree (jogador_pretas_id);


--
-- Name: idx_partida_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_partida_status ON public.partida USING btree (status);


--
-- Name: idx_progresso_jogador; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progresso_jogador ON public.progresso_puzzle USING btree (jogador_id);


--
-- Name: idx_puzzle_fase; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_puzzle_fase ON public.puzzle USING btree (fase);


--
-- Name: idx_puzzle_lichess_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_puzzle_lichess_id ON public.puzzle USING btree (lichess_id);


--
-- Name: idx_puzzles_resolvidos_fase; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_puzzles_resolvidos_fase ON public.puzzles_resolvidos USING btree (fase);


--
-- Name: idx_puzzles_resolvidos_jogador; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_puzzles_resolvidos_jogador ON public.puzzles_resolvidos USING btree (jogador_id);


--
-- Name: idx_tentativa_jogador; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tentativa_jogador ON public.tentativa_puzzle USING btree (jogador_id);


--
-- Name: idx_tentativa_puzzle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tentativa_puzzle ON public.tentativa_puzzle USING btree (puzzle_id);


--
-- Name: idx_usuario_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuario_email ON public.usuario USING btree (email);


--
-- Name: idx_usuario_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuario_username ON public.usuario USING btree (username);


--
-- Name: comentario trg_comentario_atualizado_em; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_comentario_atualizado_em BEFORE UPDATE ON public.comentario FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: progresso_puzzle trg_progresso_puzzle_atualizado_em; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_progresso_puzzle_atualizado_em BEFORE UPDATE ON public.progresso_puzzle FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: puzzles_resolvidos trg_puzzles_resolvidos_atualizado_em; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_puzzles_resolvidos_atualizado_em BEFORE UPDATE ON public.puzzles_resolvidos FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: tema trg_tema_atualizado_em; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tema_atualizado_em BEFORE UPDATE ON public.tema FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: usuario trg_usuario_atualizado_em; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_usuario_atualizado_em BEFORE UPDATE ON public.usuario FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();


--
-- Name: admin admin_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: bot bot_criado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot
    ADD CONSTRAINT bot_criado_por_id_fkey FOREIGN KEY (criado_por_id) REFERENCES public.admin(id) ON DELETE RESTRICT;


--
-- Name: comentario comentario_jogador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_jogador_id_fkey FOREIGN KEY (jogador_id) REFERENCES public.jogador(id) ON DELETE CASCADE;


--
-- Name: jogador jogador_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jogador
    ADD CONSTRAINT jogador_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- Name: lance lance_partida_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lance
    ADD CONSTRAINT lance_partida_id_fkey FOREIGN KEY (partida_id) REFERENCES public.partida(id) ON DELETE CASCADE;


--
-- Name: partida partida_jogador_brancas_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partida
    ADD CONSTRAINT partida_jogador_brancas_id_fkey FOREIGN KEY (jogador_brancas_id) REFERENCES public.jogador(id) ON DELETE RESTRICT;


--
-- Name: partida partida_jogador_pretas_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partida
    ADD CONSTRAINT partida_jogador_pretas_id_fkey FOREIGN KEY (jogador_pretas_id) REFERENCES public.jogador(id) ON DELETE RESTRICT;


--
-- Name: progresso_puzzle progresso_puzzle_jogador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresso_puzzle
    ADD CONSTRAINT progresso_puzzle_jogador_id_fkey FOREIGN KEY (jogador_id) REFERENCES public.jogador(id) ON DELETE CASCADE;


--
-- Name: puzzle puzzle_adicionado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puzzle
    ADD CONSTRAINT puzzle_adicionado_por_id_fkey FOREIGN KEY (adicionado_por_id) REFERENCES public.admin(id) ON DELETE SET NULL;


--
-- Name: puzzles_resolvidos puzzles_resolvidos_jogador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puzzles_resolvidos
    ADD CONSTRAINT puzzles_resolvidos_jogador_id_fkey FOREIGN KEY (jogador_id) REFERENCES public.jogador(id) ON DELETE CASCADE;


--
-- Name: tema tema_criado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tema
    ADD CONSTRAINT tema_criado_por_id_fkey FOREIGN KEY (criado_por_id) REFERENCES public.admin(id) ON DELETE RESTRICT;


--
-- Name: tentativa_puzzle tentativa_puzzle_jogador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tentativa_puzzle
    ADD CONSTRAINT tentativa_puzzle_jogador_id_fkey FOREIGN KEY (jogador_id) REFERENCES public.jogador(id) ON DELETE CASCADE;


--
-- Name: tentativa_puzzle tentativa_puzzle_puzzle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tentativa_puzzle
    ADD CONSTRAINT tentativa_puzzle_puzzle_id_fkey FOREIGN KEY (puzzle_id) REFERENCES public.puzzle(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gkR4078spvlJp7XzNomfow0IAttI9jjX5U2XeHcvAYIZ9MFn32c5cFarVQSDdqo

