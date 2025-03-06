// DOMAIN(Person)
import { Request, Response } from "express";
import { ServerEnv } from "../../ServerEnv";
import { ApiPrereq } from "../Base/BaseApi";

export function publishPersonApi(apiPrereq: ApiPrereq) {
    const router = apiPrereq.router;

    // Query Persons
    router.get("/Person", async (req: Request, res: Response): Promise<void> => {
        try {
            const extend = req.query.extend ? JSON.parse(req.query.extend as string) : {};
            const objects = (await apiPrereq.domains.Person.query(extend)).map((person: any) =>
                apiPrereq.domains.Person.serialize(person)
            );
            res.json({ objects });
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get Person by ID
    router.get("/Person/:id", async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const extend = req.query.extend ? JSON.parse(req.query.extend as string) : {};
            const obj = await apiPrereq.domains.Person.get(id, extend);
            if (!obj) {
                 res.status(404).json({ error: `Person with id ${id} does not exist!` });
                return
            }
            res.json(await apiPrereq.domains.Person.serialize(obj));
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Create or Update Person
    router.put("/Person", async (req: Request, res: Response): Promise<void> => {
        try {
            await apiPrereq.domains.Person.upsert(req.body);
            res.status(200).json({});
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    });

    // Delete Person by ID
    router.delete("/Person/:id", async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await apiPrereq.domains.Person.delete(id);
            res.status(200).json({});
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    });
}
