
import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Settings, 
  Download, 
  Copy, 
  Link as LinkIcon, 
  Type, 
  MessageCircle, 
  Mail, 
  Wifi, 
  Moon, 
  Sun, 
  Languages, 
  Image as ImageIcon,
  Grid,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { QRCanvas } from './components/QRCanvas';
import { BulkGenerator } from './components/BulkGenerator';
import { QRConfig, QRFormat, Language } from './types';
import { TRANSLATIONS } from './constants';
import { formatWhatsApp, formatEmail, formatWiFi, downloadBlob } from './utils/qrHelpers';

const App: React.FC = () => {
  // Navigation & Appearance
  const [view, setView] = useState<'generator' | 'privacy' | 'terms'>('generator');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  // Config State (Actual QR values)
  const [config, setConfig] = useState<QRConfig>({
    value: 'https://google.com',
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'M',
    includeMargin: true,
    format: 'URL',
  });

  // Local input states
  const [pendingValue, setPendingValue] = useState('https://google.com');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappMsg, setWhatsappMsg] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSub, setEmailSub] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  const qrRef = useRef<{ getCanvas: () => HTMLCanvasElement | null; getSVG: () => SVGSVGElement | null }>(null);
  const t = TRANSLATIONS[lang];

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) setTheme('dark');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const updateConfig = (updates: Partial<QRConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleFormatChange = (format: QRFormat) => {
    updateConfig({ format });
    if (format === 'URL' && !pendingValue) setPendingValue('https://');
  };

  const generateQR = () => {
    let finalValue = pendingValue;
    switch (config.format) {
      case 'WHATSAPP': finalValue = formatWhatsApp(whatsappPhone, whatsappMsg); break;
      case 'EMAIL': finalValue = formatEmail(emailTo, emailSub, emailBody); break;
      case 'WIFI': finalValue = formatWiFi(wifiSSID, wifiPass, wifiEnc, wifiHidden); break;
    }
    updateConfig({ value: finalValue });
  };

  const downloadPng = () => {
    const canvas = qrRef.current?.getCanvas();
    if (canvas) {
      canvas.toBlob((blob) => { if (blob) downloadBlob(blob, `qrcode-${Date.now()}.png`); });
    }
  };

  const downloadSvg = () => {
    const svg = qrRef.current?.getSVG();
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      downloadBlob(svgBlob, `qrcode-${Date.now()}.svg`);
    }
  };

  const copyToClipboard = async () => {
    const canvas = qrRef.current?.getCanvas();
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            alert(t.copied);
          } catch (err) { alert(t.error); }
        }
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => updateConfig({ logo: event.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const LegalPage = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Button variant="ghost" className="mb-8" onClick={() => setView('generator')}>
        <ArrowLeft size={18} className="mr-2" /> {t.backToApp}
      </Button>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Icon size={32} />
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
          {children}
        </div>
      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('generator')}>
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <QrCode size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">{t.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <select 
              className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-grow">
        {view === 'generator' && (
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
            <div className="flex flex-col items-center mb-10">
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                {t.subtitle}
              </h1>
              <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mt-6">
                <button onClick={() => setActiveTab('single')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'single' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  <QrCode size={18} /> Single
                </button>
                <button onClick={() => setActiveTab('bulk')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'bulk' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  <Grid size={18} /> Bulk
                </button>
              </div>
            </div>

            {activeTab === 'single' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                  <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 overflow-x-auto no-scrollbar">
                      {[
                        { id: 'URL', icon: LinkIcon, label: t.url },
                        { id: 'TEXT', icon: Type, label: t.text },
                        { id: 'WHATSAPP', icon: MessageCircle, label: t.whatsapp },
                        { id: 'EMAIL', icon: Mail, label: t.email },
                        { id: 'WIFI', icon: Wifi, label: t.wifi },
                      ].map((f) => (
                        <button key={f.id} onClick={() => handleFormatChange(f.id as QRFormat)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${config.format === f.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                          <f.icon size={16} /> {f.label}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {config.format === 'URL' && (
                          <div className="space-y-1">
                            <label className="text-sm font-semibold">{t.url}</label>
                            <input type="url" value={pendingValue} onChange={(e) => setPendingValue(e.target.value)} placeholder="https://example.com" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                          </div>
                        )}
                        {config.format === 'TEXT' && (
                          <div className="space-y-1">
                            <label className="text-sm font-semibold">{t.text}</label>
                            <textarea value={pendingValue} onChange={(e) => setPendingValue(e.target.value)} placeholder="Enter your message here..." rows={4} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none" />
                          </div>
                        )}
                        {config.format === 'WHATSAPP' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-semibold">Phone Number</label>
                              <input type="tel" value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder="+1 234 567 890" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-sm font-semibold">Pre-filled Message</label>
                              <textarea value={whatsappMsg} onChange={(e) => setWhatsappMsg(e.target.value)} placeholder="Hello, I'm interested in..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            </div>
                          </div>
                        )}
                        {config.format === 'EMAIL' && (
                          <div className="space-y-4">
                            <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="Recipient Email" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <input type="text" value={emailSub} onChange={(e) => setEmailSub(e.target.value)} placeholder="Subject" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Message..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                          </div>
                        )}
                        {config.format === 'WIFI' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" value={wifiSSID} onChange={(e) => setWifiSSID(e.target.value)} placeholder="Network SSID" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <input type="password" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="Password" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                          </div>
                        )}
                      </div>
                      <Button variant="primary" fullWidth size="lg" onClick={generateQR} className="group">
                        <Sparkles size={20} className="mr-2 group-hover:animate-pulse" /> {t.generate}
                      </Button>
                    </div>
                  </section>

                  <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-6">
                      <Settings size={20} className="text-indigo-600" />
                      <h2 className="text-lg font-bold">Customization</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm font-semibold">
                            <label>{t.size}</label>
                            <span className="text-xs text-slate-500">{config.size}px</span>
                          </div>
                          <input type="range" min="128" max="1024" step="16" value={config.size} onChange={(e) => updateConfig({ size: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <label className="text-sm font-semibold">{t.color}</label>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                              <input type="color" value={config.fgColor} onChange={(e) => updateConfig({ fgColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                              <span className="text-xs font-mono uppercase">{config.fgColor}</span>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <label className="text-sm font-semibold">{t.background}</label>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                              <input type="color" value={config.bgColor} onChange={(e) => updateConfig({ bgColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                              <span className="text-xs font-mono uppercase">{config.bgColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">{t.logo}</label>
                          <div className="flex items-center gap-4">
                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                              <ImageIcon size={20} className="text-slate-400" />
                              <span className="text-sm text-slate-500">Upload Image</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                            {config.logo && <button onClick={() => updateConfig({ logo: undefined })} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors">×</button>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="margin" checked={config.includeMargin} onChange={(e) => updateConfig({ includeMargin: e.target.checked })} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                          <label htmlFor="margin" className="text-sm font-medium select-none cursor-pointer">{t.margin}</label>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-4 sticky top-24">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                    <QRCanvas ref={qrRef} config={config} type="canvas" />
                    <div className="space-y-3">
                      <Button variant="primary" fullWidth size="lg" onClick={downloadPng}><Download size={20} className="mr-2" /> {t.downloadPng}</Button>
                      <Button variant="outline" fullWidth onClick={downloadSvg}><Download size={20} className="mr-2" /> {t.downloadSvg}</Button>
                      <Button variant="ghost" fullWidth onClick={copyToClipboard}><Copy size={20} className="mr-2" /> {t.copy}</Button>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-center text-slate-400 leading-tight">{t.privacyNote}</div>
                  </div>
                </div>
              </div>
            ) : (
              <BulkGenerator lang={lang} />
            )}
          </main>
        )}

        {view === 'privacy' && (
          <LegalPage title={t.privacyPolicy} icon={ShieldCheck}>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">1. Overview</h2>
              <p>At QR Pro, we take your privacy seriously. This service is designed as a client-side tool, meaning that your data belongs to you and stays on your device.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">2. Data Collection</h2>
              <p>We do <strong>not</strong> collect, store, or transmit any data entered into our generator. All QR code generation is performed locally in your browser using JavaScript. No information about the URLs, messages, or phone numbers you encode is ever sent to our servers.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">3. Local Storage</h2>
              <p>The application may use local browser storage only to remember your preferences (such as language or dark mode settings). This data never leaves your device.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">4. Third-Party Services</h2>
              <p>We use reputable Content Delivery Networks (CDNs) like esm.sh and Google Fonts to serve the application files. These services may log basic technical information (like IP addresses) for security and performance auditing, as per their own privacy policies.</p>
            </section>
          </LegalPage>
        )}

        {view === 'terms' && (
          <LegalPage title={t.termsOfService} icon={FileText}>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">1. Acceptance of Terms</h2>
              <p>By using QR Pro, you agree to these terms. If you do not agree, please stop using the service immediately.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">2. Use of Service</h2>
              <p>You are solely responsible for the content you embed in the QR codes generated using this tool. You must not use this tool to generate QR codes for malicious purposes, including but not limited to phishing, malware distribution, or illegal activities.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">3. No Warranty</h2>
              <p>The service is provided "as is" and "as available" without any warranty of any kind. We do not guarantee that the QR codes generated will be scannable by all devices or that the service will be available 100% of the time.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">4. Limitation of Liability</h2>
              <p>In no event shall QR Pro or its developers be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.</p>
            </section>
          </LegalPage>
        )}
      </div>

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm text-slate-500 dark:text-slate-400">
            <button onClick={() => setView('privacy')} className="hover:text-indigo-600 transition-colors focus:outline-none">{t.privacyPolicy}</button>
            <button onClick={() => setView('terms')} className="hover:text-indigo-600 transition-colors focus:outline-none">{t.termsOfService}</button>
            <button className="hover:text-indigo-600 transition-colors focus:outline-none">Cookie Settings</button>
            <button className="hover:text-indigo-600 transition-colors focus:outline-none">API Documentation</button>
            <button className="hover:text-indigo-600 transition-colors focus:outline-none">Support</button>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} QR Pro Studio. Made for developers and business professionals.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
