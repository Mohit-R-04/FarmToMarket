import { SignIn } from '@clerk/clerk-react';
import GhostCursor from '../ui/GhostCursor';

import GradientText from '../ui/GradientText';

export function ClerkLogin() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Ghost Cursor Effect */}
            <GhostCursor
                bloomStrength={2.0}
                bloomRadius={0.8}
                color="#ff4500" // OrangeRed for firework effect
                trailLength={50}
            />

            {/* Background subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-950/30 via-slate-950 to-emerald-950/30 pointer-events-none"></div>

            {/* Main content */}
            <div className="relative z-10 w-full max-w-md p-4 flex flex-col items-center gap-8">

                {/* Branding */}
                <div className="text-center space-y-2">
                    <GradientText
                        colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
                        animationSpeed={3}
                        showBorder={false}
                        className="text-4xl font-bold tracking-tighter"
                    >
                        FarmToMarket
                    </GradientText>
                    <div className="mt-2">
                        <GradientText
                            colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
                            animationSpeed={5}
                            showBorder={false}
                            className="text-sm font-medium"
                        >
                            Seamless connection. Endless possibilities.
                        </GradientText>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden group hover:border-green-500/30 transition-colors duration-500 flex flex-col items-center w-full">
                    {/* Inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>

                    <SignIn
                        routing="path"
                        path="/login"
                        signUpUrl="/signup"
                        fallbackRedirectUrl="/dashboard"
                        appearance={{
                            elements: {
                                rootBox: "w-full flex justify-center",
                                card: "bg-transparent shadow-none w-full",
                                headerTitle: "text-white font-bold text-2xl",
                                headerSubtitle: "text-slate-400",
                                socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all",
                                formButtonPrimary: "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300",
                                formFieldInput: "bg-white/5 border-white/10 text-white focus:border-green-500 transition-all",
                                formFieldLabel: "text-slate-300",
                                footerActionLink: "text-green-400 hover:text-green-300",
                                identityPreviewText: "text-slate-300",
                                formFieldInputShowPasswordButton: "text-slate-400 hover:text-white",
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
