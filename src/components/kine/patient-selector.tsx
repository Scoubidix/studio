'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Patient } from "@/interfaces";
import { Label } from "@/components/ui/label";

interface PatientSelectorProps {
  patients: Patient[]; // List of patients for this kine
  onSelectPatient: (patientId: string) => void;
  selectedPatientId: string | null;
  // kineId?: string; // Optional: Can be used later to fetch patients for a specific kine
}

export default function PatientSelector({ patients, onSelectPatient, selectedPatientId }: PatientSelectorProps) {

  // TODO: Replace mockPatients with actual fetched data for the logged-in Kine

  return (
    <div className="space-y-2 max-w-sm">
       <Label htmlFor="patient-select">Sélectionner un Patient</Label>
       <Select
            value={selectedPatientId ?? ""}
            onValueChange={(value) => onSelectPatient(value)}
            // disabled={!patients || patients.length === 0} // Disable if no patients
        >
        <SelectTrigger id="patient-select" className="w-full">
          <SelectValue placeholder="Choisissez un patient..." />
        </SelectTrigger>
        <SelectContent>
          {patients && patients.length > 0 ? (
            patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.prénom} {patient.nom}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-patients" disabled>
              Aucun patient trouvé
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
