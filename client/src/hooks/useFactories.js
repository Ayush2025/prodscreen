import { useEffect, useState } from "react";
import { api } from "../api/client";

export const useFactories = () => {
  const [factories, setFactories] = useState([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/factories");
      setFactories(data.factories);
      if (!selectedFactoryId && data.factories.length > 0) {
        setSelectedFactoryId(data.factories[0]._id);
      }
    };
    load();
  }, [selectedFactoryId]);

  return { factories, selectedFactoryId, setSelectedFactoryId };
};
