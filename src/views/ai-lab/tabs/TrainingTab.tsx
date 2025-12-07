/**
 * Training Tab - ML Model Training Interface
 * 
 * Contains:
 * - Training configuration
 * - Model training execution
 * - Real-time metrics display
 * - Training history
 * 
 * Source: TrainingView.tsx
 * 
 * @version 1.0.0
 * @since Phase 2
 */

import React from 'react';
import { MLTrainingPanel } from '../../../components/ml/MLTrainingPanel';

export const TrainingTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-2">Model Training</h3>
                <p className="text-muted-foreground mb-6">
                    Train machine learning models for trading strategy optimization.
                </p>

                {/* ML Training Panel Component */}
                <MLTrainingPanel />
            </div>

            {/* Additional Training Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">Training Process</h4>
                    <p className="text-sm text-muted-foreground">
                        Configure epochs, batch size, learning rate, and optimizer for optimal model performance.
                    </p>
                </div>

                <div className="bg-card p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">Real-time Metrics</h4>
                    <p className="text-sm text-muted-foreground">
                        Monitor loss, accuracy, validation metrics, and training progress in real-time.
                    </p>
                </div>

                <div className="bg-card p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2">Model Management</h4>
                    <p className="text-sm text-muted-foreground">
                        Save, load, and compare trained models with performance history.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TrainingTab;
