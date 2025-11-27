import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sprout, Loader2, CheckCircle } from 'lucide-react';

export function CropRecommendation() {
    const [formData, setFormData] = useState({
        n: '',
        p: '',
        k: '',
        temperature: '',
        humidity: '',
        rainfall: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        recommendation: string;
        confidence: number | null;
    } | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('http://localhost:5001/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendation');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Failed to get recommendation. Make sure ML service is running.');
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-green-600" />
                    Crop Recommendation
                </CardTitle>
                <CardDescription>
                    Get AI-powered crop recommendations based on your soil and climate conditions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sprout className="mr-2 h-4 w-4" />
                                Get Recommendation
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
                    <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                                    Recommended Crop
                                </h3>
                                <p className="text-3xl font-bold text-green-700 dark:text-green-300 capitalize mb-2">
                                    {result.recommendation}
                                </p>
                                {result.confidence && (
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Confidence: <span className="font-semibold">{result.confidence}%</span>
                                    </p>
                                )}
                                <p className="text-xs text-green-600 dark:text-green-400 mt-3">
                                    This recommendation is based on your soil NPK levels and climate conditions.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
