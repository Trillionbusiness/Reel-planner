
import React, { useState, useCallback, useRef } from 'react';
import { generateContentPlanStream, generateThirtyDayPlan } from './services/geminiService';
import type { ContentPlan, ThirtyDayPlan } from './types';
import { ContentPlanCard } from './components/ContentPlanCard';
import { SkeletonCard } from './components/SkeletonCard';
import { ThirtyDayPlanModal } from './components/ThirtyDayPlanModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Header = () => (
    <header className="text-center p-4 sm:p-6">
        <div className="inline-block bg-[#EBC944] -rotate-3 transform px-4 py-1 rounded-md mb-4">
            <h2 className="text-white text-lg font-bold rotate-3 transform">AI POWERED</h2>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#5D504A] tracking-tight">
            The Ultimate Reel Planner
        </h1>
        <p className="mt-4 text-lg text-[#8C766A] max-w-2xl mx-auto">
            Turn your topic into a viral content strategy. Get a niched-down idea, a catchy hook, a full script, and production tips in seconds.
        </p>
    </header>
);

const App: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [socialMediaLink, setSocialMediaLink] = useState<string>('');
    const [contentStyle, setContentStyle] = useState<'with-face' | 'faceless'>('with-face');
    
    const [contentPlan, setContentPlan] = useState<Partial<ContentPlan> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generationProgress, setGenerationProgress] = useState<number>(0);

    const [thirtyDayPlan, setThirtyDayPlan] = useState<ThirtyDayPlan | null>(null);
    const [isThirtyDayPlanLoading, setIsThirtyDayPlanLoading] = useState<boolean>(false);
    const [thirtyDayPlanError, setThirtyDayPlanError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const pdfContentRef = useRef<HTMLDivElement>(null);


    const handleGeneratePlan = useCallback(async () => {
        if (!topic.trim() || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setContentPlan(null);
        setThirtyDayPlan(null);
        setThirtyDayPlanError(null);
        setGenerationProgress(0);

        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => {
                const next = prev + 5;
                if (next > 95) {
                    clearInterval(progressInterval);
                    return 95;
                }
                return next;
            });
        }, 200);

        try {
            const stream = generateContentPlanStream(topic, socialMediaLink, contentStyle);
            let accumulatedJson = "";
            let isFirstChunk = true;

            for await (const chunk of stream) {
                if (isFirstChunk) {
                    // Stop skeleton, show empty card structure
                    setContentPlan({});  
                    isFirstChunk = false;
                }
                accumulatedJson += chunk;
            }
            
            clearInterval(progressInterval);
            setGenerationProgress(100);

            if (accumulatedJson) {
                const startIndex = accumulatedJson.indexOf('{');
                const endIndex = accumulatedJson.lastIndexOf('}');
                
                if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
                    throw new Error("Could not find a valid JSON object in the response.");
                }
                
                const jsonString = accumulatedJson.substring(startIndex, endIndex + 1);
                const finalPlan = JSON.parse(jsonString);
                setContentPlan(finalPlan);
            } else if (!isFirstChunk) {
                throw new Error("The model returned an empty response.");
            }

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setContentPlan(null);
            console.error(err);
        } finally {
             clearInterval(progressInterval);
             setTimeout(() => {
                setIsLoading(false);
                setGenerationProgress(0);
             }, 1000); // Give time for the 100% to be seen
        }
    }, [topic, socialMediaLink, contentStyle, isLoading]);

    const handleGenerateThirtyDayPlan = useCallback(async () => {
        if (!topic) return;
        setIsThirtyDayPlanLoading(true);
        setThirtyDayPlanError(null);
        try {
            const plan = await generateThirtyDayPlan(topic);
            setThirtyDayPlan(plan);
            setIsModalOpen(true);
        } catch (err: unknown) {
            setThirtyDayPlanError(err instanceof Error ? err.message : 'Failed to generate 30-day plan.');
        } finally {
            setIsThirtyDayPlanLoading(false);
        }
    }, [topic]);

    const handleDownloadPdf = useCallback(async () => {
        const content = pdfContentRef.current;
        if (!content) return;

        // Temporarily open all accordion items for capture
        const detailsElements = content.querySelectorAll('details');
        detailsElements.forEach(el => el.setAttribute('open', 'true'));

        try {
            const canvas = await html2canvas(content, {
                scale: 2,
                backgroundColor: '#FDF8F5',
                useCORS: true,
            });

            // Close the accordion items again to restore the UI
            detailsElements.forEach(el => el.removeAttribute('open'));
            
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
            });

            const pageHeight = pdf.internal.pageSize.getHeight();
            const pageWidth = pdf.internal.pageSize.getWidth();
            
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pageWidth;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = -pageHeight - position;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(`30-Day_Content_Plan_${topic.replace(/\s+/g, '_')}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
            setThirtyDayPlanError("Could not generate PDF. Please try again.");
             // Ensure accordion is closed even if there's an error
            detailsElements.forEach(el => el.removeAttribute('open'));
        }
    }, [topic]);
    
    const handleDownloadHtml = useCallback(() => {
        const content = pdfContentRef.current;
        if (!content) return;

        const contentHtml = content.innerHTML;
        const fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>30-Day Content Plan for ${topic}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    body { 
                        font-family: 'Inter', sans-serif; 
                        background-color: #FDF8F5; 
                        padding: 2rem; 
                    }
                    /* Ensure accordion works in downloaded file */
                    details > summary { 
                        list-style: none; 
                        cursor: pointer;
                    }
                    details > summary::-webkit-details-marker { 
                        display: none; 
                    }
                </style>
            </head>
            <body class="bg-[#FDF8F5]">
                <div class="max-w-3xl mx-auto">
                    ${contentHtml}
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `30-Day_Content_Plan_${topic.replace(/\s+/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [topic]);


    return (
        <div className="min-h-screen bg-[#FDF8F5] text-[#5D504A] py-8 px-4">
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
            <div className="container mx-auto max-w-4xl">
                <Header />

                <main className="mt-8">
                     <div className="max-w-2xl mx-auto space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="topic-input" className="text-lg font-semibold text-[#8C766A] px-2">1. What's your content about?</label>
                            <input
                                id="topic-input"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., 'vegan cooking', 'side hustles', 'pottery'"
                                className="w-full px-5 py-4 text-lg bg-white/60 border-2 border-rose-100 rounded-full focus:ring-2 focus:ring-[#EBC944] focus:border-[#EBC944] outline-none transition-all duration-300 shadow-sm"
                                disabled={isLoading || isThirtyDayPlanLoading}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading && topic.trim()) handleGeneratePlan(); }}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-lg font-semibold text-[#8C766A] px-2">2. Personalize your plan</label>
                            <div className="p-4 bg-white/30 rounded-2xl border border-rose-100 space-y-4">
                                <input
                                    type="text"
                                    value={socialMediaLink}
                                    onChange={(e) => setSocialMediaLink(e.target.value)}
                                    placeholder="Profile link for style inspiration (optional)"
                                    className="w-full px-5 py-3 bg-white/80 border-2 border-rose-100 rounded-full focus:ring-2 focus:ring-[#EBC944] focus:border-[#EBC944] outline-none transition-all duration-300 shadow-sm"
                                    disabled={isLoading || isThirtyDayPlanLoading}
                                />
                                
                                <div className="flex items-center justify-center gap-4 pt-2">
                                    <span className="font-semibold text-[#8C766A]">Content Style:</span>
                                    <div className="flex items-center gap-2 p-1 bg-rose-100 rounded-full">
                                        <button onClick={() => setContentStyle('with-face')} disabled={isLoading || isThirtyDayPlanLoading} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${contentStyle === 'with-face' ? 'bg-white shadow' : 'text-[#8C766A]'}`}>With Face</button>
                                        <button onClick={() => setContentStyle('faceless')} disabled={isLoading || isThirtyDayPlanLoading} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${contentStyle === 'faceless' ? 'bg-white shadow' : 'text-[#8C766A]'}`}>Faceless</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-2">
                             <button
                                onClick={handleGeneratePlan}
                                disabled={isLoading || isThirtyDayPlanLoading || !topic.trim()}
                                className="relative w-full sm:w-auto flex-shrink-0 px-8 py-4 text-lg font-bold text-white bg-[#D3A6A0] rounded-full hover:bg-[#c99891] transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:scale-100 shadow-lg overflow-hidden"
                            >
                                <div 
                                    className="absolute top-0 left-0 h-full bg-[#b5857e] transition-all duration-300 ease-linear"
                                    style={{ width: `${generationProgress}%` }}
                                ></div>
                                <span className="relative z-10">
                                    {isLoading ? `Generating... ${generationProgress}%` : 'Create Plan'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-12">
                        {isLoading && !contentPlan && <SkeletonCard />}
                        {error && (
                            <div className="text-center p-4 sm:p-6 bg-red-100 border border-red-300 text-red-700 rounded-xl max-w-2xl mx-auto animate-fade-in">
                                <h3 className="font-bold">Oops! Something went wrong.</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        {contentPlan && (
                           <div className="animate-fade-in">
                               <ContentPlanCard plan={contentPlan} />
                               <div className="mt-8 text-center">
                                   <button
                                       onClick={handleGenerateThirtyDayPlan}
                                       disabled={isThirtyDayPlanLoading}
                                       className="px-6 py-3 font-semibold text-white bg-[#8C766A] rounded-full hover:bg-[#7a655a] transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                   >
                                       {isThirtyDayPlanLoading ? 'Building Your Calendar...' : '🚀 Create a 30-Day Content Plan'}
                                   </button>
                                   {thirtyDayPlanError && <p className="text-red-600 mt-2">{thirtyDayPlanError}</p>}
                               </div>
                           </div>
                        )}
                    </div>
                </main>
                <footer className="text-center mt-16 text-[#bca79d]">
                    <p>&copy; {new Date().getFullYear()} Viral Reel Content Planner. Powered by Gemini.</p>
                </footer>
            </div>
            {isModalOpen && thirtyDayPlan && (
                <ThirtyDayPlanModal 
                    plan={thirtyDayPlan}
                    topic={topic}
                    onClose={() => setIsModalOpen(false)}
                    onDownloadPdf={handleDownloadPdf}
                    onDownloadHtml={handleDownloadHtml}
                    pdfContentRef={pdfContentRef}
                />
            )}
        </div>
    );
};

export default App;
