import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
    generateReelContentStream, 
    generateAdPlanStream, 
    parseAndTransformContent,
} from './services/geminiService';
import type { GeneratedContent, HistoryItem, Appearance, AdInputs } from './types';
import { ContentPlanCard } from './components/ContentPlanCard';
import { OverlayTextCard } from './components/OverlayTextCard';
import { SkeletonCard } from './components/SkeletonCard';
import { SkeletonAdCard } from './components/SkeletonAdCard';
import { ThirtyDayPlanModal } from './components/ThirtyDayPlanModal';
import { AdPlanCard } from './components/AdPlanCard';
import { History } from './components/History';
import { Feedback } from './components/Feedback';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type PlannerMode = 'reel' | 'ad';

const PlannerToggle: React.FC<{ mode: PlannerMode; setMode: (mode: PlannerMode) => void }> = ({ mode, setMode }) => (
    <div className="flex justify-center my-8">
        <div className="bg-white/50 border border-rose-100 rounded-full p-1 flex space-x-1">
            <button
                onClick={() => setMode('reel')}
                className={`px-6 py-2 text-base font-semibold rounded-full transition-colors ${mode === 'reel' ? 'bg-[#D3A6A0] text-white shadow' : 'text-[#8C766A] hover:bg-rose-50'}`}
            >
                Reel Planner
            </button>
            <button
                onClick={() => setMode('ad')}
                className={`px-6 py-2 text-base font-semibold rounded-full transition-colors ${mode === 'ad' ? 'bg-[#D3A6A0] text-white shadow' : 'text-[#8C766A] hover:bg-rose-50'}`}
            >
                Ad Planner
            </button>
        </div>
    </div>
);


const Header: React.FC<{ mode: PlannerMode }> = ({ mode }) => (
    <header className="text-center p-4 sm:p-6">
        <div className="inline-block bg-[#EBC944] -rotate-3 transform px-4 py-1 rounded-md mb-4">
            <h2 className="text-white text-lg font-bold rotate-3 transform">AI POWERED</h2>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#5D504A] tracking-tight">
            {mode === 'reel' ? 'The Ultimate Reel Planner' : 'The Ultimate Ad Planner'}
        </h1>
        <p className="mt-4 text-lg text-[#8C766A] max-w-2xl mx-auto">
            {mode === 'reel' 
                ? 'Describe what you need—a full content plan, viral hooks, or a 30-day calendar—and let our AI build it for you.'
                : 'Answer the questions below, and our AI strategist will build a comprehensive, 1-month paid ad campaign for you.'
            }
        </p>
    </header>
);

const adQuestions: { id: keyof AdInputs; label: string; placeholder: string; rows?: number }[] = [
    { id: 'business', label: 'The Business / Product (What you sell)', placeholder: 'e.g., A local acupuncture clinic in Austin, TX', rows: 2 },
    { id: 'customer', label: 'The Target Customer (Who you sell to)', placeholder: 'e.g., Young professionals with chronic back pain from desk jobs', rows: 2 },
    { id: 'painPoint', label: 'The Core Problem (Their biggest pain point)', placeholder: 'e.g., They\'ve tried everything but are skeptical of medication', rows: 2 },
    { id: 'offer', label: 'The Irresistible Offer (The low-risk entry point)', placeholder: 'e.g., A $29 introductory consultation and pain assessment', rows: 1 },
    { id: 'goal', label: 'The Campaign Goal (The #1 action to take)', placeholder: 'e.g., Book the introductory session online', rows: 1 },
];


