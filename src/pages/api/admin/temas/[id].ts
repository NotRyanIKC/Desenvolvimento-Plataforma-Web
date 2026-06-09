import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/admin';
import { deleteTema, findTemaById, toTemaDTO, updateTema, type UpdateTemaInput } from '@/lib/temas';
import { firstError, validateTemaDescricao, validateTemaNome } from '@/lib/validation';
import { withRequestLog } from '@/lib/withRequestLog';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({
      error: auth.status === 401 ? 'Não autenticado.' : 'Acesso restrito a administradores.',
    });
  }

  const id = String(req.query.id ?? '');
  if (!UUID_RE.test(id)) return res.status(400).json({ error: 'ID do tema inválido.' });

  if (req.method === 'GET') {
    const tema = await findTemaById(id);
    if (!tema) return res.status(404).json({ error: 'Tema não encontrado.' });
    return res.status(200).json({ tema: toTemaDTO(tema) });
  }

  if (req.method === 'PATCH') {
    const { nome, descricao, ativo } = req.body ?? {};
    const erro = firstError(
      nome !== undefined ? validateTemaNome(nome) : null,
      descricao !== undefined ? validateTemaDescricao(descricao) : null,
      ativo !== undefined && typeof ativo !== 'boolean' ? 'ativo deve ser booleano.' : null
    );
    if (erro) return res.status(400).json({ error: erro });
    const input: UpdateTemaInput = { nome, descricao, ativo };

    try {
      const tema = await updateTema(id, input);
      if (!tema) return res.status(404).json({ error: 'Tema não encontrado.' });
      return res.status(200).json({ tema: toTemaDTO(tema) });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === '23505') {
        return res.status(409).json({ error: 'Já existe um tema com esse nome.' });
      }
      console.error('Erro em PATCH /api/admin/temas/[id]:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  if (req.method === 'DELETE') {
    const result = await deleteTema(id);
    if (result === 'not_found') return res.status(404).json({ error: 'Tema não encontrado.' });
    if (result === 'in_use') return res.status(409).json({ error: 'Tema associado a puzzles. Reclassifique os puzzles antes de excluir.' });
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  return res.status(405).json({ error: 'Método não permitido.' });
}

export default withRequestLog(handler);
