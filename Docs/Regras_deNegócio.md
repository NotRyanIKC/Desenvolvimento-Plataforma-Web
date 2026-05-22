# Regras de Negócio — Plataforma de Xadrez

**Versão:** 1.0
**Data:** 22/05/2026
**Escopo:** Regras oficiais de jogo (padrão FIDE) estruturadas para implementação em sistema digital.
**Convenção:** Cada regra recebe um identificador único `RN-XXX` para rastreabilidade em código, testes e documentação técnica.

---

## Sumário

1. Glossário
2. Módulo 1 — Estrutura do Jogo
3. Módulo 2 — Turno e Sequência
4. Módulo 3 — Movimentação das Peças
5. Módulo 4 — Lances Especiais (Roque, En Passant, Promoção)
6. Módulo 5 — Xeque
7. Módulo 6 — Xeque-mate
8. Módulo 7 — Empates
9. Módulo 8 — Validação de Lances (Legal vs Ilegal)
10. Módulo 9 — Estados de Jogo
11. Módulo 10 — Encerramento
12. Anexo A — Tabela de Referência Cruzada
13. Anexo B — Considerações de Implementação

---

## Glossário

- **Casa**: cada uma das 64 unidades do tabuleiro.
- **Casa atacada**: casa para a qual ao menos uma peça adversária poderia se mover, mesmo que tal movimento exponha o próprio rei adversário.
- **Coluna (file)**: identificada por letras de `a` a `h`.
- **Linha (rank)**: identificada por números de `1` a `8`.
- **Notação algébrica**: combinação coluna+linha (ex: `e4`).
- **Peça**: rei, dama, torre, bispo, cavalo ou peão.
- **Lance**: ação de mover uma peça pelo jogador da vez (1 lance = 1 meio-lance/ply).
- **Lance completo**: 1 lance das brancas + 1 lance das pretas.
- **Linha de ataque**: trajeto reto ou diagonal que uma peça de longo alcance percorre para atacar.
- **Material**: conjunto de peças de um jogador presentes no tabuleiro.

---

## Módulo 1 — Estrutura do Jogo

### RN-001 — Tabuleiro
O tabuleiro é uma matriz 8×8 (64 casas), alternando cores claras e escuras. A casa `a1` é escura; a casa `h1` é clara. O tabuleiro deve ser posicionado com uma casa clara à direita de cada jogador.

### RN-002 — Cores dos Jogadores
A partida envolve exatamente dois jogadores: um controla as peças **brancas**, o outro as peças **pretas**.

### RN-003 — Conjunto de Peças
Cada jogador inicia com 16 peças:
- 1 Rei (K)
- 1 Dama (Q)
- 2 Torres (R)
- 2 Bispos (B)
- 2 Cavalos (N)
- 8 Peões (P)

### RN-004 — Posição Inicial
**Brancas:**
- Linha 1: Torre(a1), Cavalo(b1), Bispo(c1), Dama(d1), Rei(e1), Bispo(f1), Cavalo(g1), Torre(h1)
- Linha 2: peões em a2–h2

**Pretas (espelhado):**
- Linha 8: Torre(a8), Cavalo(b8), Bispo(c8), Dama(d8), Rei(e8), Bispo(f8), Cavalo(g8), Torre(h8)
- Linha 7: peões em a7–h7

### RN-005 — Ocupação de Casas
Em qualquer estado do jogo, uma casa está vazia ou ocupada por **exatamente uma** peça. Duas peças nunca podem ocupar a mesma casa.

---

## Módulo 2 — Turno e Sequência

### RN-010 — Primeiro Lance
As brancas executam obrigatoriamente o primeiro lance da partida.

### RN-011 — Alternância de Turnos
Após cada lance válido, o turno passa para o jogador adversário. Não é permitido "passar a vez".

### RN-012 — Obrigatoriedade de Lance
O jogador da vez é obrigado a executar um lance legal. Se não houver lance legal disponível, aplicam-se as regras de xeque-mate (RN-070) ou afogamento (RN-080).

### RN-013 — Unicidade do Lance
Cada turno consiste em **exatamente um lance**. Exceção: o roque (RN-040) move duas peças no mesmo lance.

