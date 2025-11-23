"use client";

import { useEffect, useRef, useId } from "react";

export interface EstonianAddressData {
  full_address: string;
  streetName: string;
  houseNumber: string;
  city: string;
  country: string;
  ads_oid: string;
}

interface InaAddressResponse {
  address?: string;
  paadress?: string;
  lahiaadress?: string;
  aadress_id?: string | number;
  ads_oid?: string;
}

interface InaAddressSelectedEventDetail {
  address: string;
  ads_oid?: string;
}

interface EstonianAddressProps {
  onSelect: (address: EstonianAddressData) => void;
  width?: string;
  height?: string;
}

interface InaAddressWidgetStyle {
  [key: string]: string | number;
}

declare global {
  interface Window {
    InAadress?: new (options: {
      container: string;
      mode: number;
      appartment: number;
      lang: string;
      ihist: string;
      style?: InaAddressWidgetStyle;
    }) => {
      cb?: (data: InaAddressResponse) => void;
    };
  }
}

export function EstonianAddress({
  onSelect,
   //width = "100%",
   //height = "420px",
}: EstonianAddressProps) {
  const ref = useRef<HTMLDivElement>(null); //  
  const id = useId();
  const callbackRef = useRef(onSelect);



  useEffect(() => {
    callbackRef.current = onSelect;
  }, [onSelect]);

  const parseAddress = (
    fullAddress: string,
    ads_oid: string | number | undefined = ""
  ): EstonianAddressData => {
    const parts = fullAddress.split(", ");
    const streetPart = parts[0]?.trim() || "";
    const city = parts.slice(1, parts.length - 1).join(", ").trim();
    const country = parts[parts.length - 1]?.trim() || "";

    const streetMatch = streetPart.match(/^(.+?)\s+(\d+[\w-]*)$/);
    const streetName = streetMatch ? streetMatch[1].trim() : streetPart;
    const houseNumber = streetMatch ? streetMatch[2] : "";

    return {
      full_address: fullAddress.trim(),
      streetName,
      houseNumber,
      city,
      country,
      ads_oid: String(ads_oid ?? ""),
    };
  };

  useEffect(() => {
    const scriptId = "inaadress-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src =
        "https://inaadress.maaamet.ee/inaadress/js/inaadress.min.js?d=20220510";
      script.id = scriptId;
      script.async = true;
      document.body.appendChild(script);
    }

    const timer = setInterval(() => {
      if (!window.InAadress || !ref.current) return;
      clearInterval(timer);

      const container = ref.current;
      container.style.position = "relative";
      container.style.overflow = "visible";

      const instance = new window.InAadress!({
        container: container.id,
        mode: 3,
        appartment: 0,
        lang: "et",
        ihist: "1993",
      });

      instance.cb = (data: InaAddressResponse) => {
        const address = data.address || data.paadress || data.lahiaadress || "";
        const oid = data.aadress_id || data.ads_oid || "";
        if (address) {
          callbackRef.current(parseAddress(address, oid));
        }
      };

      const handleAddressSelect = (e: Event) => {
        const ev = e as CustomEvent;
        const detail = ev.detail;

        let address = "";
        let oid: string | number | undefined = "";

        if (Array.isArray(detail) && detail[0]) {
          const item = detail[0] as InaAddressResponse;
          address = item.paadress || item.lahiaadress || "";
          oid = item.ads_oid || item.aadress_id || "";
        } else if (detail && typeof detail === "object") {
          const d = detail as InaAddressSelectedEventDetail | InaAddressResponse;
          address = (d as InaAddressSelectedEventDetail).address || (d as InaAddressResponse).paadress || "";
          oid = d.ads_oid || "";
        }

        if (address) {
          callbackRef.current(parseAddress(address, oid));
        }
      };

      document.addEventListener("addressSelected", handleAddressSelect);
      document.addEventListener("inaadress-selected", handleAddressSelect);

      return () => {
        document.removeEventListener("addressSelected", handleAddressSelect);
        document.removeEventListener("inaadress-selected", handleAddressSelect);
      };
    }, 200);

    return () => clearInterval(timer);
  }, []);

 return (
    <div
      ref={ref}
      id={"ina-" + id}
      style={{
        width: "100%",
        height: "45px",        // 
        maxHeight: "45px",     // 
        border: "1px solid #374151",
        borderRadius: "6px",
        overflow: "visible",   
        position: "relative",
        zIndex: 50,
      }}
    />
  );
}