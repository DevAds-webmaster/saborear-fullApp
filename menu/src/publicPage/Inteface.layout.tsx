import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

import { usePublic } from "../contexts/PublicContext";
import { useResto } from "../contexts/RestoContext";
import { SinglePageTemplate } from "./templates/SinglePage.template";
import { MultiPageTemplate } from "./templates/MultiPage.template";

function Interface({ mode }: any) {
  const [searchParams] = useSearchParams();
  const cart = searchParams.get("cart") === "true";
  const { resto: publicResto, setSelectedCategoryName, setMultiPageBackHandler } = usePublic();
  const { restoPreview } = useResto();

  const currentResto = mode === "preview" ? restoPreview : publicResto;
  const template = currentResto?.config?.template;

  useEffect(() => {
    setSelectedCategoryName(null);
    setMultiPageBackHandler(null);
  }, [template, currentResto?._id, setSelectedCategoryName, setMultiPageBackHandler]);

  switch (template) {
    case "multi-page":
      return <MultiPageTemplate resto={currentResto} cart={cart} />;
    case "single-page":
    default:
      return <SinglePageTemplate resto={currentResto} cart={cart} />;
  }
}

export default Interface;

