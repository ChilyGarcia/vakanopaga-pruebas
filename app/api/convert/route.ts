import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount");
  const inverted = searchParams.get("inverted");
  const region = searchParams.get("region");
  let externalApiUrl = "";

  if (region == "CO") {
    externalApiUrl = `${process.env.API_COL}/api/v1/convert?amount=${amount}&inverted=${inverted}&referrals_reference=${process.env.REFERRAL_REFERENCE}&payment_method=0`;
  } else if (region == "DO") {
    externalApiUrl = `${process.env.API_DO}/api/v1/convert?amount=${amount}&inverted=${inverted}&referrals_reference=${process.env.REFERRAL_REFERENCE}&payment_method=0`;
  } else if (region == "EC") {
    externalApiUrl = `${process.env.API_ECU}/api/v1/convert?amount=${amount}&inverted=${inverted}&referrals_reference=${process.env.REFERRAL_REFERENCE}&payment_method=0`;
  }

  try {
    const response = await fetch(externalApiUrl);

    if (!response.ok) {
      throw new Error("Error en la solicitud a /convert");
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
