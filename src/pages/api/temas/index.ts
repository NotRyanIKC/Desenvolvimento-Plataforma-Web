import type { NextApiRequest, NextApiResponse } from 'next';
import { listActiveTemas, toTemaDTO } from '@/lib/temas';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  const temas = await listActiveTemas();
  return res.status(200).json({ temas: temas.map(toTemaDTO) });
}

export default withRequestLog(handler);
