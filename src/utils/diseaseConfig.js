export const diseaseTypes = [
    {
        value: 'diabetes',
        label: 'Diabetes',
        icon: '🩸',
        fields: [
            { name: 'bloodSugar', label: 'Blood Sugar (mg/dL)', type: 'number', unit: 'mg/dL' },
            { name: 'hba1c', label: 'HbA1c (%)', type: 'number', unit: '%' }
        ]
    },
    {
        value: 'hypertension',
        label: 'Blood Pressure',
        icon: '💓',
        fields: [
            { name: 'systolic', label: 'Systolic (mmHg)', type: 'number', unit: 'mmHg' },
            { name: 'diastolic', label: 'Diastolic (mmHg)', type: 'number', unit: 'mmHg' }
        ]
    },
    {
        value: 'thyroid',
        label: 'Thyroid',
        icon: '🦋',
        fields: [
            { name: 'tsh', label: 'TSH (μIU/mL)', type: 'number', unit: 'μIU/mL' },
            { name: 't3', label: 'T3 (ng/dL)', type: 'number', unit: 'ng/dL' },
            { name: 't4', label: 'T4 (μg/dL)', type: 'number', unit: 'μg/dL' }
        ]
    },
    {
        value: 'kidney',
        label: 'Kidney Function',
        icon: '🫘',
        fields: [
            { name: 'creatinine', label: 'Creatinine (mg/dL)', type: 'number', unit: 'mg/dL' },
            { name: 'bun', label: 'BUN (mg/dL)', type: 'number', unit: 'mg/dL' },
            { name: 'gfr', label: 'GFR (mL/min)', type: 'number', unit: 'mL/min' }
        ]
    },
    {
        value: 'heart',
        label: 'Heart Health',
        icon: '❤️',
        fields: [
            { name: 'heartRate', label: 'Heart Rate (bpm)', type: 'number', unit: 'bpm' },
            { name: 'ecg', label: 'ECG Result', type: 'text', unit: '' }
        ]
    },
    {
        value: 'liver',
        label: 'Liver Function',
        icon: '🫀',
        fields: [
            { name: 'sgpt', label: 'SGPT/ALT (U/L)', type: 'number', unit: 'U/L' },
            { name: 'sgot', label: 'SGOT/AST (U/L)', type: 'number', unit: 'U/L' },
            { name: 'bilirubin', label: 'Bilirubin (mg/dL)', type: 'number', unit: 'mg/dL' }
        ]
    },
    {
        value: 'cholesterol',
        label: 'Cholesterol',
        icon: '🧈',
        fields: [
            { name: 'total', label: 'Total Cholesterol (mg/dL)', type: 'number', unit: 'mg/dL' },
            { name: 'ldl', label: 'LDL (mg/dL)', type: 'number', unit: 'mg/dL' },
            { name: 'hdl', label: 'HDL (mg/dL)', type: 'number', unit: 'mg/dL' },
            { name: 'triglycerides', label: 'Triglycerides (mg/dL)', type: 'number', unit: 'mg/dL' }
        ]
    },
    {
        value: 'other',
        label: 'Other',
        icon: '📋',
        fields: []
    }
];

export const getDiseaseConfig = (diseaseType) => {
    return diseaseTypes.find(d => d.value === diseaseType) || diseaseTypes[diseaseTypes.length - 1];
};