### RN-014 — Captura
Quando uma peça move-se para uma casa ocupada por peça adversária, a peça adversária é removida do tabuleiro e marcada como capturada. Peças da mesma cor nunca podem coexistir na casa de destino.

### RN-015 — Imutabilidade Após Confirmação
Após confirmação do lance pelo sistema, ele é definitivo (princípio "peça tocada, peça jogada"). O sistema deve registrar o lance como imutável a partir do momento da confirmação.

---

## Módulo 3 — Movimentação das Peças

### RN-020 — Rei
Move-se exatamente 1 casa em qualquer direção (horizontal, vertical ou diagonal). Não pode mover-se para casa atacada por peça adversária. Exceção: roque (RN-040).

### RN-021 — Dama
Move-se qualquer número de casas em linha reta (horizontal, vertical ou diagonal), desde que o trajeto esteja desobstruído. Pode capturar a primeira peça adversária no caminho.

### RN-022 — Torre
Move-se qualquer número de casas em linha reta (horizontal ou vertical), desde que o trajeto esteja desobstruído. Pode capturar a primeira peça adversária no caminho.

### RN-023 — Bispo
Move-se qualquer número de casas em diagonal, desde que o trajeto esteja desobstruído. Cada bispo permanece confinado às casas da cor em que iniciou (bispo de casas claras / bispo de casas escuras). Pode capturar a primeira peça adversária no caminho.

### RN-024 — Cavalo
Move-se em "L": 2 casas em uma direção (horizontal ou vertical) + 1 casa em direção perpendicular. **É a única peça que pode saltar sobre outras peças** (próprias ou adversárias). A captura ocorre apenas na casa de destino.

### RN-025 — Peão (Avanço)
- Avança 1 casa para frente (em direção ao campo adversário) somente se a casa estiver vazia.
- No **primeiro lance** de cada peão (a partir da posição inicial), pode optar por avançar 2 casas, desde que ambas estejam vazias.
- Nunca se move para trás.

### RN-026 — Peão (Captura)
- Captura apenas na diagonal frontal (1 casa à frente, à esquerda ou à direita).
- Não captura no avanço frontal.
- Exceção: captura *en passant* (RN-041).

---

## Módulo 4 — Lances Especiais

### RN-040 — Roque (definição)
Lance único que move o rei e uma torre simultaneamente. Existem duas modalidades:
- **Roque Curto (O-O)**: do lado do rei.
- **Roque Longo (O-O-O)**: do lado da dama.

**Mecânica:**
- Roque Curto (brancas): rei `e1` → `g1`, torre `h1` → `f1`.
- Roque Longo (brancas): rei `e1` → `c1`, torre `a1` → `d1`.
- Roque Curto (pretas): rei `e8` → `g8`, torre `h8` → `f8`.
- Roque Longo (pretas): rei `e8` → `c8`, torre `a8` → `d8`.

### RN-040.1 — Condições do Roque
O roque é legal **se, e somente se, TODAS** as condições abaixo forem verdadeiras:

1. O rei **nunca se moveu** durante a partida.
2. A torre envolvida **nunca se moveu** durante a partida.
3. **Não há peças** (próprias ou adversárias) entre o rei e a torre.
4. O rei **não está em xeque** no momento do lance.
5. O rei **não passa por casa atacada** durante o trajeto.
6. O rei **não termina em casa atacada**.

**Observação:** a torre PODE passar/terminar em casa atacada — a restrição aplica-se exclusivamente ao rei.

### RN-040.2 — Perda do Direito ao Roque
- Mover o rei invalida **permanentemente** ambos os roques daquele jogador.
- Mover uma torre invalida **permanentemente** o roque do lado daquela torre.
- A captura da torre também invalida o roque daquele lado.
- A invalidação é permanente mesmo que o rei/torre retorne posteriormente à posição original.

### RN-041 — Captura En Passant
Quando um peão avança 2 casas (a partir da posição inicial) e termina **ao lado de um peão adversário**, este peão adversário pode capturá-lo *como se* o peão tivesse avançado apenas 1 casa.

**Condições obrigatórias:**
1. O peão capturado deve ter avançado 2 casas no **lance imediatamente anterior**.
2. A captura *en passant* deve ser executada **no lance seguinte** ao avanço — o direito expira após qualquer outro lance.
3. O peão capturador deve estar posicionado na linha 5 (brancas) ou linha 4 (pretas).

