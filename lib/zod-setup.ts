import { z } from "zod";
import { isCloud } from "@/lib/mode";

// The cloud CSP forbids eval. zod probes `new Function` when its first object schema is built, and the
// blocked probe is reported as a CSP violation; jitless skips it. Import this module before any zod schema.
if (isCloud()) z.config({ jitless: true });
