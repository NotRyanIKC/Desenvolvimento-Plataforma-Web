import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/admin';
import { createTema, listAllTemas, toTemaDTO } from '@/lib/temas';
import { firstError, validateTemaDescricao, validateTemaNome } from '@/lib/validation';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({
      error: auth.status === 401 ? 'Não autenticado.' : 'Acesso restrito a administradores.',
    });
  }

  if (req.method === 'GET') {
    const temas = await listAllTemas();
    return res.status(200).json({ temas: temas.map(toTemaDTO) });
  }

  if (req.method === 'POST') {
    const { nome, descricao, ativo } = req.body ?? {};
    const erro = firstError(
      validateTemaNome(nome),
      descricao !== undefined ? validateTemaDescricao(descricao) : null,
      ativo !== undefined && typeof ativo !== 'boolean' ? 'ativo deve ser booleano.' : null
    );
    if (erro) return res.status(400).json({ error: erro });

    try {
      const tema = await createTema({ nome, descricao, ativo }, auth.adminId);
      return res.status(201).json({ tema: toTemaDTO(tema) });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === '23505') {
        return res.status(409).json({ error: 'Já existe um tema com esse nome.' });
      }
      console.error('Erro em POST /api/admin/temas:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Método não permitido.' });
}

export default withRequestLog(handler);
