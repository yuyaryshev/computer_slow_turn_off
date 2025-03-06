// DOMAIN(ScheduleSerie)
import { Request, Response } from "express";
import { ApiPrereq } from "../Base/BaseApi";

export function publishScheduleSerieApi(apiPrereq: ApiPrereq) {
    const router = apiPrereq.router;

    // Query ScheduleSeries
    router.get("/ScheduleSerie", async (req: Request, res: Response): Promise<void> => {
        try {
            const extend = req.query.extend ? JSON.parse(req.query.extend as string) : {};
            const objects = (await apiPrereq.domains.ScheduleSerie.query(extend)).map((ScheduleSerie: any) =>
                apiPrereq.domains.ScheduleSerie.serialize(ScheduleSerie)
            );
            res.json({ objects });
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get ScheduleSerie by ID
    router.get("/ScheduleSerie/:id", async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const extend = req.query.extend ? JSON.parse(req.query.extend as string) : {};
            const obj = await apiPrereq.domains.ScheduleSerie.get(id, extend);
            if (!obj) {
                 res.status(404).json({ error: `ScheduleSerie with id ${id} does not exist!` });
                 return
            }
            res.json(await apiPrereq.domains.ScheduleSerie.serialize(obj));
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Create or Update ScheduleSerie
    router.put("/ScheduleSerie", async (req: Request, res: Response): Promise<void> => {
        try {
            await apiPrereq.domains.ScheduleSerie.upsert(req.body);
            res.status(200).json({});
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Delete ScheduleSerie by ID
    router.delete("/ScheduleSerie/:id", async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await apiPrereq.domains.ScheduleSerie.delete(id);
            res.status(200).json({});
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    });
}
