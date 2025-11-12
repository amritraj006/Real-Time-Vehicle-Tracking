app.use("/api/inngest", serve({ client: inngest, functions })); 
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";