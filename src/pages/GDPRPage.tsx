import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const GDPRPage: React.FC = () => {
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
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/kv/legal_pages_gdpr`,
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
      console.error('Error loading GDPR:', error);
      // Default content on error
      setDefaultContent();
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultContent = () => {
    setContent(`<h2>1. Introducere</h2>
<p>BlueHand Canvas respectă confidențialitatea datelor dumneavoastră personale și se angajează să le protejeze în conformitate cu Regulamentul General privind Protecția Datelor (GDPR) și legislația română în vigoare.</p>

<h2>2. Operatorul de Date</h2>
<p><strong>Denumire:</strong> BlueHand Canvas</p>
<p><strong>Adresă:</strong> Str. Bisericii, nr. 5, Movilita, Ialomita, Romania</p>
<p><strong>Email:</strong> hello@bluehand.ro</p>
<p><strong>Telefon:</strong> +40 752 109 002</p>

<h2>3. Ce Date Colectăm</h2>
<p>În procesul de creare a unui cont și plasare a unei comenzi, colectăm următoarele date personale:</p>
<ul>
<li>Nume și prenume</li>
<li>Adresă de email</li>
<li>Număr de telefon</li>
<li>Adresă de livrare</li>
<li>Informații despre comandă și preferințe</li>
</ul>

<h2>4. Scopul Prelucrării Datelor</h2>
<p>Datele dumneavoastră personale sunt prelucrate pentru următoarele scopuri:</p>
<ul>
<li>Procesarea și livrarea comenzilor</li>
<li>Comunicare referitoare la comenzi și produse</li>
<li>Îmbunătățirea serviciilor noastre</li>
<li>Marketing (doar cu acordul dumneavoastră explicit)</li>
<li>Respectarea obligațiilor legale</li>
</ul>

<h2>5. Temeiul Legal</h2>
<p>Prelucrarea datelor dumneavoastră se bazează pe:</p>
<ul>
<li>Executarea contractului de vânzare-cumpărare</li>
<li>Consimțământul dumneavoastră</li>
<li>Interesul legitim al operatorului</li>
<li>Obligații legale</li>
</ul>

<h2>6. Durata Stocării Datelor</h2>
<p>Datele personale sunt păstrate pentru perioada necesară îndeplinirii scopurilor pentru care au fost colectate sau conform cerințelor legale:</p>
<ul>
<li>Date comenzi: 5 ani (conform legislației fiscale)</li>
<li>Date cont client: până la ștergerea contului</li>
<li>Date marketing: până la retragerea consimțământului</li>
</ul>

<h2>7. Drepturile Dumneavoastră</h2>
<p>Conform GDPR, beneficiați de următoarele drepturi:</p>
<ul>
<li><strong>Dreptul de acces:</strong> Puteți solicita o copie a datelor personale pe care le deținem despre dumneavoastră</li>
<li><strong>Dreptul la rectificare:</strong> Puteți solicita corectarea datelor inexacte</li>
<li><strong>Dreptul la ștergere:</strong> Puteți solicita ștergerea datelor în anumite condiții</li>
<li><strong>Dreptul la restricționare:</strong> Puteți solicita restricționarea prelucrării</li>
<li><strong>Dreptul la portabilitate:</strong> Puteți solicita transferul datelor către alt operator</li>
<li><strong>Dreptul la opoziție:</strong> Puteți vă opune prelucrării datelor în anumite situații</li>
<li><strong>Dreptul de a depune o plângere:</strong> Puteți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</li>
</ul>

<h2>8. Securitatea Datelor</h2>
<p>Implementăm măsuri tehnice și organizatorice adecvate pentru a proteja datele dumneavoastră împotriva accesului neautorizat, pierderii sau distrugerii:</p>
<ul>
<li>Criptare SSL pentru transmiterea datelor</li>
<li>Acces restricționat la datele personale</li>
<li>Monitorizare și backup regulat</li>
<li>Formare periodică a personalului privind protecția datelor</li>
</ul>

<h2>9. Partajarea Datelor</h2>
<p>Nu vindem și nu închiriem datele dumneavoastră personale către terți. Datele pot fi partajate doar cu:</p>
<ul>
<li>Companii de curierat pentru livrarea comenzilor</li>
<li>Procesatori de plăți pentru tranzacții online</li>
<li>Autorități competente, când legea o impune</li>
</ul>

<h2>10. Cookie-uri</h2>
<p>Site-ul nostru utilizează cookie-uri pentru a îmbunătăți experiența de navigare. Puteți gestiona preferințele de cookie-uri din setările browser-ului.</p>

<h2>11. Modificări ale Politicii de Confidențialitate</h2>
<p>Ne rezervăm dreptul de a actualiza această politică. Versiunea actualizată va fi publicată pe această pagină cu data ultimei modificări.</p>

<h2>12. Contact pentru Protecția Datelor</h2>
<p>Pentru orice întrebări legate de prelucrarea datelor personale sau pentru exercitarea drepturilor GDPR, ne puteți contacta:</p>
<ul>
<li><strong>Email:</strong> hello@bluehand.ro</li>
<li><strong>Telefon:</strong> +40 752 109 002</li>
<li><strong>Adresă:</strong> Str. Bisericii, nr. 5, Movilita, Ialomita, Romania</li>
</ul>

<p><em>Data ultimei actualizări: Ianuarie 2024</em></p>`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-[#6994FF]" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-4">Politica de Confidențialitate GDPR</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aflați cum protejăm și gestionăm datele dumneavoastră personale
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
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-em:text-gray-600"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
};