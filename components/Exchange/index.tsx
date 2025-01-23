"use client";

import React, { useState } from "react";

import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
  ResponseEvent,
} from "@worldcoin/minikit-js";
import { useEffect } from "react";
import { IConfiguration } from "@/interfaces/configuration.interface";
import { IOrder } from "@/interfaces/order.interface";
import ClipLoader from "react-spinners/ClipLoader";
import CountrySelector from "../country-selector";
import { SelectMenuOption } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";

const decimalPattern = /^[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]*)?$/;

export const ExchangeBlock = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sendAmount: 1,
    receiveAmount: 139,
    paymentMethod: "18",
    name: "",
    email: "",
    phone: "",
    document_number: "",
    bank_account: "",
    bank: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [country, setCountry] = useState<SelectMenuOption["value"]>("CO");

  const [sendValue, setSendValue] = useState("");
  const [receiveValue, setReceiveValue] = useState("");
  const [inverted, setInverted] = useState(1);
  const [configuration, setConfiguration] = useState<IConfiguration>();
  const [body, setBody] = useState<IOrder>();
  const [address, setAddress] = useState("");
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [response, setResponse] = useState<any>("");
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    document_number: "",
  });
  const [errorConvert, setErrorConvert] = useState("");
  const [isNequiOrDaviplata, setIsNequiOrDaviplata] = useState(false);
  const [isNequi, setIsNequi] = useState(false);
  const [isDaviplata, setIsDaviplata] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isDoneFetch, setIsDoneFetch] = useState(false);
  const [location, setLocation] = useState();

  useEffect(() => {
    console.log("Este es el valor de location", location);

    setCountry;
  }, [location]);

  useEffect(() => {
    fetch("/api/get-ip")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setLocation(data.country);
        setCountry(data.country);
      })
      .catch((error) => {
        console.error("Error al cargar la ubicación:", error);
      });
  }, []);

  const initialBody: IOrder = {
    amount: 0,
    bank: "",
    bank_account: "",
    customer_document_number: "",
    customer_email: "",
    customer_full_name: "",
    customer_phone_number: "",
    inverted: "",
    referrals_reference: "",
  };

  const initialFormData = {
    sendAmount: 1,
    receiveAmount: 139,
    paymentMethod: "18",
    name: "",
    email: "",
    phone: "",
    document_number: "",
    bank_account: "",
    bank: "",
  };

  useEffect(() => {}, []);

  const warningMessage = (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "email":
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          error = "El correo electrónico no es válido.";
        }
        break;
      case "phone":
        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(value)) {
          error = "El número de teléfono debe tener 10 dígitos.";
        }
        break;
      case "document_number":
        if (value.trim() === "") {
          error = "El número de documento no puede estar vacío.";
        }
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    validateField(id, value);
  };

  const fetchStore = async (data: any) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/store?region=${country}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).finally(() => {
        console.log("Finalizo la peticion");
        setIsLoading(false);
      });

      if (!response.ok) {
        throw new Error("Error al llamar a /api/store");
      }

      const result = await response.json();
      setIsDoneFetch(true);

      return result;
    } catch (error) {
      console.error("Error en fetchStore:", error);
      return null;
    }
  };

  useEffect(() => {
    if (isDoneFetch) {
      setFormData(initialFormData);
      setBody(initialBody);
      setIsDoneFetch(false);
      setStep(1);
    }
  }, [isDoneFetch]);

  const fetchConfiguration = async () => {
    try {
      const response = await fetch(`/api/configuration?region=${country}`);

      if (!response.ok) {
        throw new Error("Error al llamar a /api/configurations");
      }

      const result = await response.json();
      setConfiguration(result);
      return result;
    } catch (error) {
      console.error("Error en fetchConfiguration:", error);
      return null;
    }
  };

  const fetchConvert = async (data: any) => {
    try {
      const response = await fetch(
        `/api/convert?amount=${data.amount}&inverted=${data.inverted}&region=${country}`
      );

      if (!response.ok) {
        throw new Error("Error al llamar a /api/convert");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error en fetchConvert:", error);
      return null;
    }
  };

  const handleContinue = () => {
    if (step === 1 && formData.paymentMethod) {
      setStep(2);
    }

    const sanitizedReceiveValue = receiveValue.replace(/,/g, "");

    if (inverted === 1) {
      setBody({
        amount: parseFloat(sendValue),
        bank: formData.paymentMethod,
        bank_account: "",
        customer_document_number: "",
        customer_email: formData.email,
        customer_full_name: formData.name,
        customer_phone_number: formData.phone,
        inverted: "1",
        referrals_reference: process.env.NEXT_PUBLIC_REFERRALS_REFERENCE || "",
      });
    } else {
      setBody({
        amount: parseFloat(sanitizedReceiveValue),
        bank: formData.paymentMethod,
        bank_account: "",
        customer_document_number: "",
        customer_email: formData.email,
        customer_full_name: formData.name,
        customer_phone_number: formData.phone,
        inverted: "0",
        referrals_reference: process.env.NEXT_PUBLIC_REFERRALS_REFERENCE || "",
      });
    }
  };

  const validateNextButton = () => {
    if (
      parseFloat(sendValue) >= 3 &&
      parseFloat(receiveValue.replace(/,/g, "")) >= 3 &&
      formData.paymentMethod !== ""
    ) {
      setIsNextDisabled(false);
    } else {
      setIsNextDisabled(true);
    }
  };

  useEffect(() => {
    validateNextButton();
  }, []);

  const hasErrors = () => {
    return Object.values(errors).some((error) => error !== "");
  };

  const isFinalStepValid = () => {
    let requiredFields = ["name", "email", "phone", "document_number"];

    if (!isNequiOrDaviplata) {
      requiredFields.push("bank_account");
    }

    const allFieldsFilled = requiredFields.every(
      (field) =>
        typeof formData[field as keyof typeof formData] === "string" &&
        (formData[field as keyof typeof formData] as string).trim() !== ""
    );

    return allFieldsFilled && !hasErrors();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  useEffect(() => {
    console.log(
      "Se selecciono un pais, por lo tanto los endpoints son para",
      country
    );

    if (country !== "CO") {
      setIsNequi(false);
      setIsDaviplata(false);
      setIsNequiOrDaviplata(false);
    } else {
      setIsNequi(true);
      setIsDaviplata(false);
      setIsNequiOrDaviplata(true);
    }

    fetchConfiguration();

    const body = { amount: sendValue, inverted: inverted };

    fetchConvert(body).then((response) => {
      if (response) {
        const receiveValue = parseFloat(response.converted).toLocaleString(
          "en-US"
        );

        console.log(response.converted);
        console.log(receiveValue);
        setReceiveValue(receiveValue);
      }
    });
  }, [country]);

  useEffect(() => {
    const body = { amount: parseFloat("3"), inverted: 1 };

    setIsNequi(true);
    setIsNequiOrDaviplata(true);

    fetchConfiguration();

    fetchConvert(body).then((response) => {
      if (response && response.converted) {
        const receiveValue = parseFloat(response.converted).toLocaleString(
          "en-US"
        );
        setSendValue("3");
        setReceiveValue(receiveValue);

        if (
          parseFloat("3") >= 3 &&
          parseFloat(receiveValue.replace(/,/g, "")) >= 3
        ) {
          setIsNextDisabled(false);
        } else {
          setIsNextDisabled(true);
        }
      } else {
        console.error("La respuesta no tiene el formato esperado", response);
      }
    });
  }, []);

  useEffect(() => {
    validateNextButton();
  }, [sendValue, receiveValue]);

  const handleSendChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let inputValue = event.target.value.replace(/,/g, "");

    if (inputValue.trim() === "") {
      setSendValue("");
      setReceiveValue("0");
      setErrorConvert("");
      setIsNextDisabled(true);
      return;
    }

    if (inputValue.match(decimalPattern)) {
      setSendValue(inputValue);

      if (parseFloat(inputValue) < 3) {
        setErrorConvert("El monto no puede ser menor a 3 WLD.");
        setIsNextDisabled(true);
      } else {
        setErrorConvert("");
        setIsNextDisabled(false);

        let body = { amount: parseFloat(inputValue), inverted: 1 };
        setInverted(1);

        const response = await fetchConvert(body);

        if (response && response.converted) {
          setReceiveValue(
            parseFloat(response.converted).toLocaleString("en-US")
          );
        } else {
          console.error("La respuesta no tiene el formato esperado", response);
        }
      }
    }
  };

  const formatNumberWithCommas = (value: string) => {
    if (!value || isNaN(Number(value))) {
      return value;
    }

    const [integerPart, decimalPart] = value.split(".");
    const formattedIntegerPart = parseInt(integerPart, 10).toLocaleString(
      "en-US"
    );
    return decimalPart
      ? `${formattedIntegerPart}.${decimalPart}`
      : formattedIntegerPart;
  };

  const handleReceiveChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let inputValue = event.target.value.replace(/,/g, "");

    if (inputValue.trim() === "") {
      setReceiveValue("");
      setErrorConvert("");
      setIsNextDisabled(true);
      return;
    }

    if (inputValue === "0") {
      setReceiveValue("0");
      setErrorConvert("");
      setIsNextDisabled(true);
      return;
    }

    const formattedInputValue = formatNumberWithCommas(inputValue);
    setReceiveValue(formattedInputValue);

    try {
      const body = { amount: parseFloat(inputValue), inverted: 0 };
      const response = await fetchConvert(body);

      if (response && response.converted) {
        const calculatedSendValue = parseFloat(response.converted);

        if (calculatedSendValue < 3) {
          setErrorConvert("El monto no puede ser menor a 3 WLD.");
          setIsNextDisabled(true);
          return;
        } else {
          setErrorConvert("");
        }

        setSendValue(formatNumberWithCommas(calculatedSendValue.toString()));
      } else {
        console.error("La respuesta no tiene el formato esperado", response);
      }
    } catch (error) {
      console.error("Error en la conversión:", error);
    }

    validateNextButton();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    setErrors((prev) => ({ ...prev, [id]: "" }));
    setBody((prevState) => ({
      ...prevState,
      customer_full_name: formData.name,
      amount: prevState?.amount || 0,
      bank: prevState?.bank || "",
      customer_document_number: formData.document_number,
      customer_email: formData.email,
      customer_phone_number: formData.phone,
      inverted: prevState?.inverted || "0",
      bank_account: formData.bank_account,
      referrals_reference: prevState?.referrals_reference || "",
    }));
  };

  useEffect(() => {
    setBody((prevState) => ({
      ...prevState,
      customer_full_name: formData.name,
      amount: prevState?.amount || 0,
      bank: prevState?.bank || "",
      customer_document_number: formData.document_number,
      customer_email: formData.email,
      customer_phone_number: formData.phone,
      inverted: prevState?.inverted || "0",
      bank_account: formData.bank_account,
      referrals_reference: prevState?.referrals_reference || "",
    }));
  }, [formData]);

  useEffect(() => {
    setTimeout(() => {
      if (MiniKit.isInstalled()) {
      } else {
        const environment = window.location.origin;
        const userAgent = navigator.userAgent;
        const errorMessage = `MiniKit no está instalado. 
          Environment: ${environment}, 
          User Agent: ${userAgent}`;
        console.error(errorMessage);
      }
    }, 100);

    MiniKit.subscribe(ResponseEvent.MiniAppPayment, async (response) => {
      if (response.status === "success") {
        try {
          const res = await fetch(`/api/confirm-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const result = await res.json();

          if (result.success) {
            alert("¡Pago exitoso!");
          } else {
            const errorMessage = "Error al confirmar el pago.";

            alert(errorMessage);
          }
        } catch (error) {
          console.error("Error al procesar la respuesta del pago:", error);
        }
      } else {
        console.log("Estado de pago no exitoso", response);
      }
    });

    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppPayment);
    };
  }, []);

  const sendPayment = async (address: any) => {
    try {
      const res = await fetch(`/api/initiate-payment`, {
        method: "POST",
      });

      const { id } = await res.json();

      console.log(id);

      const payload = {
        reference: id,
        to: address,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(
              body?.amount ?? 0,
              Tokens.WLD
            ).toString(),
          },
        ],
        description: "Watch this is a test",
      };

      console.log("Payload", payload);

      if (MiniKit.isInstalled()) {
        return await MiniKit.commandsAsync.pay(payload);
      }
      return null;
    } catch (error) {
      console.error("Error sending payment", error);

      setStep(3);
      return null;
    }
  };

  const handlePay = async () => {
    let updatedBody = { ...body };

    // if (!MiniKit.isInstalled()) {
    //   console.error("MiniKit is not installed");
    //   return;
    // }

    if (isNequiOrDaviplata) {
      console.log("Es nequi o daviplata");

      updatedBody.bank_account = formData.phone;

      console.log(updatedBody.bank_account);
    }

    console.log("Esta es la informacion antes del fetch ", updatedBody);

    try {
      const result = await fetchStore(updatedBody);

      if (!result || !result.address) {
        console.error("No se pudo obtener la dirección del store");
        setResponse("error");
        setStep(3);

        return;
      }

      const address = result.address;

      console.log(result);
      // const sendPaymentResponse = await sendPayment(address);

      // const response = sendPaymentResponse?.finalPayload;

      // if (!response) {
      //   setResponse("error");
      //   setStep(3);
      //   return;
      // }

      if (response.status === "success") {
        setResponse("success");
        setStep(3);
      }

      // if (response.status === "success") {
      //   const res = await fetch(
      //     `${process.env.NEXTAUTH_URL}/api/confirm-payment`,
      //     {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({ payload: response }),
      //     }
      //   );
      //   const payment = await res.json();
      //   if (payment.success) {
      //     console.log("SUCCESS!");
      //     setResponse("success");
      //     setStep(3);
      //   } else {
      //     setResponse("error");
      //     setStep(3);
      //     console.log("FAILED!");
      //   }
      // }
    } catch (error) {
      console.error("Error during payment process", error);

      setResponse("error");
      setStep(3);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSendValue("1");
    setReceiveValue("");
    setInverted(1);
    setConfiguration(undefined);
    setBody(initialBody);
    setFormData(initialFormData);
    setAddress("");

    window.location.reload();
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedMethod = e.target.value;
    setFormData((prev) => ({
      ...prev,
      paymentMethod: selectedMethod,
    }));

    if (selectedMethod === "18" || selectedMethod === "19") {
      setIsNequiOrDaviplata(true);

      if (selectedMethod === "18") {
        setIsNequi(true);
        setIsDaviplata(false);
      } else if (selectedMethod === "19") {
        setIsDaviplata(true);
        setIsNequi(false);
      } else {
        setIsNequi(false);
        setIsDaviplata(false);
      }
    } else {
      setIsNequiOrDaviplata(false);
      setIsNequi(false);
      setIsDaviplata(false);
    }

    validateNextButton();
  };

  // SIWE
  const signInWithWallet = async () => {
    const res = await fetch(`/api/nonce`);
    const { nonce } = await res.json();

    MiniKit.commands.walletAuth({
      nonce: nonce,
      requestId: "0",
      expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      statement:
        "Por favor, autentícate con tu wallet de Ethereum para continuar.",
    });
  };

  useEffect(() => {
    const fetchNonce = async () => {
      const res = await fetch(`/api/nonce`);
      const { nonce } = await res.json();

      if (!MiniKit.isInstalled()) return;

      MiniKit.subscribe(ResponseEvent.MiniAppWalletAuth, async (payload) => {
        if (payload.status === "error") {
          return;
        }

        const response = await fetch("/api/complete-siwe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: payload,
            nonce,
          }),
        });

        const result = await response.json();
        console.log("Verificación de autenticación:", result);
      });

      return () => {
        MiniKit.unsubscribe(ResponseEvent.MiniAppWalletAuth);
      };
    };

    fetchNonce();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-[460px] bg-white rounded-lg shadow-md p-8">
        {step === 1 ? (
          <>
            <div className="mb-6">
              <label
                htmlFor="country-select"
                className="block text-sm font-medium text-gray-700"
              >
                Selecciona el país
              </label>

              <CountrySelector
                id={"country-selector"}
                open={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
                onChange={setCountry}
                selectedValue={
                  COUNTRIES.find((option) => option.value === country) ||
                  COUNTRIES[0]
                }
              />
            </div>
          </>
        ) : (
          <></>
        )}

        {showWarning && warningMessage}
        {/* <button onClick={signInWithWallet} className="btn">
          Prueba
        </button> */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            <div
              className={`rounded-full w-10 h-10 flex items-center justify-center font-medium ${
                step === 1
                  ? "bg-[#14162c] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div className="w-20 h-[2px] bg-gray-200 mx-2" />
            <div
              className={`rounded-full w-10 h-10 flex items-center justify-center font-medium ${
                step === 2
                  ? "bg-[#14162c] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>

            <div className="w-20 h-[2px] bg-gray-200 mx-2" />
            <div
              className={`rounded-full w-10 h-10 flex items-center justify-center font-medium ${
                step === 3
                  ? "bg-[#14162c] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 mb-8">
              <h2 className="text-xl text-black font-medium">
                Intercambio WLD
              </h2>

              <img src="/icon/wld-icon.png" className="w-4"></img>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    ENVÍAS
                  </span>
                </div>
                <div className="p-4 flex items-center">
                  <div className="flex items-center gap-2">
                    <img src="/icon/wld-icon.png" className="w-8"></img>
                  </div>
                  <input
                    name="sendAmount"
                    type="number"
                    value={sendValue}
                    onChange={handleSendChange}
                    className="ml-auto w-24 text-right text-black border-0 p-0 text-lg font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    RECIBES
                  </span>
                </div>
                <div className="p-4 flex items-center">
                  <div className="flex items-center gap-2">
                    {country === "CO" ? (
                      <>
                        <img
                          src="/icon/colombia-icon.png"
                          className="w-8"
                        ></img>
                      </>
                    ) : country === "EC" ? (
                      <>
                        <img src="/icon/ecuador-icon.png" className="w-8"></img>
                      </>
                    ) : (
                      <>
                        <img src="/icon/rd.png" className="w-8"></img>
                      </>
                    )}
                  </div>
                  <input
                    name="receiveAmount"
                    type="text"
                    onChange={handleReceiveChange}
                    value={receiveValue}
                    className="ml-auto w-24 text-right text-black border-0 p-0 text-lg font-medium focus:outline-none"
                  />
                </div>
              </div>
              {errorConvert && (
                <>
                  <span className="text-red-500 text-sm mt-6">
                    El monto minimo de intercambio de WLD es de 3
                  </span>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Método de consignación
              </label>
              <div className="relative">
                <select
                  value={formData.paymentMethod}
                  onChange={handlePaymentMethodChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                >
                  {configuration?.payment_methods?.map((method) => (
                    <option key={method[0]} value={method[0]}>
                      {method[1]}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              className={`w-full py-4 px-4 rounded-lg font-medium ${
                !isNextDisabled
                  ? "bg-[#14162c] hover:bg-[#14162c]/90 text-white"
                  : "bg-gray-300 text-white cursor-not-allowed"
              }`}
              onClick={handleContinue}
              disabled={isNextDisabled}
            >
              CONTINUAR
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-center mb-6">
              Información Personal
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ingrese su nombre completo"
                  className="mt-1 block text-black w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Ingrese su correo electrónico"
                  className={`mt-1 block text-black w-full px-3 py-2 bg-white border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono
                  <strong>
                    {isNequi && " Nequi"} {isDaviplata && " Daviplata"}
                  </strong>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder={
                    isNequi
                      ? "Número de Nequi"
                      : isDaviplata
                      ? "Número de Daviplata"
                      : "Número telefónico"
                  }
                  className={`mt-1 block w-full px-3 text-black py-2 bg-white border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.phone && (
                  <span className="text-red-500 text-sm">{errors.phone}</span>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="document_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Número de documento
                </label>
                <input
                  id="document_number"
                  type="tel"
                  value={formData.document_number}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Ingrese su numero de identificación"
                  className={`mt-1 block w-full px-3 text-black py-2 bg-white border ${
                    errors.document_number
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.document_number && (
                  <span className="text-red-500 text-sm">
                    {errors.document_number}
                  </span>
                )}
              </div>

              {!isNequiOrDaviplata && (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="bank_account"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Número de cuenta
                    </label>
                    <input
                      id="bank_account"
                      type="text"
                      value={formData.bank_account}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Ingrese su número de cuenta"
                      className={`mt-1 block text-black w-full px-3 py-2 bg-white border  rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      Tipo de cuenta
                    </label>
                    <div className="relative">
                      <select
                        value={formData.bank}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            bank: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                      >
                        {configuration?.bank_types?.map((method) => (
                          <option key={method[0]} value={method[0]}>
                            {method[1]}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4">
              <button
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-lg"
                onClick={handleBack}
              >
                Atrás
              </button>
              <button
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  isFinalStepValid() && !isLoading
                    ? "bg-[#14162c] hover:bg-[#14162c]/90 text-white"
                    : "bg-gray-300 text-gray-400 cursor-not-allowed"
                }`}
                onClick={handlePay}
                disabled={!isFinalStepValid() || isLoading}
              >
                {isLoading ? (
                  <ClipLoader loading={true} size={18} color="#ffffff" />
                ) : (
                  <>
                    <label>Finalizar</label>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <div className="text-center space-y-6">
              {response === "success" ? (
                <>
                  <div className="flex justify-center items-center w-full">
                    <img className="w-28" src="/icon/success.png"></img>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center items-center w-full">
                    <img className="w-28" src="/icon/error.png"></img>
                  </div>
                </>
              )}

              <h2 className="text-2xl text-black font-bold">
                {response === "success"
                  ? "Orden realizada con éxito"
                  : "Algo ha salido mal"}
              </h2>

              {response === "success" ? (
                <>
                  <p className="text-black text-justify">
                    Gracias por confiar en nosotros. En breve recibirás un
                    correo electrónico con los detalles de tu orden. Para más
                    información, puedes visitar nuestro canal de Telegram, donde
                    estaremos disponibles para brindarte soporte relacionado con
                    tu pedido.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-black text-justify">
                    Algo salió mal con tu orden y lamentamos lo sucedido. Para
                    obtener más información, por favor contáctanos a través de
                    nuestros canales de comunicación en Telegram.
                  </p>
                </>
              )}

              <button
                className="w-full bg-blue-400 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg mt-4"
                onClick={() =>
                  (window.location.href = "https://t.me/vakanopaga")
                }
              >
                <div className="flex justify-center items-center w-full">
                  <div className="mr-6">
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs></defs>
                      <path
                        fill="white"
                        d="M40.83,8.48c1.14,0,2,1,1.54,2.86l-5.58,26.3c-.39,1.87-1.52,2.32-3.08,1.45L20.4,29.26a.4.4,0,0,1,0-.65L35.77,14.73c.7-.62-.15-.92-1.07-.36L15.41,26.54a.46.46,0,0,1-.4.05L6.82,24C5,23.47,5,22.22,7.23,21.33L40,8.69a2.16,2.16,0,0,1,.83-.21Z"
                      />
                    </svg>
                  </div>
                  <div>Contactar por telegram</div>
                </div>
              </button>

              <button
                className="w-full bg-[#14162c] hover:bg-[#14162c]/90 text-white font-medium py-2 px-4 rounded-lg"
                onClick={handleReset}
              >
                Volver al inicio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