### RN-042 — Promoção do Peão
Quando um peão alcança a última fileira (linha 8 para brancas, linha 1 para pretas):
1. O peão **deve obrigatoriamente ser promovido** no mesmo lance.
2. O jogador escolhe entre: Dama, Torre, Bispo ou Cavalo (da mesma cor).
3. A escolha **independe** das peças já capturadas — é possível ter, por exemplo, duas damas simultaneamente.
4. Não é permitido manter o peão na última fileira, nem promovê-lo a rei ou peão.
5. A promoção pode ocorrer também em lance de captura, se a captura levar o peão à última fileira.

---

## Módulo 5 — Xeque

### RN-060 — Definição de Xeque
Um rei está em **xeque** quando ao menos uma peça adversária ataca diretamente a casa onde o rei se encontra (isto é, poderia capturá-lo no lance seguinte se nenhuma ação fosse tomada).

### RN-061 — Obrigatoriedade de Resposta ao Xeque
Estando o rei em xeque, o jogador da vez **deve obrigatoriamente** executar um lance que retire o rei da situação de xeque. As respostas possíveis são:
1. **Capturar** a peça atacante.
2. **Bloquear** a linha de ataque, interpondo uma peça entre o atacante e o rei (não se aplica a ataques de cavalo nem a ataques de contato direto).
3. **Mover o rei** para uma casa não atacada.

### RN-062 — Proibição de Auto-Xeque
Nenhum lance pode resultar em o **próprio rei** ficar em xeque ao final do lance. Tais lances são **ilegais** e devem ser rejeitados pelo sistema.

### RN-063 — Xeque Duplo
Quando o rei é atacado simultaneamente por **duas peças** no mesmo lance (caracteristicamente em ataques descobertos), a **única resposta legal** é mover o rei. Capturar ou bloquear não é viável, pois resolveria apenas um dos ataques.

### RN-064 — Notação de Xeque
O lance que coloca o rei adversário em xeque é registrado com o sufixo `+` (ex: `Qh5+`).

---

## Módulo 6 — Xeque-mate

### RN-070 — Definição de Xeque-mate
Configura-se xeque-mate quando, **simultaneamente**:
1. O rei do jogador da vez está em **xeque** (RN-060).
2. **Não existe nenhum lance legal** disponível para o jogador.

### RN-071 — Encerramento por Xeque-mate
O xeque-mate **encerra a partida imediatamente**. O jogador que aplicou o mate vence; o jogador matriculado perde.

### RN-072 — Verificação Algorítmica
O sistema deve verificar xeque-mate após cada lance executado pelo adversário, seguindo este algoritmo:
1. Verificar se o rei do jogador da vez está em xeque.
2. Em caso afirmativo, enumerar todos os lances possíveis do jogador.
3. Para cada lance possível, simular sua execução e verificar se o rei permanece em xeque.
4. Se **nenhum** lance possível retira o rei do xeque → declarar xeque-mate.

### RN-073 — Notação de Xeque-mate
O lance que aplica mate é registrado com sufixo `#` (ex: `Qh7#`).

---

## Módulo 7 — Empates

### RN-080 — Afogamento (Stalemate)
Empate por afogamento ocorre quando:
1. O jogador da vez **NÃO está em xeque**.
2. O jogador **não possui nenhum lance legal disponível**.

A partida é encerrada imediatamente como empate.

### RN-081 — Tríplice Repetição
A partida é empate quando a **mesma posição** ocorre 3 vezes, considerando:
- Mesmo jogador a executar o lance.
- Mesmos direitos de roque para ambos os lados.
- Mesma possibilidade de *en passant*.

As três ocorrências **não precisam ser consecutivas**. A reivindicação é direito do jogador da vez. Após **5 repetições**, o empate é declarado automaticamente pelo sistema, sem necessidade de reivindicação.

### RN-082 — Regra dos 50 Lances
A partida é empate quando, nos últimos **50 lances completos** (50 das brancas + 50 das pretas, totalizando 100 meio-lances), **nenhum peão foi movido** e **nenhuma captura foi realizada**. O contador reinicia a cada captura ou movimento de peão.