const App: React.FC = () => {
    const [plannerMode, setPlannerMode] = useState<PlannerMode>('reel');
    
    // --- State for inputs ---
    const [masterPrompt, setMasterPrompt] = useState<string>(''); // For Reel Planner
    const [adInputs, setAdInputs] = useState<AdInputs>({
        business: '', customer: '', painPoint: '', offer: '', goal: ''
    }); // For Ad Planner
    const [niche, setNiche] = useState<string>('');
    const [videoLength, setVideoLength] = useState<string>('');
    const [appearance, setAppearance] = useState<Appearance>('in-front');
    
    // --- State for generation ---
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generationProgress, setGenerationProgress] = useState<number>(0);
    const [isFreshGeneration, setIsFreshGeneration] = useState<boolean>(false);

    // --- State for modals and history ---
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const pdfContentRef = useRef<HTMLDivElement>(null);
    const adPlanContentRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [activeHistoryTimestamp, setActiveHistoryTimestamp] = useState<number | null>(null);
    
    // --- Effects ---
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('viralReelHistory');
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
        }
    }, []);
    
    const resetAllState = () => {
        setMasterPrompt('');
        setAdInputs({ business: '', customer: '', painPoint: '', offer: '', goal: '' });
        setNiche('');
        setVideoLength('');
        setAppearance('in-front');
        setGeneratedContent(null);
        setError(null);
        setActiveHistoryTimestamp(null);
        setIsFreshGeneration(false);
    };

    const handlePlannerModeChange = (mode: PlannerMode) => {
        setPlannerMode(mode);
        resetAllState();
    };

    const handleAdInputChange = (field: keyof AdInputs, value: string) => {
        setAdInputs(prev => ({ ...prev, [field]: value }));
    };
    
    const handleGenerate = useCallback(async () => {
        const isAdPlannerReady = plannerMode === 'ad' && Object.values(adInputs).every(val => val.trim() !== '');
        const isReelPlannerReady = plannerMode === 'reel' && masterPrompt.trim() !== '';

        if (isLoading || (!isAdPlannerReady && !isReelPlannerReady)) return;
        
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        setGenerationProgress(0);
        setActiveHistoryTimestamp(null);
        setModalError(null);
        setIsFreshGeneration(true);

        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => Math.min(prev + 5, 95));
        }, 200);
        
        let promptForHistory: string;
        let adInputsForHistory: AdInputs | undefined;
        let generationPrompt: string;
        let stream;

        if (plannerMode === 'ad') {
            const { business, customer, painPoint, offer, goal } = adInputs;
            generationPrompt = `Business: ${business}. Target Customer: ${customer}. Customer's Pain Point: ${painPoint}. Offer: ${offer}. Campaign Goal: ${goal}.`;
            promptForHistory = adInputs.business; // Use business name for history display
            adInputsForHistory = adInputs;
            stream = generateAdPlanStream(generationPrompt, niche, appearance);
        } else {
            generationPrompt = masterPrompt;
            promptForHistory = masterPrompt;
            stream = generateReelContentStream(generationPrompt, niche, appearance, videoLength);
        }

        try {
            let accumulatedJson = "";
            for await (const chunk of stream) {
                accumulatedJson += chunk;
            }
            
            clearInterval(progressInterval);
            setGenerationProgress(100);

            if (accumulatedJson) {
                const finalContent = parseAndTransformContent(accumulatedJson);
                setGeneratedContent(finalContent);

                const newItem: HistoryItem = { 
                    prompt: promptForHistory,
                    adInputs: adInputsForHistory,
                    niche,
                    appearance,
                    videoLength: plannerMode === 'reel' ? videoLength : undefined,
                    result: finalContent, 
                    timestamp: Date.now() 
                };
                setActiveHistoryTimestamp(newItem.timestamp);
                
                setHistory(prevHistory => {
                    const newHistory = [newItem, ...prevHistory].slice(0, 10);
                    localStorage.setItem('viralReelHistory', JSON.stringify(newHistory));
                    return newHistory;
                });
                
                if (finalContent.contentType === 'THIRTY_DAY_PLAN') {
                    setIsModalOpen(true);
                }

            } else {
                throw new Error("The model returned an empty response.");
            }

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setGeneratedContent(null);
            console.error(err);
        } finally {
             clearInterval(progressInterval);
             setTimeout(() => {
                setIsLoading(false);
                setGenerationProgress(0);
             }, 1000);
        }
    }, [masterPrompt, adInputs, niche, appearance, videoLength, isLoading, plannerMode]);

    const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
        const itemMode = item.result.contentType === 'AD_PLAN' ? 'ad' : 'reel';
        setPlannerMode(itemMode);
        setIsFreshGeneration(false);
        
        setTimeout(() => { 
             setMasterPrompt(itemMode === 'reel' ? item.prompt : '');
             setAdInputs(item.adInputs || { business: '', customer: '', painPoint: '', offer: '', goal: '' });
             setNiche(item.niche || '');
             setAppearance(item.appearance || 'in-front');
             setVideoLength(item.videoLength || '');
             setGeneratedContent(item.result);
             setActiveHistoryTimestamp(item.timestamp);
             if (item.result.contentType === 'THIRTY_DAY_PLAN') {
                 setIsModalOpen(true);
             } else {
                 setIsModalOpen(false);
             }
        }, 0);

    }, []);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
        localStorage.setItem('viralReelHistory', JSON.stringify([]));
    }, []);

    const handleDownloadPdf = useCallback(async () => {
        const content = pdfContentRef.current;
        if (!content) return;

        setModalError(null);
        const detailsElements = content.querySelectorAll('details');
        detailsElements.forEach(el => el.setAttribute('open', 'true'));

        try {
            const canvas = await html2canvas(content, { scale: 2, backgroundColor: '#FDF8F5', useCORS: true });
            detailsElements.forEach(el => el.removeAttribute('open'));
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pageHeight = pdf.internal.pageSize.getHeight();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = -pageHeight - position;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight);
                heightLeft -= pageHeight;
            }
            pdf.save(`30-Day_Plan_For_${masterPrompt.substring(0, 20).replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            setModalError("Could not generate PDF. Please try again.");
            detailsElements.forEach(el => el.removeAttribute('open'));
        }
    }, [masterPrompt]);
    
    const handleDownloadHtml = useCallback(() => {
        const content = pdfContentRef.current;
        if (!content) return;
        setModalError(null);
        const titlePrompt = masterPrompt || adInputs.business;
        const fullHtml = `<!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>30-Day Content Plan for ${titlePrompt}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>body { font-family: 'Inter', sans-serif; background-color: #FDF8F5; padding: 2rem; } details > summary { list-style: none; cursor: pointer; } details > summary::-webkit-details-marker { display: none; }</style>
            </head><body><div class="max-w-3xl mx-auto">${content.innerHTML}</div></body></html>`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `30-Day_Plan_For_${titlePrompt.substring(0, 20).replace(/\s+/g, '_')}.html`;
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    }, [masterPrompt, adInputs.business]);

    const handleDownloadAdPlanPdf = useCallback(async () => {
        const content = adPlanContentRef.current;
        if (!content) return;

        setError(null);
        const detailsElements = content.querySelectorAll('details');
        detailsElements.forEach(el => el.setAttribute('open', 'true'));

        try {
            const canvas = await html2canvas(content, { scale: 2, backgroundColor: '#FDF8F5', useCORS: true });
            detailsElements.forEach(el => el.removeAttribute('open'));
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            
            const pageHeight = pdf.internal.pageSize.getHeight();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
            
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = position - pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pageWidth, pdfHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }
            pdf.save(`Ad_Plan_${adInputs.business.substring(0, 20).replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error generating Ad Plan PDF:", error);
            setError("Could not generate PDF. Please try again.");
            detailsElements.forEach(el => el.removeAttribute('open'));
        }
    }, [adInputs.business]);
    
    const handleDownloadAdPlanHtml = useCallback(() => {
        const content = adPlanContentRef.current;
        if (!content) return;
        setError(null);
        const titlePrompt = adInputs.business;
        const fullHtml = `<!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Ad Plan for ${titlePrompt}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>body { font-family: 'Inter', sans-serif; background-color: #FDF8F5; padding: 2rem; } details > summary { list-style: none; cursor: pointer; } details > summary::-webkit-details-marker { display: none; }</style>
            </head><body><div class="max-w-3xl mx-auto">${content.innerHTML}</div></body></html>`;
        
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ad_Plan_${titlePrompt.substring(0, 20).replace(/\s+/g, '_')}.html`;
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    }, [adInputs.business]);

    const renderContent = () => {
        if (!generatedContent) return null;
        switch (generatedContent.contentType) {
            case 'SINGLE_PLAN':
                return <ContentPlanCard plan={generatedContent.plan} />;
            case 'OVERLAY_TEXT':
                return <OverlayTextCard plan={generatedContent.plan} />;
            case 'AD_PLAN':
                return (
                    <AdPlanCard 
                        ref={adPlanContentRef}
                        plan={generatedContent.plan}
                        onDownloadHtml={handleDownloadAdPlanHtml}
                        onDownloadPdf={handleDownloadAdPlanPdf}
                    />
                );
            case 'THIRTY_DAY_PLAN':
                return null; // Handled by modal
            default:
                return null;
        }
    };

    const isGenerateDisabled = isLoading || (plannerMode === 'reel' ? !masterPrompt.trim() : !Object.values(adInputs).every(v => v.trim()));

    const appearanceOptions: { id: Appearance; label: string; description: string }[] = [
        { id: 'in-front', label: 'Talking to Camera', description: 'I will be the main subject, speaking directly to the camera.' },
        { id: 'in-front-voiceover', label: 'Talking to Camera + VO', description: 'I will be speaking to the camera, with a voiceover.' },
        { id: 'background', label: 'On-Screen Action', description: 'I will be demonstrating something, with no spoken words.' },
        { id: 'background-voiceover', label: 'On-Screen Action + VO', description: 'I will be demonstrating something, with a voiceover.' },
        { id: 'b-roll-voiceover', label: 'B-roll + VO', description: 'The video shows B-roll footage (e.g., scenery, product shots), with a voiceover.' },
    ];

    return (
        <div className="min-h-screen bg-[#FDF8F5] text-[#5D504A] py-8 px-4">
            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                textarea::placeholder, input::placeholder { color: #bca79d; }
            `}</style>
            <div className="container mx-auto max-w-4xl">
                <Header mode={plannerMode} />
                <PlannerToggle mode={plannerMode} setMode={handlePlannerModeChange} />

                <main>
                     <div className="max-w-2xl mx-auto space-y-6">
                        {plannerMode === 'reel' ? (
                            <div className="space-y-2">
                                 <label htmlFor="master-prompt" className="text-lg font-semibold text-[#8C766A] px-2">
                                   What content do you want to create?
                                </label>
                                <textarea
                                    id="master-prompt"
                                    value={masterPrompt}
                                    onChange={(e) => setMasterPrompt(e.target.value)}
                                    placeholder="e.g., A 30-day plan for a vegan cooking channel"
                                    className="w-full px-5 py-4 text-base bg-white/60 border-2 border-rose-100 rounded-2xl focus:ring-2 focus:ring-[#EBC944] focus:border-[#EBC944] outline-none transition-all duration-300 shadow-sm min-h-[100px] resize-y"
                                    disabled={isLoading}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isGenerateDisabled) { e.preventDefault(); handleGenerate(); } }}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {adQuestions.map(({ id, label, placeholder, rows }) => (
                                    <div key={id} className="space-y-2">
                                        <label htmlFor={id} className="text-lg font-semibold text-[#8C766A] px-2">{label}</label>
                                        <textarea
                                            id={id}
                                            value={adInputs[id]}
                                            onChange={(e) => handleAdInputChange(id, e.target.value)}
                                            placeholder={placeholder}
                                            rows={rows || 2}
                                            className="w-full px-5 py-4 text-base bg-white/60 border-2 border-rose-100 rounded-2xl focus:ring-2 focus:ring-[#EBC944] focus:border-[#EBC944] outline-none transition-all duration-300 shadow-sm resize-y"
                                            disabled={isLoading}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-white/40 border border-rose-100 rounded-2xl p-4 sm:p-5 space-y-4">
                             <div className="space-y-2">
                                <label htmlFor="niche" className="text-lg font-semibold text-[#8C766A] px-2">
                                    Niche (Optional)
                                </label>
                                <input
                                    id="niche"
                                    type="text"
                                    value={niche}
                                    onChange={(e) => setNiche(e.target.value)}
                                    placeholder="e.g., Fitness, Real Estate, B2B SaaS"
                                    className="w-full px-4 py-3 text-base bg-white/80 border border-rose-100 rounded-xl focus:ring-1 focus:ring-[#EBC944] focus:border-[#EBC944] outline-none transition-all duration-300 shadow-sm"
                                    disabled={isLoading}
                                />
                            </div>

                            {plannerMode === 'reel' && (
                                <div className="space-y-2">
                                    <label htmlFor="video-length" className="text-lg font-semibold text-[#8C766A] px-2">
                                        Desired Video Length (Optional)
                                    </label>
                                    <input
                                        id="video-length"
                                        type="text"
                                        value={videoLength}
                                        onChange={(e) => setVideoLength(e.target.value)}
                                        placeholder="e.g., Under 30 seconds, 60-90 seconds"
                                        className="w-full px-4 py-3 text-base bg-white/80 border border-rose-100 rounded-xl focus:ring-1 focus:ring-[#EBC944] focus:border-[#EBC944] outline-none transition-all duration-300 shadow-sm"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-lg font-semibold text-[#8C766A] px-2 block">
                                    Creator's Role in the Video
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {appearanceOptions.map(option => (
                                        <label key={option.id} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${appearance === option.id ? 'bg-white border-[#D3A6A0] shadow-md' : 'bg-white/50 border-rose-100 hover:border-rose-200'}`}>
                                            <input
                                                type="radio"
                                                name="appearance"
                                                value={option.id}
                                                checked={appearance === option.id}
                                                onChange={() => setAppearance(option.id)}
                                                className="sr-only"
                                                disabled={isLoading}
                                            />
                                            <span className="font-semibold text-base text-[#5D504A]">{option.label}</span>
                                            <p className="text-sm text-[#8C766A] mt-1">{option.description}</p>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>


                        <div className="flex justify-center pt-2">
                             <button
                                onClick={handleGenerate}
                                disabled={isGenerateDisabled}
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

                    <History 
                        history={history}
                        activeTimestamp={activeHistoryTimestamp}
                        onSelect={handleSelectHistoryItem}
                        onClear={handleClearHistory}
                        isLoading={isLoading}
                    />

                    <div className="mt-12">
                        {isLoading && !generatedContent && (plannerMode === 'reel' ? <SkeletonCard /> : <SkeletonAdCard />) }
                        {error && (
                            <div className="text-center p-4 sm:p-6 bg-red-100 border border-red-300 text-red-700 rounded-xl max-w-2xl mx-auto animate-fade-in">
                                <h3 className="font-bold">Oops! Something went wrong.</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        {generatedContent && !isModalOpen && (
                           <div className="animate-fade-in">
                               {renderContent()}
                               {isFreshGeneration && <Feedback />}
                           </div>
                        )}
                    </div>
                </main>
                <footer className="text-center mt-16 text-[#bca79d]">
                    <p>&copy; {new Date().getFullYear()} AI Content & Ad Planner. Powered by Gemini.</p>
                </footer>
            </div>
            {isModalOpen && generatedContent?.contentType === 'THIRTY_DAY_PLAN' && (
                <ThirtyDayPlanModal 
                    plan={generatedContent.plan}
                    prompt={plannerMode === 'reel' ? masterPrompt : adInputs.business}
                    onClose={() => setIsModalOpen(false)}
                    onDownloadPdf={handleDownloadPdf}
                    onDownloadHtml={handleDownloadHtml}
                    pdfContentRef={pdfContentRef}
                    error={modalError}
                />
            )}
        </div>
    );
};

export default App;