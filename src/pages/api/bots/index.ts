import type { NextApiRequest, NextApiResponse } from 'next';
import { listActiveBots, toBotDTO } from '@/lib/bots';
import { withRequestLog } from '@/lib/withRequestLog';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  const bots = await listActiveBots();
  return res.status(200).json({ bots: bots.map(toBotDTO) });
}

export default withRequestLog(handler);
