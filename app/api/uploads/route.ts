import { KieError } from "@/lib/kie/errors";
import { errorResponse, noStore } from "@/lib/server/http";
import { listUploads, saveUpload, UploadError } from "@/lib/server/uploads";

/** Local reference library: files are saved here, never sent to Kie.ai until submit. */
export async function GET() {
  return noStore({ uploads: listUploads() });
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return errorResponse(new KieError("validation", "No file in upload"));
  try {
    const upload = await saveUpload(file, { width: form!.get("width"), height: form!.get("height"), duration: form!.get("duration") });
    return noStore({ upload });
  } catch (e) {
    if (e instanceof UploadError) return errorResponse(new KieError("validation", e.message));
    return errorResponse(e);
  }
}
