import React, { useState } from 'react';
import type { OmniStructFormData } from '../../../services/omniStructService';

interface OmniStructCreatorProps {
    onGenerate: (formData: OmniStructFormData) => void;
}

const OmniStructCreator: React.FC<OmniStructCreatorProps> = ({ onGenerate }) => {
    const [formData, setFormData] = useState<OmniStructFormData>({
        purposeDesc: 'To build a scalable, AI-driven customer support chatbot.',
        planMilestones: 'phase1:Collect data, phase2:Train model, phase3:Deploy beta',
        instructionsSteps: '1. Set up the Python environment.\n2. Ingest training data from the S3 bucket.\n3. Run the training script.',
        useCasesScenarios: '1. User asks for order status.\n2. User requests a refund.\n3. User has a technical question.',
        logicDesc: 'The core logic uses a transformer-based model to understand intent and provide responses.'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(formData);
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-surface p-8 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-6 text-text-primary">Create Your Enterprise OmniStruct</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">1. Purpose</h3>
                    <label htmlFor="purposeDesc" className="block text-sm font-medium text-text-secondary">Description:</label>
                    <textarea id="purposeDesc" name="purposeDesc" value={formData.purposeDesc} onChange={handleChange} className="w-full mt-1 p-2 bg-background border border-border rounded-md" rows={2}/>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">2. Plan</h3>
                    <label htmlFor="planMilestones" className="block text-sm font-medium text-text-secondary">Milestones (comma-separated):</label>
                    <input type="text" id="planMilestones" name="planMilestones" value={formData.planMilestones} onChange={handleChange} className="w-full mt-1 p-2 bg-background border border-border rounded-md"/>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">3. Instructions</h3>
                    <label htmlFor="instructionsSteps" className="block text-sm font-medium text-text-secondary">Steps (one per line):</label>
                    <textarea id="instructionsSteps" name="instructionsSteps" value={formData.instructionsSteps} onChange={handleChange} className="w-full mt-1 p-2 bg-background border border-border rounded-md" rows={4}/>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">4. Use Cases</h3>
                    <label htmlFor="useCasesScenarios" className="block text-sm font-medium text-text-secondary">Scenarios (one per line):</label>
                    <textarea id="useCasesScenarios" name="useCasesScenarios" value={formData.useCasesScenarios} onChange={handleChange} className="w-full mt-1 p-2 bg-background border border-border rounded-md" rows={4}/>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">5. Logic</h3>
                    <label htmlFor="logicDesc" className="block text-sm font-medium text-text-secondary">Brief Logic Description:</label>
                    <textarea id="logicDesc" name="logicDesc" value={formData.logicDesc} onChange={handleChange} className="w-full mt-1 p-2 bg-background border border-border rounded-md" rows={2}/>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn-primary px-8 py-3 text-lg font-bold">Generate OmniStruct</button>
                </div>
            </form>
        </div>
    );
};

export default OmniStructCreator;
