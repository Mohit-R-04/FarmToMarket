import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Loader2, BarChart3 } from 'lucide-react';

const COMMON_CROPS = [
    'rice', 'wheat', 'maize', 'cotton', 'sugarcane', 'jute', 'coffee', 'tea',
    'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram',
    'lentil', 'pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 'muskmelon',
    'apple', 'orange', 'papaya', 'coconut'
];

export function YieldPrediction() {
    const [formData, setFormData] = useState({
        crop: '',
        n: '',
        p: '',
        k: '',
        temperature: '',
        humidity: '',
        rainfall: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        predicted_yield: number;
        unit: string;
        crop: string;
    } | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('http://localhost:5001/predict-yield', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to predict yield');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Failed to predict yield. Make sure ML service is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCropChange = (value: string) => {
        setFormData({
            ...formData,
            crop: value
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Yield Prediction
                </CardTitle>
                <CardDescription>
                    Predict expected crop yield based on soil and climate conditions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="crop">Select Crop</Label>
                        <Select value={formData.crop} onValueChange={handleCropChange} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a crop" />
                            </SelectTrigger>
                            <SelectContent>
                                {COMMON_CROPS.map((crop) => (
                                    <SelectItem key={crop} value={crop} className="capitalize">
                                        {crop}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="n">Nitrogen (N)</Label>
                            <Input
                                id="n"
                                name="n"
                                type="number"
                                step="0.01"
                                value={formData.n}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 90"
                            />
                        </div>
                        <div>
                            <Label htmlFor="p">Phosphorus (P)</Label>
                            <Input
                                id="p"
                                name="p"
                                type="number"
                                step="0.01"
                                value={formData.p}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 42"
                            />
                        </div>
                        <div>
                            <Label htmlFor="k">Potassium (K)</Label>
                            <Input
                                id="k"
                                name="k"
                                type="number"
                                step="0.01"
                                value={formData.k}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 43"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="temperature">Temperature (°C)</Label>
                            <Input
                                id="temperature"
                                name="temperature"
                                type="number"
                                step="0.01"
                                value={formData.temperature}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 25.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="humidity">Humidity (%)</Label>
                            <Input
                                id="humidity"
                                name="humidity"
                                type="number"
                                step="0.01"
                                value={formData.humidity}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 80"
                            />
                        </div>
                        <div>
                            <Label htmlFor="rainfall">Rainfall (mm)</Label>
                            <Input
                                id="rainfall"
                                name="rainfall"
                                type="number"
                                step="0.01"
                                value={formData.rainfall}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 200"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading || !formData.crop} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Predicting...
                            </>
                        ) : (
                            <>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Predict Yield
                            </>
                        )}
                    </Button>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    Predicted Yield for <span className="capitalize">{result.crop}</span>
                                </h3>
                                <p className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                                    {result.predicted_yield.toLocaleString()} {result.unit}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                                    This prediction is based on your soil NPK levels and climate conditions. Actual yield may vary based on farming practices and other factors.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
