import { describe, expect, it } from "vitest";
import { collectUrls, normalizeLooseStatus, normalizeRecordInfo } from "@/lib/kie/adapters/normalize";

describe("normalizeRecordInfo (market recordInfo)", () => {
  it("maps waiting/queuing to pending and generating to running", () => {
    expect(normalizeRecordInfo({ state: "waiting" }, "image").state).toBe("pending");
    expect(normalizeRecordInfo({ state: "queuing" }, "image").state).toBe("pending");
    expect(normalizeRecordInfo({ state: "generating", progress: 45 }, "image")).toMatchObject({
      state: "running",
      progress: 45,
      outputs: [],
    });
  });

  it("parses resultJson string and extracts resultUrls on success", () => {
    const s = normalizeRecordInfo(
      {
        state: "success",
        resultJson: JSON.stringify({ resultUrls: ["https://tempfile.aiquickdraw.com/a.png", "https://x.test/b.jpg"] }),
        creditsConsumed: 4,
      },
      "image",
    );
    expect(s.state).toBe("success");
    expect(s.creditsConsumed).toBe(4);
    expect(s.outputs.map((o) => [o.url, o.kind])).toEqual([
      ["https://tempfile.aiquickdraw.com/a.png", "image"],
      ["https://x.test/b.jpg", "image"],
    ]);
  });

  it("collects Seedance lastFrameUrl alongside the video", () => {
    const s = normalizeRecordInfo(
      { state: "success", resultJson: JSON.stringify({ resultUrls: ["https://x.test/v.mp4"], lastFrameUrl: ["https://x.test/f.png"] }) },
      "video",
    );
    expect(s.outputs.map((o) => o.kind)).toEqual(["video", "image"]);
  });

  it("reads Suno tracks from data.response.data[] and skips stream URLs", () => {
    const s = normalizeRecordInfo(
      {
        state: "success",
        resultJson: "",
        response: {
          data: [
            { id: "1", audio_url: "https://x.test/1.mp3", stream_audio_url: "https://x.test/stream/1", image_url: "https://x.test/1.jpeg" },
          ],
        },
      },
      "audio",
    );
    expect(s.outputs.map((o) => [o.source, o.kind])).toEqual([
      ["audio_url", "audio"],
      ["image_url", "image"],
    ]);
  });

  it("returns resultObject for text outputs", () => {
    const s = normalizeRecordInfo(
      { state: "success", resultJson: JSON.stringify({ resultObject: { subject_status: 1 } }) },
      "tools",
    );
    expect(s.outputs).toEqual([]);
    expect(s.resultObject).toEqual({ subject_status: 1 });
  });

  it("surfaces failCode and failMsg on fail", () => {
    const s = normalizeRecordInfo({ state: "fail", failCode: "500", failMsg: "content policy", resultJson: null }, "video");
    expect(s.state).toBe("fail");
    expect(s.error).toEqual({ code: "500", message: "content policy" });
  });

  it("treats unknown states as still running (keeps polling)", () => {
    expect(normalizeRecordInfo({ state: "mystery" }, "image").state).toBe("running");
  });

  it("does not crash on malformed resultJson", () => {
    const s = normalizeRecordInfo({ state: "success", resultJson: "{not json" }, "image");
    expect(s.state).toBe("success");
    expect(s.outputs).toEqual([]);
  });
});

describe("collectUrls", () => {
  it("ignores callback URLs and the echoed request param", () => {
    const out = collectUrls({ callBackUrl: "https://me.test/cb", param: "https://x.test/p.png", resultUrls: ["https://x.test/r.png"] }, "image");
    expect(out.map((o) => o.url)).toEqual(["https://x.test/r.png"]);
  });
  it("de-duplicates", () => {
    expect(collectUrls(["https://x.test/a.png", "https://x.test/a.png"], "image")).toHaveLength(1);
  });
});

describe("normalizeLooseStatus (suno recovery, undocumented shape)", () => {
  it("maps common spellings", () => {
    expect(normalizeLooseStatus({ status: "SUCCESS", url: "https://x.test/a.mp3" }, "tools")).toMatchObject({
      state: "success",
      outputs: [{ url: "https://x.test/a.mp3", kind: "audio" }],
    });
    expect(normalizeLooseStatus({ status: "FAILED", errorMessage: "gone" }, "tools").error?.message).toBe("gone");
    expect(normalizeLooseStatus({ status: "PENDING" }, "tools").state).toBe("pending");
    expect(normalizeLooseStatus(null, "tools").state).toBe("running");
  });
});