### RN-083 — Material Insuficiente
A partida termina automaticamente em empate quando o material restante no tabuleiro torna o xeque-mate **impossível por qualquer sequência legal de lances**. Combinações cobertas por esta regra:
- Rei vs Rei.
- Rei + Bispo vs Rei.
- Rei + Cavalo vs Rei.
- Rei + Bispo vs Rei + Bispo (com bispos posicionados em casas da mesma cor).

**Observação:** combinações como Rei + 2 Cavalos vs Rei **não** se enquadram automaticamente, pois o mate é tecnicamente possível (embora não forçável).

### RN-084 — Acordo de Empate
A qualquer momento, durante seu próprio turno, um jogador pode oferecer empate ao adversário. O empate só se concretiza com aceitação. Em partidas cronometradas, a oferta deve ser feita **após** executar o lance e **antes** de pressionar o relógio.

### RN-085 — Tempo Esgotado com Material Insuficiente
Se um jogador esgota o tempo, mas o adversário **não possui material suficiente** para aplicar xeque-mate por qualquer sequência legal, o resultado é **empate** (não vitória por tempo).

---

## Módulo 8 — Validação de Lances

### RN-090 — Lance Legal (definição)
Um lance é **legal** se, e somente se, satisfaz **todas** as condições abaixo:

1. **Origem válida**: a casa de origem contém uma peça pertencente ao jogador da vez.
2. **Movimento válido para a peça**: o trajeto da origem até o destino respeita as regras de movimentação da peça (Módulo 3).
3. **Trajeto desobstruído**: para peças de longo alcance (Dama, Torre, Bispo), não há peças no trajeto entre origem e destino (excluindo a casa de destino). Não se aplica ao Cavalo.
4. **Casa de destino compatível**: a casa de destino está vazia OU contém peça adversária (captura). Nunca peça da mesma cor.
5. **Não-exposição do rei**: após simulação do lance, o rei do jogador da vez **não está em xeque**.
6. **Condições especiais satisfeitas**: para roque, *en passant* e promoção, todas as condições específicas (Módulo 4) estão atendidas.

### RN-091 — Lance Ilegal (definição)
Um lance é **ilegal** quando viola qualquer condição de RN-090. Em caso de ilegalidade, o sistema deve:
1. **Rejeitar** o lance.
2. **Manter** o estado de jogo inalterado.
3. **Informar** ao jogador o motivo da rejeição (código + mensagem).
4. **Não consumir** tempo de relógio em partidas cronometradas, conforme regulamento da plataforma.

### RN-092 — Categorias de Ilegalidade
Para fins de mensageria, telemetria e testes, ilegalidades classificam-se em:

| Código | Descrição |
|--------|-----------|
| ILG-001 | Peça não pertence ao jogador da vez |
| ILG-002 | Casa de origem vazia |
| ILG-003 | Movimento não condiz com o tipo da peça |
| ILG-004 | Trajeto obstruído |
| ILG-005 | Casa de destino ocupada por peça própria |
| ILG-006 | Lance deixa o próprio rei em xeque |
| ILG-007 | Roque com condições não satisfeitas |
| ILG-008 | *En passant* fora do lance permitido |
| ILG-009 | Promoção sem escolha de peça |
| ILG-010 | Lance fora do turno |

### RN-093 — Ordem de Validação
A validação deve seguir esta ordem, otimizando custo computacional e oferecendo mensagens claras ao usuário:
1. Turno correto (ILG-010).
2. Peça presente na origem (ILG-002) e propriedade (ILG-001).
3. Movimento compatível com a peça (ILG-003).
4. Trajeto desobstruído (ILG-004).
5. Destino compatível (ILG-005).
6. Condições especiais (ILG-007, ILG-008, ILG-009).
7. Não-exposição do rei (ILG-006) — última, por exigir simulação do estado.

---

## Módulo 9 — Estados de Jogo

### RN-100 — Estados Possíveis
Em qualquer momento, a partida está em **exatamente um** dos estados:

