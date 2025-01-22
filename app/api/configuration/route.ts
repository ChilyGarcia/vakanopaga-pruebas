import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  let externalApiUrl = "";

  if (region == "CO") {
    externalApiUrl = `${process.env.API_COL}/api/v1/configurations?ref=${process.env.REFERRAL_REFERENCE}`;
  } else if (region == "DO") {
    externalApiUrl = `${process.env.API_DO}/api/v1/configurations?ref=${process.env.REFERRAL_REFERENCE}`;
  } else if (region == "EC") {
    externalApiUrl = `${process.env.API_ECU}/api/v1/configurations?ref=${process.env.REFERRAL_REFERENCE}`;
  }

  try {
    const response = await fetch(externalApiUrl);

    if (!response.ok) {
      throw new Error("Error en la solicitud a /configurations");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
