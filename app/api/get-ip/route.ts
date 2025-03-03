import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];

  const ip_ecu = "102.177.160.0";

  console.log(ip);

  try {
    const response = await fetch(`https://ip.wld.lol/${ip_ecu}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error de la API: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(data);

    const country = data.country;

    return NextResponse.json({ country });
  } catch (error) {
    console.error("Error al obtener la IP:", error);

    return new NextResponse(
      JSON.stringify({ error: "Error al procesar la petición" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