| Estado | Descrição |
|--------|-----------|
| `AGUARDANDO_INICIO` | Partida criada, ainda não iniciada |
| `EM_ANDAMENTO` | Lance regular esperado do jogador da vez |
| `EM_XEQUE` | Jogador da vez está em xeque (subestado de EM_ANDAMENTO) |
| `ENCERRADA_XEQUE_MATE` | Encerrada por xeque-mate |
| `ENCERRADA_AFOGAMENTO` | Empate por afogamento |
| `ENCERRADA_REPETICAO` | Empate por tríplice repetição |
| `ENCERRADA_50_LANCES` | Empate pela regra dos 50 lances |
| `ENCERRADA_MATERIAL` | Empate por material insuficiente |
| `ENCERRADA_ACORDO` | Empate por acordo entre jogadores |
| `ENCERRADA_DESISTENCIA` | Vitória por desistência do adversário |
| `ENCERRADA_TEMPO` | Vitória ou empate por tempo esgotado |

### RN-101 — Persistência do Estado
A cada lance confirmado, o sistema deve persistir:
- Posição completa do tabuleiro (FEN ou estrutura equivalente).
- Jogador da vez.
- Direitos de roque (4 flags: brancas O-O, brancas O-O-O, pretas O-O, pretas O-O-O).
- Casa-alvo de *en passant* (se houver).
- Contador de meio-lances desde último avanço de peão ou captura (para RN-082).
- Número do lance.
- Histórico completo de lances em notação algébrica.

### RN-102 — Notação FEN
Recomenda-se utilizar a notação **Forsyth–Edwards (FEN)** como representação canônica do estado, pela padronização internacional e compatibilidade com engines (Stockfish, Leela, etc.).

---

## Módulo 10 — Encerramento

### RN-110 — Desistência
A qualquer momento, durante seu próprio turno, o jogador pode declarar desistência. A partida é encerrada imediatamente como vitória do adversário.

### RN-111 — Tempo Esgotado
Em partidas cronometradas, quando o tempo de um jogador chega a zero:
- Se o adversário **possui material suficiente** para aplicar mate → vitória do adversário por tempo.
- Se o adversário **não possui material suficiente** → empate (RN-085).

### RN-112 — Resultado Final
O resultado é registrado segundo o padrão internacional:
- `1-0`: vitória das brancas.
- `0-1`: vitória das pretas.
- `½-½`: empate.

### RN-113 — Imutabilidade do Histórico
Após o encerramento, o histórico da partida (sequência completa de lances + estado final + resultado) deve ser persistido de forma imutável, permitindo replay e análise posteriores.

---

## Anexo A — Tabela de Referência Cruzada

| Cenário | Regras Aplicáveis |
|---------|-------------------|
| Avanço normal de peça | RN-020 a RN-025, RN-090 |
| Captura simples | RN-014, RN-090 |
| Roque curto | RN-013, RN-040, RN-040.1, RN-040.2 |
| Roque longo | RN-013, RN-040, RN-040.1, RN-040.2 |
| En passant | RN-026, RN-041 |
| Promoção | RN-025, RN-042 |
| Xeque | RN-060, RN-061, RN-062 |
| Xeque-mate | RN-070, RN-071, RN-072 |
| Afogamento | RN-080 |
| Empate técnico | RN-081, RN-082, RN-083, RN-085 |
| Validação de lance | RN-090, RN-091, RN-092, RN-093 |

---

## Anexo B — Considerações de Implementação (não normativo)

- **Representação de estado:** utilizar FEN como formato canônico (RN-102).
- **Performance:** a validação RN-090 cláusula 5 (não-exposição do rei) exige simulação do lance — atenção ao custo computacional em situações de geração massiva de movimentos (por exemplo, perft tests).
- **Otimização:** geração de movimentos legais pode precomputar tabelas de ataque por peça (bitboards) para acelerar verificação de xeque.
- **Integração com engines:** caso a plataforma ofereça análise ou oponente artificial, recomenda-se utilizar o protocolo **UCI (Universal Chess Interface)**, compatível com Stockfish e demais engines de mercado.
- **Testes:** o suite de testes deve cobrir, no mínimo: cada categoria de ILG-XXX (RN-092), cada condição de roque (RN-040.1), todos os caminhos de empate (Módulo 7) e cenários conhecidos como "perft positions".
- **Auditoria:** cada lance persistido deve registrar timestamp e identificador do jogador, para fins de antifraude e replay.

---

**Fim do documento.**