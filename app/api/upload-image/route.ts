import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | string | null;
    const fileName = (formData.get("fileName") as string) || `client_photo_${Date.now()}.jpg`;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "";
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";

    // If private key is configured, call ImageKit Upload REST API
    if (privateKey && privateKey !== "private_brothers_fitness") {
      const ikFormData = new FormData();
      if (typeof file === "string") {
        ikFormData.append("file", file);
      } else {
        ikFormData.append("file", file, fileName);
      }
      ikFormData.append("fileName", fileName);
      ikFormData.append("useUniqueFileName", "true");

      const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;

      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: ikFormData,
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ url: data.url, fileId: data.fileId });
      } else {
        const errorText = await response.text();
        console.warn("ImageKit upload warning, returning base64 fallback:", errorText);
      }
    }

    // Fallback: Return file base64 data url if ImageKit keys are default or demo
    let finalUrl = "";
    if (typeof file === "string") {
      finalUrl = file;
    } else {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";
      finalUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({ url: finalUrl, note: "ImageKit fallback mode active" });
  } catch (error: any) {
    console.error("Upload API route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
