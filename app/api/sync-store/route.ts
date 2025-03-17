import type { NextApiRequest, NextApiResponse } from "next"
import fs from "fs/promises"
import path from "path"

const STORE_FILE_PATH = path.join(process.cwd(), "data", "store.json")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // Ensure the directory exists
      await fs.mkdir(path.dirname(STORE_FILE_PATH), { recursive: true })

      // Write the data to the file
      await fs.writeFile(STORE_FILE_PATH, JSON.stringify(req.body, null, 2))

      // Read the data back from the file
      const data = await fs.readFile(STORE_FILE_PATH, "utf-8")
      const parsedData = JSON.parse(data)

      res.status(200).json(parsedData)
    } catch (error) {
      console.error("Error syncing store:", error)
      res.status(500).json({ error: "Failed to sync store" })
    }
  } else {
    res.setHeader("Allow", ["POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

