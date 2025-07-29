import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { title, description, assignedTo } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedTo,
        completed: false,
      },
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
}
