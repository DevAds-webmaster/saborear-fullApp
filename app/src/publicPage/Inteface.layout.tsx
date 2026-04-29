import { useEffect } from "react";

import { usePublic } from "../contexts/PublicContext";
import { useResto } from "../contexts/RestoContext";
import { SinglePageTemplate } from "./templates/SinglePage.template";
import { MultiPageTemplate } from "./templates/MultiPage.template";

function Interface({ mode, cart }: { mode: string; cart?: boolean }) {
  const { resto: publicResto, setSelectedCategoryName, setMultiPageBackHandler } = usePublic();
  const { restoPreview } = useResto();

  const currentResto = mode === "preview" ? restoPreview : publicResto;
  const template = currentResto?.config?.template;
  const cartEnabled = cart === true;

  useEffect(() => {
    setSelectedCategoryName(null);
    setMultiPageBackHandler(null);
  }, [template, currentResto?._id, setSelectedCategoryName, setMultiPageBackHandler]);

  switch (template) {
    case "multi-page":
      return <MultiPageTemplate resto={currentResto} cart={cartEnabled} />;
    case "single-page":
    default:
      return <SinglePageTemplate resto={currentResto} cart={cartEnabled} />;
  }
}

export default Interface;
