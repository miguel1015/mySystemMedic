"use client";

import { SaveOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";
import { clinicalTabs } from "../../constants";
import type { DiagnosisRow } from "../../types";
import { AnalysisTab } from "./AnalysisTab";
import { DiagnosesTab } from "./DiagnosesTab";
import { ObjectiveTab } from "./ObjectiveTab";
import { PlanTab } from "./PlanTab";
import { SubjectiveTab } from "./SubjectiveTab";
import type { UseHciInicialFormResult } from "./useHciInicialForm";

interface Props extends UseHciInicialFormResult {
  editMode?: boolean;
  diagnoses: DiagnosisRow[];
  onDiagnosesChange: (diagnoses: DiagnosisRow[]) => void;
  patientId?: string | number;
  admissionId?: string | number;
}

export const HciInicialTabsForm = ({
  editMode = false,
  diagnoses,
  onDiagnosesChange,
  patientId,
  admissionId,
  vitals,
  setVitals,
  subjective,
  setSubjective,
  physicalExam,
  setPhysicalExam,
  antecedentes,
  setAntecedentes,
  analysis,
  setAnalysis,
  plan,
  setPlan,
  isLocked,
  isClosed,
  savingSubjetivo,
  savingObjetivo,
  savingSignosVitales,
  savingAnalisis,
  saveSubjetivo,
  saveObjetivo,
  saveSignosVitales,
  saveAnalisisDiagnosticosPlan,
}: Props) => {
  const [activeSection, setActiveSection] = useState("subjective");

  return (
    <>
      <nav
        className="clinical-section-tabs"
        aria-label="Secciones de historia clínica"
      >
        {clinicalTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeSection === tab.key ? "active" : ""}
            onClick={() => setActiveSection(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="evolution-tab-content">
        {isLocked && (
          <div className="clinical-history-closed-banner">
            Esta historia clínica inicial fue clausurada para esta admisión y ya
            no admite cambios. No se puede crear una nueva para esta admisión.
          </div>
        )}
        {isClosed && editMode && (
          <div className="clinical-history-closed-banner">
            Está editando una historia clínica clausurada. Los cambios se
            guardarán, pero la historia permanecerá clausurada.
          </div>
        )}
        {activeSection === "subjective" && (
          <SubjectiveTab
            value={subjective}
            onChange={setSubjective}
            disabled={isLocked}
          />
        )}
        {activeSection === "objective" && (
          <ObjectiveTab
            vitals={vitals}
            onVitalsChange={setVitals}
            physicalExam={physicalExam}
            onPhysicalExamChange={setPhysicalExam}
            antecedentes={antecedentes}
            onAntecedentesChange={setAntecedentes}
            disabled={isLocked}
            patientId={patientId}
            admissionId={admissionId}
          />
        )}
        {activeSection === "analysis" && (
          <AnalysisTab
            value={analysis}
            onChange={setAnalysis}
            disabled={isLocked}
          />
        )}
        {activeSection === "diagnoses" && (
          <DiagnosesTab
            diagnoses={diagnoses}
            onDiagnosesChange={onDiagnosesChange}
            disabled={isLocked}
          />
        )}
        {activeSection === "plan" && (
          <PlanTab value={plan} onChange={setPlan} disabled={isLocked} />
        )}

        <div className="clinical-history-footer-actions">
          {activeSection === "subjective" && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={savingSubjetivo}
              disabled={isLocked}
              onClick={saveSubjetivo}
            >
              Guardar subjetivo
            </Button>
          )}
          {activeSection === "objective" && (
            <>
              <Button
                icon={<SaveOutlined />}
                loading={savingSignosVitales}
                disabled={isLocked}
                onClick={saveSignosVitales}
              >
                Guardar signos vitales
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={savingObjetivo}
                disabled={isLocked}
                onClick={saveObjetivo}
              >
                Guardar objetivo
              </Button>
            </>
          )}
          {(activeSection === "analysis" ||
            activeSection === "diagnoses" ||
            activeSection === "plan") && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={savingAnalisis}
              disabled={isLocked}
              onClick={saveAnalisisDiagnosticosPlan}
            >
              Guardar análisis, diagnósticos y plan
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
