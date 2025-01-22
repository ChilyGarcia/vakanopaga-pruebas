import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  let externalApiUrl = "";
  let xApiKey = "";

  if (region === "CO") {
    externalApiUrl = `${process.env.API_COL}/api/v1/store`;
    xApiKey = process.env.X_API_KEY_COL || "";
  } else if (region === "DO") {
    externalApiUrl = `${process.env.API_DO}/api/v1/store`;
    xApiKey = process.env.X_API_KEY_DO || "";
  } else if (region === "EC") {
    externalApiUrl = `${process.env.API_ECU}/api/v1/store`;
    xApiKey = process.env.X_API_KEY_ECU || "";
  }

  console.log("External API URL:", externalApiUrl);
  console.log("x-api-key:", xApiKey);

  try {
    const body = await req.json();
    console.log("Contenido del body:", body);
    body.referrals_reference = process.env.NEXT_PUBLIC_REFERRALS_REFERENCE;

    if (!xApiKey) {
      console.log("No hay una llave valida para ejecutar la peticion");
      return;
    }

    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": xApiKey,
      },
      body: JSON.stringify(body),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("Error response from external API:", errorResponse);
      throw new Error(
        `External API error: ${response.status} - ${errorResponse}`
      );
    }

    const data = await response.json();
    console.log("Response data:", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error caught in POST handler:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
