import { useEffect, useState } from "react";

export const useFetchShopInfo = () => {
  const [shopInfo, setShopInfo] = useState("");

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch("/api/v1/shop-info");
        const data = await res.json();

        const { success, shop, error } = data;

        if (!shop) {
          shopify.toast.show("No shop found in response", {duration: 5000, isError: true});
        }else if (success && shop && !error) {
          setShopInfo(shop);
        } else if (!success && error && !shop) {
          shopify.toast.show(error, { duration: 5000, isError: true });
        }

      } catch (err) {
        console.error("Error fetching shop:", err);
      } 
    };

    fetchShop();
  }, []);

  return { shopInfo};
};
