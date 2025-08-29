import type { OmniStruct } from '../types';
import { produce } from 'immer'; // A library to handle immutable updates easily

type OmniFunction = (omni: OmniStruct, args: any) => any; // Returns JSON-serializable result

// --- Form Data Structure ---
export interface OmniStructFormData {
    purposeDesc: string;
    planMilestones: string;
    instructionsSteps: string;
    useCasesScenarios: string;
    logicDesc: string;
}

// --- OmniStruct Function Implementations (Production-Safe) ---

const purpose_updateDescription: OmniFunction = (omni, args) => {
    const new_desc = args.description || "";
    omni.Purpose.description = new_desc;
    return { status: "ok", updatedDescription: new_desc };
};

const purpose_getPurpose: OmniFunction = (omni, args) => omni.Purpose;

const plan_getPlanDetails: OmniFunction = (omni, args) => omni.Plan;

const plan_addMilestone: OmniFunction = (omni, args) => {
    const newMilestone = args.newMilestone || "";
    if (!newMilestone) return { error: "No newMilestone provided." };
    if (!newMilestone.includes(":")) return { error: "Milestone format should be 'key:value'." };
    const [key, val] = newMilestone.split(":", 1).map((s: string) => s.trim());
    omni.Plan.milestones[key] = val;
    return { status: "ok", addedMilestone: { [key]: val } };
};

// ... Implement all other functions from the Python source in TypeScript
// For brevity, a selection is shown here. A full implementation would include all functions.

const instructions_getSteps: OmniFunction = (omni, args) => omni.Instructions.steps;

const instructions_addStep: OmniFunction = (omni, args) => {
    const newStep = args.newStep || "";
    if (newStep) {
        omni.Instructions.steps.push(newStep);
        return { status: "ok", addedStep: newStep };
    }
    return { error: "No newStep provided." };
};

const versioning_createNewVersion: OmniFunction = (omni, args) => {
    const version = args.version || "vX.X.X";
    const changes = args.changes || "No changes description provided.";
    const new_entry = { version, changes };
    omni.Versioning.changeLog.push(new_entry);
    omni.Versioning.currentVersion = version;
    return { status: "ok", newVersion: new_entry };
};

// --- Function Registry ---
const FUNCTION_MAP: Record<string, OmniFunction> = {
    "Purpose:updateDescription": purpose_updateDescription,
    "Purpose:getPurpose": purpose_getPurpose,
    "Plan:getPlanDetails": plan_getPlanDetails,
    "Plan:addMilestone": plan_addMilestone,
    "Instructions:getSteps": instructions_getSteps,
    "Instructions:addStep": instructions_addStep,
    "Versioning:createNewVersion": versioning_createNewVersion,
    // Add all other function mappings here...
};

// --- Build the OmniStruct ---
export const buildOmniStruct = (formData: OmniStructFormData): OmniStruct => {
    const milestones_dict: Record<string, string> = {};
    if (formData.planMilestones) {
        formData.planMilestones.split(",").forEach(p => {
            if (p.includes(":")) {
                const [key, val] = p.split(":", 2).map(s => s.trim());
                milestones_dict[key] = val;
            }
        });
    }

    const instructions_list = formData.instructionsSteps.split("\n").map(s => s.trim()).filter(Boolean);
    const use_cases_list = formData.useCasesScenarios.split("\n").map(s => s.trim()).filter(Boolean);

    return {
        Purpose: {
            description: formData.purposeDesc || "",
            functions: { updateDescription: "Purpose:updateDescription", getPurpose: "Purpose:getPurpose" }
        },
        Plan: {
            milestones: milestones_dict,
            functions: { getPlanDetails: "Plan:getPlanDetails", addMilestone: "Plan:addMilestone" }
        },
        Instructions: {
            steps: instructions_list,
            functions: { getSteps: "Instructions:getSteps", addStep: "Instructions:addStep" }
        },
        UseCases: {
            scenarios: use_cases_list,
            functions: { getScenarios: "UseCases:getScenarios", addScenario: "UseCases:addScenario" }
        },
        Logic: {
            description: formData.logicDesc || "",
            decisionTrees: { example: "Complex multi-branch logic" },
            functions: { getDecisionTrees: "Logic:getDecisionTrees", runHeuristics: "Logic:runHeuristics" }
        },
        // ... Populate all other sections with default values
        Classification: { riskCategories: ["Low-risk"], functions: {} },
        SecurityLevel: { level: "HIGH", encryptionProtocols: ["AES256"], functions: {} },
        Ownership: { currentOwner: "Enterprise Corp", authorizedEntities: [], functions: {} },
        Versioning: { currentVersion: "v1.0.0", changeLog: [], functions: { createNewVersion: "Versioning:createNewVersion" } },
        IntegrationPoints: { externalAPIs: [], functions: {} },
        ResourceLinks: { documentation: "", datasetRepo: "", functions: {} },
        Dependencies: { requiredLibraries: [], hardwareRequirements: [], functions: {} },
        PerformanceMetrics: { currentPerformance: {}, functions: {} },
        AITrainingParameters: { hyperparameters: {}, functions: {} },
        TestingDatasets: { availableDatasets: [], functions: {} },
        Permissions: { accessControls: [], functions: {} },
        RevocationProtocols: { strategy: "Manual", functions: {} },
        RollbackMechanisms: { rollbackPoints: [], functions: {} },
        AuditLogs: { records: [], functions: {} },
        CodeExamples: { sampleSnippets: {}, functions: {} }
    };
};

// --- Execution Handler ---
export const executeReference = (omnistruct: OmniStruct, ref: string, args: any): { newOmniStruct: OmniStruct, result: any } => {
    if (!FUNCTION_MAP[ref]) {
        return { newOmniStruct: omnistruct, result: { error: `Unknown reference '${ref}'` } };
    }
    const func = FUNCTION_MAP[ref];
    
    // Use Immer to handle immutable updates safely
    let result: any;
    const newOmniStruct = produce(omnistruct, draft => {
        result = func(draft as OmniStruct, args);
    });

    return { newOmniStruct, result };
};
