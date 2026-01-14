import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const TermsPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // Load from database
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/kv/legal_pages_terms`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.value) {
          setContent(data.value);
        } else {
          // Default content if none exists in database
          setDefaultContent();
        }
      } else {
        // Default content if database fetch fails
        setDefaultContent();
      }
    } catch (error) {
      console.error('Error loading terms:', error);
      // Default content on error
      setDefaultContent();
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultContent = () => {
    setContent(`<h2>1. Informații Generale</h2>
<p>Prezentele Termeni și Condiții reglementează utilizarea site-ului BlueHand Canvas și achiziționarea de produse prin intermediul acestuia.</p>

<h2>2. Definiții</h2>
<p><strong>Vânzător:</strong> BlueHand Canvas, cu sediul în Str. Bisericii, nr. 5, Movilita, Ialomita, Romania.</p>
<p><strong>Cumpărător:</strong> Persoană fizică sau juridică care plasează o comandă pe site-ul nostru.</p>
<p><strong>Produs:</strong> Tablouri canvas și produse personalizate oferite spre vânzare.</p>

<h2>3. Înregistrarea Comenzii</h2>
<p>Comanda se consideră înregistrată după finalizarea procesului de checkout și primirea confirmării prin email.</p>
<p>Ne rezervăm dreptul de a refuza sau anula orice comandă în cazul unor circumstanțe excepționale.</p>

<h2>4. Prețuri și Plata</h2>
<p>Toate prețurile afișate pe site sunt în LEI (RON) și includ TVA.</p>
<p>Acceptăm următoarele metode de plată:</p>
<ul>
<li>Card bancar online</li>
<li>Transfer bancar</li>
<li>Numerar la livrare</li>
</ul>

<h2>5. Livrare</h2>
<p>Livrarea se realizează prin curier rapid în toată România.</p>
<p>Termenul de livrare standard este de 24-48 ore lucrătoare de la confirmarea comenzii.</p>
<p>Pentru București oferim și opțiunea de livrare express în 1-4 ore.</p>

<h2>6. Dreptul de Retragere</h2>
<p>Conform legislației în vigoare, beneficiați de un termen de 14 zile calendaristice pentru a returna produsul.</p>
<p>Produsele personalizate nu pot fi returnate, cu excepția cazurilor de defecte de fabricație.</p>

<h2>7. Garanție</h2>
<p>Toate produsele comercializate beneficiază de garanție conform legislației în vigoare.</p>
<p>În cazul produselor defecte, acestea vor fi înlocuite sau se va returna suma plătită.</p>

<h2>8. Proprietate Intelectuală</h2>
<p>Toate elementele prezente pe site (imagini, texte, logo-uri) sunt proprietatea BlueHand Canvas și sunt protejate de legile drepturilor de autor.</p>

<h2>9. Responsabilități</h2>
<p>Ne angajăm să livrăm produse de calitate superioară și să respectăm termenii de livrare.</p>
<p>Nu suntem responsabili pentru întârzierile cauzate de compania de curierat sau de informații incorecte furnizate de client.</p>

<h2>10. Modificări ale Termenilor și Condițiilor</h2>
<p>Ne rezervăm dreptul de a modifica acești Termeni și Condiții în orice moment. Modificările vor fi publicate pe această pagină.</p>

<h2>11. Contact</h2>
<p>Pentru orice întrebări legate de Termenii și Condițiile noastre, vă rugăm să ne contactați:</p>
<ul>
<li>Email: hello@bluehand.ro</li>
<li>Telefon: +40 752 109 002</li>
<li>Adresă: Str. Bisericii, nr. 5, Movilita, Ialomita, Romania</li>
</ul>`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-[#6994FF]" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-4">Termeni și Condiții</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vă rugăm să citiți cu atenție acești termeni și condiții înainte de a plasa o comandă
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-gray max-w-none whitespace-pre-line
              prose-headings:text-gray-900 prose-headings:font-semibold
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:pt-6 prose-h2:border-t prose-h2:border-gray-200 first:prose-h2:border-0 first:prose-h2:mt-0
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
              prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6 prose-ul:mt-3
              prose-li:text-gray-700 prose-li:mb-2 prose-li:leading-relaxed
              prose-strong:text-gray-900 prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
};