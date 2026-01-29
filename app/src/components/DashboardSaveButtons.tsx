import React from "react";

type DashboardSaveButtonsProps = {
  enabled: boolean;
  onReset: () => void;
  onSave: () => void;
  resetLabel?: string;
  saveLabel?: string;
  noChangesLabel?: string;
};

export function DashboardSaveButtons({
  enabled,
  onReset,
  onSave,
  resetLabel = "Reestablecer valores",
  saveLabel = "Guardar Cambios",
  noChangesLabel = "Sin Cambios Detectados",
}: DashboardSaveButtonsProps) {
  if (!enabled) {
    return (
      <button
        className="bg-gray-600 text-gray-300 px-6 py-2 mx-2 rounded-lg hover:bg-gray-700 ml-auto"
        disabled
      >
        {noChangesLabel}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={onReset}
        className="bg-orange-600 text-white px-6 py-2 mx-2 rounded-lg hover:bg-orange-700 ml-auto"
      >
        {resetLabel}
      </button>

      <button
        onClick={onSave}
        className="bg-indigo-600 text-white px-6 py-2 mx-2 rounded-lg hover:bg-indigo-700"
      >
        {saveLabel}
      </button>
    </>
  );
}

