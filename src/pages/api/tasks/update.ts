import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { id, title, description, assignedTo, completed } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id },
      data: { title, description, assignedTo, completed },
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
}
