// Romanian Counties (Județe) and Cities (Orașe)

export interface County {
  code: string;
  name: string;
  cities: string[];
}

export const romanianCounties: County[] = [
  {
    code: 'AB',
    name: 'Alba',
    cities: ['Alba Iulia', 'Aiud', 'Blaj', 'Sebeș', 'Cugir', 'Ocna Mureș', 'Abrud', 'Câmpeni', 'Zlatna', 'Teliucu Inferior', 'Baia de Arieș', 'Berghin', 'Bucium', 'Ciugud', 'Cricău', 'Galda de Jos', 'Jidvei', 'Livezile', 'Lopadea Nouă', 'Lupșa', 'Meteș', 'Mihalț', 'Mirăslău', 'Noșlac', 'Ocoliș', 'Pianu', 'Ponor', 'Rădeți', 'Roșia Montană', 'Sălciua', 'Sântimbru', 'Șona', 'Șpring', 'Stremț', 'Sugag', 'Unirea', 'Vadu Moților', 'Vinerea', 'Vințu de Jos']
  },
  {
    code: 'AR',
    name: 'Arad',
    cities: ['Arad', 'Chișineu-Criș', 'Ineu', 'Lipova', 'Nădlac', 'Pâncota', 'Pecica', 'Sântana', 'Curtici', 'Sebiș', 'Apateu', 'Beliu', 'Bârzava', 'Birchis', 'Buteni', 'Conop', 'Craiva', 'Dezna', 'Dieci', 'Felnac', 'Ghioroc', 'Gurahonț', 'Hălmagiu', 'Hășmaș', 'Ignești', 'Livada', 'Macea', 'Mișca', 'Olari', 'Pilu', 'Săvârșin', 'Sebis', 'Secusigiu', 'Șeitin', 'Șicula', 'Șilindia', 'Șimand', 'Șofronea', 'Tauț', 'Târnova', 'Ususau', 'Vărădia de Mureș', 'Vinga', 'Vladimirescu', 'Zerind', 'Zimandu Nou']
  },
  {
    code: 'AG',
    name: 'Argeș',
    cities: ['Pitești', 'Câmpulung', 'Curtea de Argeș', 'Mioveni', 'Costești', 'Ștefănești', 'Topoloveni', 'Albota', 'Aninoasa', 'Arefu', 'Băbana', 'Bălilești', 'Bascov', 'Berevoești', 'Boțești', 'Brăduleț', 'Budeasa', 'Bughea de Jos', 'Bughea de Sus', 'Bunești', 'Buzoești', 'Căldăraru', 'Călinești', 'Catanele', 'Cepari', 'Cetățeni', 'Cicănești', 'Ciofringeni', 'Cocu', 'Corbeni', 'Corbi', 'Cotmeana', 'Dâmbovicioara', 'Davidești', 'Domvești', 'Dragoslavele', 'Godeni', 'Hârtiești', 'Izvoru', 'Lerești', 'Lunca Corbului', 'Mălureni', 'Merișani', 'Micești', 'Mihăești', 'Mioarele', 'Mozăceni', 'Muşătești', 'Negrași', 'Nucșoara', 'Oarja', 'Pietrosani', 'Poiana Lacului', 'Popești', 'Priboieni', 'Râca', 'Rătești', 'Recea', 'Rociu', 'Sălătrucu', 'Schitu Golești', 'Stolnici', 'Șuici', 'Tigveni', 'Uda', 'Ungheni', 'Valea Danului', 'Valea Iașului', 'Valea Mare Pravăț', 'Vedea', 'Vlădești', 'Vulturești']
  },
  {
    code: 'BC',
    name: 'Bacău',
    cities: ['Bacău', 'Onești', 'Moinești', 'Comănești', 'Buhuși', 'Târgu Ocna', 'Dărmănești', 'Slănic-Moldova', 'Adjud', 'Asău', 'Berești-Bistrița', 'Berzunți', 'Blagești', 'Brusturoasa', 'Căiuți', 'Cleja', 'Corbasca', 'Coțofănești', 'Dărmănești', 'Dealu Morii', 'Faraoani', 'Filipeni', 'Filipești', 'Gârleni', 'Ghimeș-Făget', 'Gioseni', 'Helegiu', 'Hemeiuș', 'Horești', 'Huruiești', 'Izvoru Berheciului', 'Letea Veche', 'Lipova', 'Livezi', 'Luizi-Călugăra', 'Măgirești', 'Măgura', 'Mănăstirea Cașin', 'Motoșeni', 'Nicolae Bălcescu', 'Odobasca', 'Palanca', 'Pâncești', 'Parincea', 'Pârjol', 'Podu Turcului', 'Răcăciuni', 'Râmnicu Sărat', 'Roșiori', 'Săucești', 'Scorțeni', 'Secuieni', 'Ștefan cel Mare', 'Stănișești', 'Șoldănești', 'Tamași', 'Târgu Trotuș', 'Tătărăști', 'Traian', 'Ungureni', 'Urechești', 'Valea Seacă', 'Vultureni', 'Zemeș']
  },
  {
    code: 'BH',
    name: 'Bihor',
    cities: ['Oradea', 'Salonta', 'Beiuș', 'Marghita', 'Aleșd', 'Nucet', 'Săcueni', 'Ștei', 'Vașcău', 'Abram', 'Abrămuț', 'Aștileu', 'Astăzi', 'Balc', 'Biharia', 'Boianu Mare', 'Borod', 'Borș', 'Bratca', 'Brusturi', 'Budureasa', 'Bulz', 'Buduslău', 'Căbeşti', 'Cărpinet', 'Căuaș', 'Ceica', 'Cetariu', 'Cherechiu', 'Chișlaz', 'Ciuhoi', 'Ciumeghiu', 'Cociuba Mare', 'Copacel', 'Criștioru de Jos', 'Curăţele', 'Curtuișeni', 'Derna', 'Diosig', 'Dobrești', 'Drăgănești', 'Drăgești', 'Finiș', 'Gepiu', 'Girișu de Criș', 'Hidișelu de Sus', 'Holod', 'Husasău de Tinca', 'Ineu', 'Lazuri de Beiuș', 'Lunca', 'Mădăras', 'Nojorid', 'Olcea', 'Oșorhei', 'Paleu', 'Pietroasa', 'Pocola', 'Pomezeu', 'Popești', 'Răbăgani', 'Remetea', 'Rieni', 'Roșia', 'Sălard', 'Sâmbăta', 'Sânmartin', 'Sântandrei', 'Șoimi', 'Spinus', 'Suplacu de Barcău', 'Șuncuiuș', 'Tarcea', 'Tărcaia', 'Tileagd', 'Tinca', 'Tăuteu', 'Tulca', 'Uileacu de Beiuș', 'Vârciorog', 'Viișoara', 'Vâncani']
  },
  {
    code: 'BN',
    name: 'Bistrița-Năsăud',
    cities: ['Bistrița', 'Beclean', 'Năsăud', 'Sângeorz-Băi', 'Aluniș', 'Beclean', 'Bistrita Bârgăului', 'Branistea', 'Budești', 'Caianu Mic', 'Căianu Mic', 'Cășeiu', 'Cetate', 'Chiochiș', 'Ciceu-Giurgești', 'Ciceu-Mihăiești', 'Coșbuc', 'Dumitra', 'Dumitrița', 'Feldru', 'Găești', 'Ilva Mare', 'Ilva Mică', 'Josenii Bârgăului', 'Lechința', 'Leșu', 'Livezile', 'Lunca Ilvei', 'Măgura Ilvei', 'Maieru', 'Măriș', 'Măriselu', 'Micăsasa', 'Miceștii de Câmpie', 'Milaș', 'Monor', 'Năsăud', 'Negrilești', 'Nimigea', 'Nuşeni', 'Parva', 'Petru Rareș', 'Prundu Bârgăului', 'Rebra', 'Rebrișoara', 'Rodna', 'Romuli', 'Salva', 'Sant', 'Șanț', 'Șieu', 'Șieu-Măgheruș', 'Șieu-Odorhei', 'Șintereag', 'Spermezeu', 'Ștefan cel Mare', 'Șieuț', 'Teaca', 'Telciu', 'Tiha Bârgăului', 'Țărmure', 'Urisor', 'Urmeniș', 'Viile Tecii']
  },
  {
    code: 'BT',
    name: 'Botoșani',
    cities: ['Botoșani', 'Dorohoi', 'Darabani', 'Flămânzi', 'Săveni', 'Bucecea', 'Adășeni', 'Albești', 'Avrămeni', 'Băluseni', 'Bălușeni', 'Blândești', 'Bodeşti', 'Brăești', 'Broscăuți', 'Brusturi', 'Bucecea', 'Budești', 'Buhăceni', 'Cândești', 'Cârja', 'Călinești', 'Cătămărești-Deal', 'Concești', 'Copălău', 'Corlăteni', 'Corni', 'Coșula', 'Cotușca', 'Cristești', 'Cristinești', 'Curtești', 'Dăngeni', 'Dersca', 'Dimăcheni', 'Dobârceni', 'Dorohoi', 'Drăgușeni', 'Dumeni', 'Durnești', 'Frumușica', 'George Enescu', 'Gorbănești', 'Hănești', 'Havârna', 'Hilișeu-Horia', 'Hlipiceni', 'Hudești', 'Icușești', 'Liveni', 'Mănăstirea Doamnei', 'Manoleasa', 'Mihăileni', 'Mihai Eminescu', 'Mitoc', 'Moara Jorii', 'Nicseni', 'Paltinu', 'Plugari', 'Podolea', 'Pomârla', 'Rădăuți-Prut', 'Răuseni', 'Rechințeni', 'Ripiceni', 'Roma', 'Românești', 'Santa Mare', 'Șendriceni', 'Ștefănești', 'Suharău', 'Suliţa', 'Todireni', 'Trușești', 'Tudor Vladimirescu', 'Ungureni', 'Unteni', 'Văculeşti', 'Vânători', 'Vlăsinești', 'Vorniceni', 'Vorona', 'Zahorna']
  },
  {
    code: 'BV',
    name: 'Brașov',
    cities: ['Brașov', 'Codlea', 'Făgăraș', 'Săcele', 'Râșnov', 'Zărnești', 'Predeal', 'Ghimbav', 'Rupea', 'Victoria', 'Apața', 'Augustin', 'Beclean', 'Bod', 'Bran', 'Budila', 'Bunești', 'Căpâlnița', 'Cața', 'Cincu', 'Cobor', 'Comăna', 'Cristian', 'Crizbav', 'Dacia', 'Dăișoara', 'Drăguș', 'Dumbrăviţa', 'Feldioara', 'Fundata', 'Hălchiu', 'Hărman', 'Hârseni', 'Hoghiz', 'Holbav', 'Homorod', 'Iarăș', 'Întorsura Buzăului', 'Jibert', 'Lisa', 'Ludus', 'Măieruș', 'Mândra', 'Moieciu', 'Ormeniș', 'Parâng', 'Perșani', 'Poiana Mărului', 'Prejmer', 'Racoș', 'Recea', 'Sânpetru', 'Sâmbăta de Sus', 'Șercaia', 'Șinca', 'Șinca Nouă', 'Șoarș', 'Șona', 'Sohodol', 'Tărlungeni', 'Teliu', 'Ticușu', 'Tohanu Nou', 'Tușnad', 'Ucea', 'Ungra', 'Vama Buzăului', 'Vârghiș', 'Viștea', 'Vistișoara', 'Voila', 'Voivodeni', 'Vulcan']
  },
  {
    code: 'BR',
    name: 'Brăila',
    cities: ['Brăila', 'Făurei', 'Ianca', 'Însurăței', 'Bărăganul', 'Berteștii de Jos', 'Bordei Verde', 'Cazasu', 'Chiscani', 'Ciocile', 'Cireșu', 'Dudești', 'Frecăței', 'Gemenele', 'Gropeni', 'Grădiștea', 'Jirlău', 'Măxineni', 'Maraloiu', 'Mircea Vodă', 'Măraşu', 'Movila Miresii', 'Racovița', 'Roșiori', 'Salcia Tudor', 'Scorțaru Nou', 'Siliştea', 'Stăncuța', 'Suțesti', 'Surdila-Greci', 'Surdila-Găiseanca', 'Șuțești', 'Tichilești', 'Traian', 'Tudor Vladimirescu', 'Tufești', 'Ulmu', 'Unirea', 'Valea Cânepii', 'Vădeni', 'Victoria', 'Vișani', 'Viziru', 'Zavoaia']
  },
  {
    code: 'BZ',
    name: 'Buzău',
    cities: ['Buzău', 'Râmnicu Sărat', 'Nehoiu', 'Pogoanele', 'Pătârlagele', 'Amaru', 'Balta Albă', 'Beceni', 'Bisoca', 'Blăjani', 'Boldu', 'Bozioru', 'Brădeanu', 'Brăești', 'Breaza', 'Buda', 'C.A. Rosetti', 'Calvini', 'Căneşti', 'Cândeşti', 'Cătina', 'Cernatesti', 'Chiliile', 'Chiojdu', 'Cilibia', 'Cislău', 'Cochirleanca', 'Colțea', 'Costești', 'Cozieni', 'Galbinași', 'Gherăseni', 'Glodeanu Sărat', 'Glodeanu-Siliștea', 'Gopan', 'Grebănu', 'Largu', 'Lopătari', 'Luciu', 'Măgura', 'Mânzălești', 'Mărăcineni', 'Merei', 'Mlăjet', 'Murgeşti', 'Năeni', 'Odăile', 'Padina', 'Pardoși', 'Pârscov', 'Pietroasele', 'Podgoria', 'Poșta Câlnău', 'Puiești', 'Racovițeni', 'Rîmnicelu', 'Robeasca', 'Rusetu', 'Săgeata', 'Săhăteni', 'Sărulești', 'Smeeni', 'Stalpu', 'Ștefan cel Mare', 'Țintești', 'Topliceni', 'Ulmeni', 'Unguriu', 'Valea Ramnicului', 'Valea Salciei', 'Vernești', 'Vipereşti', 'Vintilă Vodă', 'Zărnești', 'Ziduri']
  },
  {
    code: 'CS',
    name: 'Caraș-Severin',
    cities: ['Reșița', 'Caransebeș', 'Bocșa', 'Moldova Nouă', 'Oravița', 'Anina', 'Băile Herculane', 'Oțelu Roșu', 'Armeniș', 'Bănia', 'Băuțar', 'Berliște', 'Berliste', 'Berzasca', 'Berzovia', 'Bolvaşniţa', 'Brebu', 'Brebu Nou', 'Buchin', 'Bucoșnița', 'Cărbunari', 'Cărbunari', 'Căvăran', 'Ciclova Română', 'Ciuchici', 'Comorâște', 'Constantin Daicoviciu', 'Copăcele', 'Coronini', 'Cornereva', 'Cornuțel', 'Dalboșeț', 'Doclin', 'Dognecea', 'Domașnea', 'Eftimie Murgu', 'Ezeris', 'Fârliug', 'Forotic', 'Gărâna', 'Glimboca', 'Goruia', 'Iablaniţa', 'Lăpușnicel', 'Luncaviţa', 'Lupac', 'Măureni', 'Mehadia', 'Mehadica', 'Mercina', 'Naidăș', 'Obreja', 'Ocna de Fier', 'Paltinis', 'Păltiniș', 'Pojejena', 'Prigor', 'Răcășdia', 'Ramna', 'Rusca Montană', 'Săcărâmb', 'Sacu', 'Sasca Montană', 'Sichevița', 'Slatina-Timiş', 'Socol', 'Sopotu Nou', 'Teregova', 'Ticvaniu Mare', 'Toplet', 'Turnu Rueni', 'Văliug', 'Vărădia', 'Vermeș', 'Vrani', 'Zavoi', 'Zăvoi']
  },
  {
    code: 'CL',
    name: 'Călărași',
    cities: ['Călărași', 'Oltenița', 'Lehliu Gară', 'Budești', 'Fundulea', 'Belciugatele', 'Borcea', 'Căscioarele', 'Chirnogi', 'Chiselet', 'Ciocanești', 'Ciocănești', 'Cornești', 'Curcani', 'Cuza Vodă', 'Dichiseni', 'Dor Mărunt', 'Dorobanțu', 'Dragalina', 'Dragos Vodă', 'Frasinet', 'Frăsinet', 'Fundeni', 'Gâldău', 'Grădiștea', 'Gurbănești', 'Ileana', 'Independența', 'Jegălia', 'Lehliu', 'Luica', 'Lupsanu', 'Mânăstirea', 'Mitreni', 'Modelu', 'Nana', 'Nicolae Bălcescu', 'Perișoru', 'Perisoru', 'Plătărești', 'Radovanu', 'Roseți', 'Sărulești', 'Sohatu', 'Spanțov', 'Ștefan cel Mare', 'Ștefan Vodă', 'Tamadău Mare', 'Ulmeni', 'Ulmu', 'Unirea', 'Vasilaţi', 'Valea Argovei', 'Vâlcelele', 'Vlad Țepeș']
  },
  {
    code: 'CJ',
    name: 'Cluj',
    cities: ['Cluj-Napoca', 'Turda', 'Dej', 'Câmpia Turzii', 'Gherla', 'Huedin', 'Aghireșu', 'Aiton', 'Apahida', 'Aschileu', 'Baciu', 'Băișoara', 'Beliș', 'Bobâlna', 'Borșa', 'Buza', 'Caianu', 'Căianu', 'Călățele', 'Călăreşti', 'Calarasi', 'Căpușu Mare', 'Cătina', 'Ceanu Mare', 'Chinteni', 'Chiuiești', 'Ciucea', 'Ciurila', 'Cojocna', 'Corunca', 'Cuzdrioara', 'Dabâca', 'Dăbâca', 'Feleacu', 'Fizeșu Gherlii', 'Florești', 'Frata', 'Gârbău', 'Geaca', 'Gilău', 'Iara', 'Iclod', 'Jucu', 'Luna', 'Lăpușţel', 'Mănăstireni', 'Mărgău', 'Mărișel', 'Mihai Viteazu', 'Mintiu Gherlii', 'Mociu', 'Moldovenești', 'Mica', 'Negreni', 'Palatca', 'Panticeu', 'Petreștii de Jos', 'Ploscoș', 'Poieni', 'Recea-Cristur', 'Răscruci', 'Răsca', 'Răstolița', 'Sâncraiu', 'Sânmartin', 'Sânpaul', 'Săvădisla', 'Suatu', 'Tritenii de Jos', 'Tureni', 'Unguraș', 'Valea Ierii', 'Vad', 'Vultureni']
  },
  {
    code: 'CT',
    name: 'Constanța',
    cities: ['Constanța', 'Mangalia', 'Medgidia', 'Năvodari', 'Cernavodă', 'Eforie', 'Murfatlar', 'Techirghiol', 'Băneasa', 'Hârșova', 'Negru Vodă', 'Ovidiu', '23 August', 'Adamclisi', 'Agigea', 'Albeşti', 'Amzacea', 'Castelu', 'Cerchezu', 'Chirnogeni', 'Ciobanu', 'Ciocarlia', 'Cobadin', 'Cogealac', 'Comana', 'Constanța', 'Corbu', 'Costinești', 'Crucea', 'Cumpăna', 'Cuza Vodă', 'Deleni', 'Dobromir', 'Dorobanţu', 'Dumbrăveni', 'Dunăvățu de Jos', 'Fântânele', 'Gârliciu', 'General Scărișoreanu', 'Ghindărești', 'Grădina', 'Horia', 'Independenţa', 'Ion Corvin', 'Istria', 'Limanu', 'Lipnița', 'Lumina', 'Măcin', 'Mereni', 'Mihai Viteazu', 'Mihail Kogălniceanu', 'Mircea Vodă', 'Neptun', 'Nicolae Bălcescu', 'Oltina', 'Ostrov', 'Pantelimon', 'Pecineaga', 'Peştera', 'Poarta Albă', 'Cobadin', 'Rasova', 'Săcele', 'Saligny', 'Săcele', 'Seimeni', 'Sibioara', 'Șipote', 'Spanțov', 'Stejaru', 'Stupina', 'Târgușor', 'Topraisar', 'Topalu', 'Tortoman', 'Tuzla', 'Vadu', 'Valea Dacilor', 'Valu lui Traian', 'Vânători', 'Vulturu']
  },
  {
    code: 'CV',
    name: 'Covasna',
    cities: ['Sfântu Gheorghe', 'Târgu Secuiesc', 'Covasna', 'Baraolt', 'Întorsura Buzăului', 'Aita Mare', 'Barcani', 'Bățani', 'Belin', 'Bodoc', 'Boroșneu Mare', 'Bradățel', 'Brețcu', 'Catalina', 'Cernat', 'Chichis', 'Comandău', 'Dobârlău', 'Estelnic', 'Ghelința', 'Ghidfalău', 'Hăghig', 'Ilieni', 'Lemnia', 'Malnaș', 'Mălnaș-Băi', 'Mereni', 'Micfalău', 'Ojdula', 'Ozun', 'Poian', 'Reci', 'Sânzieni', 'Sita Buzăului', 'Turia', 'Vâlcele', 'Vârghiș', 'Zabala', 'Zagon']
  },
  {
    code: 'DB',
    name: 'Dâmbovița',
    cities: ['Târgoviște', 'Moreni', 'Pucioasa', 'Găești', 'Titu', 'Fieni', 'Răcari', 'Aninoasa', 'Băleni', 'Barbuletu', 'Bezdead', 'Bilciurești', 'Brănești', 'Brezoaele', 'Buciumeni', 'Bucșani', 'Butimanu', 'Cândeşti', 'Cândeşti-Vale', 'Căprioru', 'Cățelu', 'Ciocanesti', 'Ciocănești', 'Cobia', 'Comișani', 'Conțești', 'Corbii Mari', 'Cornățelu', 'Coșereni', 'Crangurile', 'Crâmpoia', 'Crevedia Mare', 'Dăești', 'Davidești', 'Doicești', 'Dragodana', 'Dragomirești', 'Dragomirești-Vale', 'Fieni', 'Gărliniu', 'Gheboieni', 'Ghergani', 'Glodeni', 'Gura Ocniței', 'Gura Șuții', 'Hălchiu', 'Hulubești', 'I.L. Caragiale', 'Iedera de Jos', 'Izvoare', 'Ludești', 'Lungulețu', 'Malu cu Flori', 'Mănești', 'Morteni', 'Mogoșani', 'Motăieni', 'Niculești', 'Nucet', 'Ocniţa', 'Odobeşti', 'Olteni', 'Perșinari', 'Petrești', 'Petru Rareş', 'Pietrari', 'Pietroșița', 'Pitaru', 'Poiana', 'Polovragi', 'Potlogi', 'Produlești', 'Răcari', 'Răzvad', 'Runcu', 'Salcia', 'Săcueni', 'Șelaru', 'Șotânga', 'Slobozia Moară', 'Șotânga', 'Svilengrad', 'Șuța Seacă', 'Tartasesti', 'Tărtășești', 'Tătărași', 'Ulmi', 'Uliești', 'Ungureni', 'Văleni-Dâmbovița', 'Valea Lungă', 'Valea Mare', 'Vacaresti', 'Văcărești', 'Viforâta', 'Viișoara', 'Visina', 'Vlădeni', 'Voinesti', 'Voinești', 'Vârfuri', 'Vulcana-Băi', 'Vulcana-Pandele']
  },
  {
    code: 'DJ',
    name: 'Dolj',
    cities: ['Craiova', 'Băilești', 'Calafat', 'Bechet', 'Dăbuleni', 'Filiași', 'Segarcea', 'Almăj', 'Apele Vii', 'Argetoaia', 'Băilești', 'Bârca', 'Braloștița', 'Brădești', 'Breasta', 'Bucovăț', 'Bulzești', 'Burila Mare', 'Calopăr', 'Cârcea', 'Cârna', 'Căpreni', 'Caraula', 'Celaru', 'Cerăt', 'Cernăteşti', 'Cetate', 'Cioroiași', 'Ciupercenii Noi', 'Coșoveni', 'Crăsovița', 'Daneți', 'Desa', 'Dobrescu', 'Drănic', 'Filiași', 'Gângiova', 'Ghercești', 'Ghindeni', 'Giubega', 'Goești', 'Gogoșu', 'Găneasa', 'Întorsura', 'Işalnița', 'Leu', 'Lipovu', 'Maglavit', 'Malu Mare', 'Melinești', 'Mischii', 'Mișchii', 'Moțăței', 'Murgași', 'Negoi', 'Orodel', 'Ostroveni', 'Perișor', 'Periș', 'Pielești', 'Plenița', 'Pleniţa', 'Podari', 'Poiana Mare', 'Predești', 'Radovan', 'Rast', 'Robanesti', 'Robănești', 'Sadova', 'Săceni', 'Sălcuța', 'Scăești', 'Secu', 'Simnicu de Sus', 'Șimnicu de Sus', 'Teasc', 'Terpezița', 'Teslui', 'Țuglui', 'Unirea', 'Urzicuța', 'Vârvoru de Jos', 'Verbița', 'Vârtop']
  },
  {
    code: 'GL',
    name: 'Galați',
    cities: ['Galați', 'Tecuci', 'Târgu Bujor', 'Berești', 'Baleni', 'Băneasa', 'Bălăbănești', 'Bălășești', 'Barcea', 'Berești-Meria', 'Băleni', 'Braniștea', 'Brăhășești', 'Buciumeni', 'Cavadinești', 'Certești', 'Corod', 'Corni', 'Cosmești', 'Costache Negri', 'Corod', 'Cuca', 'Cudalbi', 'Cuza Vodă', 'Drăgănești', 'Drăgușeni', 'Fârțănești', 'Foltești', 'Focuri', 'Frăsuleni', 'Fundeni', 'Frumusița', 'Gălbinași', 'Ghidigeni', 'Gohor', 'Griviţa', 'Independența', 'Jorăști', 'Liești', 'Măstăcani', 'Movileni', 'Munteni', 'Nămoloasa', 'Negrilești', 'Nicorești', 'Oancea', 'Pechea', 'Piscu', 'Poiana', 'Priponești', 'Rediu', 'Scânteiești', 'Schela', 'Sendreni', 'Slobozia Conachi', 'Smârdan', 'Smulti', 'Șendreni', 'Stoicani', 'Șivița', 'Suceveni', 'Tecuci', 'Ţepu', 'Tudor Vladimirescu', 'Tuluceşti', 'Umbraresti', 'Umbrărești', 'Valea Mărului', 'Vânători', 'Vărlezi', 'Vădeni', 'Varlezi', 'Victoria', 'Vii', 'Vinderei', 'Vlădești']
  },
  {
    code: 'GR',
    name: 'Giurgiu',
    cities: ['Giurgiu', 'Bolintin-Vale', 'Mihăilești', 'Adunaţii-Copăceni', 'Baneasa', 'Băneasa', 'Bolintin Deal', 'Bucsani', 'Buturugeni', 'Călugăreni', 'Clejani', 'Colibași', 'Comana', 'Cosoba', 'Crevedia Mică', 'Daia', 'Floreşti-Stoeneşti', 'Frăteşti', 'Gaiseni', 'Găiseni', 'Ghimpați', 'Gostinari', 'Gostinu', 'Grădinari', 'Gradinari', 'Greaca', 'Gogoșari', 'Herăști', 'Hotarele', 'Iepurești', 'Isvoarele', 'Izvoarele', 'Joiţa', 'Letca Nouă', 'Malu', 'Mârșa', 'Mihai Bravu', 'Oinacu', 'Ogrezeni', 'Prundu', 'Putineiu', 'Rasuceni', 'Roata de Jos', 'Răsuceni', 'Sabareni', 'Săbăreni', 'Schitu', 'Singureni', 'Singureni', 'Slobozia', 'Stănești', 'Stanesti', 'Stoeneşti', 'Toporu', 'Ulmi', 'Valea Dragului', 'Vânătorii Mici', 'Vedea']
  },
  {
    code: 'GJ',
    name: 'Gorj',
    cities: ['Târgu Jiu', 'Motru', 'Rovinari', 'Bumbești-Jiu', 'Novaci', 'Târgu Cărbunești', 'Tismana', 'Țicleni', 'Albeni', 'Alimpești', 'Aninoasa', 'Arcani', 'Baia de Fier', 'Balani', 'Băleşti', 'Bengești-Ciocadia', 'Bâlteni', 'Bolboși', 'Borăscu', 'Brănești', 'Bustuchin', 'Căpreni', 'Câlnic', 'Cătunele', 'Ciuperceni', 'Crasna', 'Crușeț', 'Dănciulești', 'Dănești', 'Dragotești', 'Drăgutești', 'Fărcășești', 'Glogova', 'Godineşti', 'Hurezani', 'Ionești', 'Jupânești', 'Licurici', 'Logreşti', 'Mătăsari', 'Negomir', 'Padeș', 'Peștișani', 'Plopsoru', 'Polovragi', 'Prigoria', 'Runcu', 'Samarinești', 'Săcelu', 'Săulești', 'Schela', 'Scoarța', 'Slivileşti', 'Stanești', 'Stejari', 'Stoina', 'Telești', 'Țânțăreni', 'Țicleni', 'Turburea', 'Turcinești', 'Urdari', 'Vladimir', 'Văgiuleşti']
  },
  {
    code: 'HR',
    name: 'Harghita',
    cities: ['Miercurea Ciuc', 'Odorheiu Secuiesc', 'Gheorgheni', 'Toplița', 'Băile Tușnad', 'Bălan', 'Borsec', 'Cristuru Secuiesc', 'Vlăhița', 'Atid', 'Avramești', 'Bilbor', 'Brăduț', 'Căpâlniţa', 'Cârţa', 'Cehetel', 'Ciceu', 'Ciucsângeorgiu', 'Ciumani', 'Corbu', 'Corund', 'Cozmeni', 'Dănești', 'Dealu', 'Dârjiu', 'Ditrău', 'Feliceni', 'Frumoasa', 'Gălăuțaș', 'Joseni', 'Lăzarea', 'Leliceni', 'Lupeni', 'Lunca de Jos', 'Lunca de Sus', 'Mădăraș', 'Mărtiniș', 'Mihăileni', 'Mugeni', 'Ocland', 'Păuleni-Ciuc', 'Plăieșii de Jos', 'Praid', 'Racu', 'Remetea', 'Sânsimion', 'Sâncrăieni', 'Sândominic', 'Sărmaș', 'Săcel', 'Secuieni', 'Simonești', 'Șimonești', 'Siculeni', 'Subcetate', 'Suseni', 'Tomeşti', 'Tulghes', 'Tulgheș', 'Tuşnad', 'Zetea', 'Voșlăbeni']
  },
  {
    code: 'HD',
    name: 'Hunedoara',
    cities: ['Deva', 'Hunedoara', 'Petroșani', 'Lupeni', 'Vulcan', 'Orăștie', 'Brad', 'Simeria', 'Petrila', 'Aninoasa', 'Călan', 'Geoagiu', 'Hațeg', 'Uricani', 'Aninoasa', 'Aurel Vlaicu', 'Băcia', 'Baia de Criș', 'Băița', 'Balşa', 'Băniţa', 'Baru', 'Batrana', 'Beriu', 'Blăjeni', 'Bosorod', 'Bretea Română', 'Buceș', 'Bulzeștii de Sus', 'Bunila', 'Burjuc', 'Cârjiți', 'Câlnic', 'Cărpiniş', 'Crișcior', 'Densuș', 'Dobra', 'General Berthelot', 'Ghelari', 'Gurasada', 'Hărău', 'Ilia', 'Bănița', 'Lăpugiu de Jos', 'Lelese', 'Lunca Cernii de Jos', 'Luncoiu de Jos', 'Mărtineşti', 'Mărtineşti', 'Orăștioara de Sus', 'Pestisu Mic', 'Peștișu Mic', 'Pui', 'Rapoltu Mare', 'Râu de Mori', 'Ribița', 'Răchițelu', 'Răchitova', 'Romos', 'Sălașu de Sus', 'Sântămăria-Orlea', 'Sălaşu de Sus', 'Sarmizegetusa', 'Sarmizegetusa', 'Sohodol', 'Șoimuș', 'Tămaşasa', 'Teliucu Inferior', 'Tomești', 'Toteşti', 'Toplița', 'Turdaș', 'Ulieș', 'Vața de Jos', 'Veţel', 'Vălișoara', 'Vorța', 'Zam']
  },
  {
    code: 'IL',
    name: 'Ialomița',
    cities: ['Slobozia', 'Fetești', 'Urziceni', 'Țăndărei', 'Fierbinți-Târg', 'Amara', 'Căzănești', 'Alexeni', 'Andrasesti', 'Andrășești', 'Armășești', 'Axintele', 'Balaciu', 'Bărbulești', 'Bărcănești', 'Bordușani', 'Borănești', 'Boranesti', 'Bucu', 'Ciochina', 'Ciulniţa', 'Ciulnița', 'Cocora', 'Coșereni', 'Colelia', 'Cosâmbești', 'Drăgoești', 'Dridu', 'Facaeni', 'Făcăieni', 'Gheorghe Doja', 'Gheorghe Lazăr', 'Gârbovi', 'Grindu', 'Grivița', 'Gura Ialomitei', 'Ion Roată', 'Jilavele', 'Maia', 'Mănăstirea', 'Marculesti', 'Mihail Kogalniceanu', 'Miloșești', 'Movilita', 'Movila', 'Moviliţa', 'Munteni-Buzău', 'Ograda', 'Perieti', 'Perieți', 'Platonești', 'Reviga', 'Roșiori', 'Salcia', 'Sărățeni', 'Săveni', 'Scânteia', 'Sinești', 'Sfântu Gheorghe', 'Stelnica', 'Suditi', 'Sudiți', 'Traian', 'Valea Ciorii', 'Valea Măcrișului', 'Vlădeni']
  },
  {
    code: 'IS',
    name: 'Iași',
    cities: ['Iași', 'Pașcani', 'Târgu Frumos', 'Hârlău', 'Podu Iloaiei', 'Andrieşeşti', 'Andrieșești', 'Aroneanu', 'Baltati', 'Bălțați', 'Bârnova', 'Belceşti', 'Belcești', 'Bivolari', 'Brăești', 'Buhalnița', 'Butea', 'Cepleniţa', 'Cepleniţa', 'Chicerea', 'Ciortești', 'Ciurea', 'Coarnele Caprei', 'Comarna', 'Coșuleni', 'Cotnari', 'Costuleni', 'Cozmeşti', 'Cristești', 'Cucuteni', 'Dagâța', 'Deleni', 'Dobrovăț', 'Dolhești', 'Drăgușeni', 'Dumeşti', 'Erbiceni', 'Fântânele', 'Focuri', 'Golia', 'Golăiești', 'Golaești', 'Gorban', 'Grajduri', 'Gropnița', 'Grozeşti', 'Hălăucești', 'Heleșteni', 'Holboca', 'Horleşti', 'Horlesti', 'Ipatele', 'Ion Neculce', 'Lespezi', 'Letcani', 'Lețcani', 'Lungani', 'Mădârjac', 'Mircești', 'Mirceşti', 'Miroslava', 'Miroslăvești', 'Mogoșești', 'Mogoșești-Siret', 'Moşna', 'Movileni', 'Oțeleni', 'Plugari', 'Poeni', 'Popeşti', 'Popești', 'Popricani', 'Prisăcani', 'Probota', 'Răchiteni', 'Răducăneni', 'Rediu', 'Româneşti', 'Românești', 'Ruginoasa', 'Sârca', 'Săbăoani', 'Scânteia', 'Schitu Duca', 'Scobinți', 'Șcheia', 'Sinești', 'Șipote', 'Stolniceni-Prăjescu', 'Strunga', 'Șuletea', 'Tansa', 'Tătăruși', 'Todirești', 'Tomești', 'Țibăneşti', 'Țibănești', 'Țuțora', 'Ungheni', 'Valea Lupului', 'Valea Seacă', 'Vânători', 'Victoria', 'Vlădeni', 'Voinești']
  },
  {
    code: 'IF',
    name: 'Ilfov',
    cities: ['Buftea', 'Voluntari', 'Pantelimon', 'Popești-Leordeni', 'Bragadiru', 'Chitila', 'Magurele', 'Otopeni', 'Măgurele', '1 Decembrie', 'Afumați', 'Balotești', 'Bălăceanca', 'Berceni', 'Cernica', 'Chiajna', 'Ciolpani', 'Ciorogârla', 'Clinceni', 'Copăceni', 'Cornetu', 'Corbeanca', 'Dărăști-Ilfov', 'Dascălu', 'Dobroești', 'Domneşti', 'Domnești', 'Dragomirești-Vale', 'Găneasa', 'Ghermănești', 'Glina', 'Grădiștea', 'Gruiu', 'Jilava', 'Moara Vlăsiei', 'Mogoșoaia', 'Nuci', 'Petrăchioaia', 'Periș', 'Petrăchioaia', 'Snagov', 'Ștefăneştii de Jos', 'Tunari', 'Vidra']
  },
  {
    code: 'MM',
    name: 'Maramureș',
    cities: ['Baia Mare', 'Sighetu Marmației', 'Borșa', 'Vișeu de Sus', 'Târgu Lăpuș', 'Cavnic', 'Săliștea de Sus', 'Seini', 'Ulmeni', 'Tăuții-Măgherăuș', 'Ariniș', 'Asuaju de Sus', 'Băiuț', 'Băița de sub Codru', 'Bârsana', 'Băseşti', 'Baia Sprie', 'Bicaz', 'Bistra', 'Bocicoiu Mare', 'Boiu Mare', 'Botiza', 'Budești', 'Băsești', 'Câmpulung la Tisa', 'Călinești', 'Călineşti', 'Cehu Silvaniei', 'Cerneşti', 'Cernești', 'Cicârlău', 'Coltău', 'Copalnic-Mănăștur', 'Coroieni', 'Crasna Vișeului', 'Cupșeni', 'Desești', 'Dumbrava', 'Dumbrăvița', 'Fărcaşa', 'Farcasa', 'Giuleşti', 'Giulești', 'Gropeana', 'Groși', 'Grosii Tibaului', 'Ieud', 'Lăpuș', 'Leordina', 'Mireșu Mare', 'Ocna Șugatag', 'Oarța de Jos', 'Oncești', 'Petrova', 'Poienile de sub Munte', 'Poienile Izei', 'Remetea Chioarului', 'Remeti', 'Remeți', 'Repedea', 'Rona de Jos', 'Rona de Sus', 'Rozavlea', 'Ruscova', 'Săcălășeni', 'Săcel', 'Săliștea de Sus', 'Sălsig', 'Sarasău', 'Șieu', 'Șișești', 'Șomcuta Mare', 'Strâmtura', 'Suciu de Sus', 'Tăuții de Sus', 'Târgu Lăpuș', 'Ulmeni', 'Vadu Izei', 'Valea Chioarului', 'Vima Mică', 'Vișeu de Jos']
  },
  {
    code: 'MH',
    name: 'Mehedinți',
    cities: ['Drobeta-Turnu Severin', 'Orșova', 'Strehaia', 'Vânju Mare', 'Baia de Aramă', 'Bala', 'Bălăcița', 'Bălvănești', 'Breznița-Ocol', 'Brezniţa-Motru', 'Broșteni', 'Burila Mare', 'Cârna', 'Căzănești', 'Cărpiniş', 'Ciresu', 'Corcova', 'Corlățel', 'Crăguești', 'Cujmir', 'Dârvari', 'Devesel', 'Dobreta', 'Dumbrava de Jos', 'Duduești', 'Dudești', 'Eșelnița', 'Floreşti', 'Gârla Mare', 'Godeanu', 'Gogoșu', 'Greci', 'Gruia', 'Hinova', 'Husnicioara', 'Ilovița', 'Isverna', 'Izvoru Bârzii', 'Jiana', 'Livezile', 'Malovat', 'Malovăț', 'Obârșia de Câmp', 'Obârșia-Cloșani', 'Oprisor', 'Padina', 'Patulele', 'Pârvulești', 'Păușa', 'Podeni', 'Poroina Mare', 'Pristol', 'Prunisor', 'Punghina', 'Rogova', 'Salcia', 'Simian', 'Șipotu', 'Șovarna', 'Stângăceaua', 'Sviniţa', 'Tâmna', 'Vânători', 'Vânjuleț', 'Vârtop', 'Vrata']
  },
  {
    code: 'MS',
    name: 'Mureș',
    cities: ['Târgu Mureș', 'Reghin', 'Sighișoara', 'Târnăveni', 'Luduș', 'Iernut', 'Sovata', 'Miercurea Nirajului', 'Sângeorgiu de Pădure', 'Ungheni', 'Acățari', 'Adămuș', 'Aluniș', 'Apold', 'Atintis', 'Bahnea', 'Bălăușeri', 'Band', 'Bâța', 'Batos', 'Beica de Jos', 'Bereni', 'Berghia', 'Bogata', 'Brâncoveneşti', 'Brâncoveneşti', 'Ceuașu de Câmpie', 'Chendu', 'Chiheru de Jos', 'Coroisânmărtin', 'Corunca', 'Cozma', 'Crăciunești', 'Crăiești', 'Cristeşti', 'Cristești', 'Cuci', 'Daneș', 'Deda', 'Eremitu', 'Ernei', 'Fântânele', 'Fărăgău', 'Găleşti', 'Gălești', 'Ganești', 'Gheorghe Doja', 'Glodeni', 'Gorneşti', 'Gornești', 'Grebenisu de Câmpie', 'Gurghiu', 'Hodac', 'Hodosa', 'Ibanești', 'Ibănești', 'Iclanzel', 'Ideciu de Jos', 'Livezeni', 'Lunca', 'Lunca Bradului', 'Mătrici', 'Măgherani', 'Mica', 'Miheșu de Câmpie', 'Nadeș', 'Neaua', 'Ogra', 'Pâncielul', 'Pănet', 'Papiu Ilarian', 'Pasareni', 'Păsăreni', 'Pogăceaua', 'Râciu', 'Răstolița', 'Ruşii-Munţi', 'Rusii-Munti', 'Sâncraiu de Mureș', 'Sânger', 'Sântana de Mureș', 'Sânpaul', 'Sânpetru de Câmpie', 'Saschiz', 'Sărățeni', 'Sânsimion', 'Șăulia', 'Sărmaşu', 'Solovăstru', 'Stânceni', 'Suplac', 'Suseni', 'Șincai', 'Tăureni', 'Vânători', 'Valea Largă', 'Vătava', 'Veţca', 'Viisoara', 'Voivodeni', 'Zagăr', 'Zăgăr', 'Zau de Câmpie']
  },
  {
    code: 'NT',
    name: 'Neamț',
    cities: ['Piatra Neamț', 'Roman', 'Târgu Neamț', 'Bicaz', 'Roznov', 'Agapia', 'Alexandru cel Bun', 'Bălțătești', 'Bârgăuani', 'Bâra', 'Bicaz-Chei', 'Bicazu Ardelean', 'Bodești', 'Boghicea', 'Borca', 'Borleşti', 'Boteşti', 'Bozieni', 'Brusturi', 'Bahna', 'Candești', 'Ceahlău', 'Cordun', 'Costisa', 'Crăcăoani', 'Dămuc', 'Dobreni', 'Dochia', 'Doljeşti', 'Dragomireşti', 'Dulceşti', 'Dumbrava Roşie', 'Fărcaşa', 'Fărăoani', 'Gherăești', 'Ghindăoani', 'Girov', 'Grumăzești', 'Hangu', 'Horia', 'Icuşeşti', 'Ion Creangă', 'Moldoveni', 'Oniceni', 'Pânceleşti', 'Pangarați', 'Petricani', 'Pildești', 'Pipirig', 'Poiana Teiului', 'Poienari', 'Răuceşti', 'Rediu', 'Răchiți', 'Români', 'Războieni', 'Ruginoasa', 'Sabaoani', 'Săbăoani', 'Sagna', 'Săvinești', 'Secuieni', 'Săvineşti', 'Stăniţa', 'Stefan cel Mare', 'Taşca', 'Tarcău', 'Tazlău', 'Tibucani', 'Ţibucani', 'Timisesti', 'Trifesti', 'Tupilaţi', 'Urecheni', 'Valea Ursului', 'Vânători-Neamț', 'Zanesti', 'Zăneşti']
  },
  {
    code: 'OT',
    name: 'Olt',
    cities: ['Slatina', 'Caracal', 'Balș', 'Corabia', 'Drăgănești-Olt', 'Piatra-Olt', 'Potcoava', 'Scorniceşti', 'Băbiciu', 'Baldovineşti', 'Bălăneşti', 'Barza', 'Bărzești', 'Bobicești', 'Brastavăţu', 'Brâncoveni', 'Brebeni', 'Bucinișu', 'Cezieni', 'Cilieni', 'Coteana', 'Crâmpoia', 'Curtișoara', 'Dăneasa', 'Deveselu', 'Dobrețu', 'Dobrun', 'Dobrosloveni', 'Drăghiceni', 'Făgețelu', 'Fărcaşele', 'Fălcoiu', 'Găneasa', 'Găvăneşti', 'Ghimpaţi', 'Ghimpați', 'Grojdibodu', 'Giuvărăști', 'Gostavățu', 'Grădinile', 'Grojdibodu', 'Ianca', 'Iancu Jianu', 'Icoana', 'Ipotești', 'Ianca', 'Izbiceni', 'Izvoarele', 'Leleasca', 'Mărunței', 'Milcov', 'Mihaesti', 'Morunești', 'Movileni', 'Oboga', 'Oporelu', 'Ostrovu Mare', 'Osica de Jos', 'Osica de Sus', 'Perieti', 'Perieți', 'Pleșoiu', 'Poboru', 'Priseaca', 'Radomirești', 'Redea', 'Rotunda', 'Rusănești', 'Săltăteni', 'Schitu', 'Scornicești', 'Seaca', 'Şerbăneşti', 'Sârbii-Măgura', 'Slătioara', 'Spineni', 'Sprâncenata', 'Ștefan cel Mare', 'Stoeneşti', 'Stoicănești', 'Strejeşti', 'Studina', 'Tătuleşti', 'Teslui', 'Traian', 'Tufeni', 'Urzica', 'Vădastra', 'Văidastra', 'Văleni', 'Vitomireşti', 'Vitomirești', 'Vlădila', 'Voineasa', 'Vulpeni', 'Vultureşti', 'Vulturesti']
  },
  {
    code: 'PH',
    name: 'Prahova',
    cities: ['Ploiești', 'Câmpina', 'Mizil', 'Sinaia', 'Băicoi', 'Vălenii de Munte', 'Breaza', 'Azuga', 'Boldești-Scăeni', 'Bușteni', 'Comarnic', 'Plopeni', 'Slănic', 'Urlați', 'Adunați', 'Aluniș', 'Apostolache', 'Aricestii Rahtivani', 'Ariceștii Zeletin', 'Baba Ana', 'Balta Doamnei', 'Bănești', 'Bărcăneşti', 'Bărcănești', 'Bătrâni', 'Berceni', 'Bertea', 'Blejoi', 'Boldeşti-Gradiștea', 'Brazi', 'Brebu', 'Bucov', 'Căldăraru', 'Călugăreni', 'Carbunești', 'Cărbunești', 'Cerașu', 'Chiojdeanca', 'Ceptura', 'Chiojdeni', 'Ciorani', 'Cocorăștii Colț', 'Cocorăștii Mislii', 'Colceag', 'Corlătești', 'Cornu de Jos', 'Cosminele', 'Dărmăneşti', 'Draganesti', 'Drăgănești', 'Dumbrava', 'Dumbrăvești', 'Fântânele', 'Filipeştii de Pădure', 'Filipeștii de Târg', 'Floreşti', 'Florești', 'Fulga', 'Fulga de Jos', 'Gherghița', 'Ghighiu', 'Gorgota', 'Gornet', 'Gorgota', 'Gura Vadului', 'Gura Vitioarei', 'Iordăcheanu', 'Izvoarele', 'Jugureni', 'Lapoș', 'Lipănești', 'Lipăneşti', 'Lunca', 'Magurele', 'Măgurele', 'Măgureni', 'Mălăieşti', 'Mănești', 'Măneciu', 'Olari', 'Pacureţi', 'Păcureți', 'Paulești', 'Parscov', 'Plopu', 'Poiana Câmpina', 'Poienarii Burchii', 'Posești', 'Predeal-Sărari', 'Provița de Jos', 'Provița de Sus', 'Păulești', 'Rădești', 'Râfov', 'Salcia', 'Salciile', 'Sălcii', 'Sangeru', 'Sângeru', 'Scorțeni', 'Scurtești', 'Secaria', 'Șirna', 'Șoimari', 'Șotrile', 'Starchiojd', 'Ștefeşti', 'Surani', 'Talea', 'Tăriceni', 'Teișani', 'Telega', 'Tinosu', 'Tomşani', 'Tomșani', 'Tomsani', 'Valea Călugărească', 'Vărbilău', 'Vălenii de Munte', 'Vâlcănești', 'Vipereşti']
  },
  {
    code: 'SM',
    name: 'Satu Mare',
    cities: ['Satu Mare', 'Carei', 'Negrești-Oaș', 'Ardud', 'Livada', 'Tășnad', 'Acâș', 'Agriș', 'Andrid', 'Bârsău', 'Beltiug', 'Berveni', 'Bârsău de Jos', 'Bixad', 'Bogdand', 'Botiz', 'Camăr', 'Călineşti-Oaş', 'Cămin', 'Căpleni', 'Cărășeu', 'Cehal', 'Certeze', 'Ciumești', 'Craidorolț', 'Crucisor', 'Crucișor', 'Culciu', 'Doba', 'Doba Mică', 'Dorolt', 'Ghenci', 'Halmeu', 'Hodod', 'Homoroade', 'Lazuri', 'Medieșu Aurit', 'Micula', 'Moftinu Mare', 'Moftinu Mic', 'Odoreu', 'Oar', 'Omorol', 'Paulești', 'Păulești', 'Petrești', 'Pir', 'Pișcolt', 'Pomi', 'Porumbescu', 'Potău', 'Racșa', 'Racșa', 'Sanislău', 'Săcăşeni', 'Seini', 'Socond', 'Someș-Odorhei', 'Supuru de Jos', 'Supur', 'Târsa', 'Tiream', 'Turulung', 'Tureac', 'Țiparești', 'Urziceni', 'Valea Vinului', 'Vama', 'Vetiș', 'Vetis', 'Viile Satu Mare']
  },
  {
    code: 'SJ',
    name: 'Sălaj',
    cities: ['Zalău', 'Șimleu Silvaniei', 'Jibou', 'Cehu Silvaniei', 'Agrij', 'Almaşu', 'Almașu', 'Bănișor', 'Băbeni', 'Benesat', 'Bobota', 'Bocşa', 'Boghiş', 'Buciumi', 'Bălan', 'Căpâlna', 'Carastelec', 'Cehu Silvaniei', 'Chieșd', 'Cizer', 'Coșeiu', 'Crasna', 'Creaca', 'Cristolț', 'Crișeni', 'Cuzăplac', 'Dobrin', 'Dragu', 'Fildu de Jos', 'Firminiș', 'Gâlgău', 'Gâlgău Almașului', 'Gârbou', 'Gârbolț', 'Halmaşd', 'Hereclean', 'Horoatu Crasnei', 'Hida', 'Ileanda', 'Ip', 'Letca', 'Lozna', 'Măeriște', 'Marca', 'Măerişte', 'Meseșenii de Jos', 'Mirsid', 'Năpradea', 'Nușfalău', 'Panic', 'Pericei', 'Plopiș', 'Poiana Blenchii', 'Romanasi', 'Romanaşi', 'Rus', 'Sâg', 'Sălaţig', 'Sălățig', 'Sălățig', 'Sâmboleni', 'Sâmsud', 'Șamșud', 'Șărmășag', 'Someș-Guruslău', 'Stâna', 'Șimleu Silvaniei', 'Treznea', 'Valcău de Jos', 'Vârșolț', 'Zalha', 'Zimbor']
  },
  {
    code: 'SB',
    name: 'Sibiu',
    cities: ['Sibiu', 'Mediaș', 'Cisnădie', 'Agnita', 'Avrig', 'Copșa Mică', 'Dumbrăveni', 'Miercurea Sibiului', 'Ocna Sibiului', 'Săliște', 'Tălmaciu', 'Alma', 'Apoldu de Jos', 'Arbore', 'Ațel', 'Axente Sever', 'Bârghiș', 'Bazna', 'Biertan', 'Blăjel', 'Boița', 'Brădeni', 'Brateiu', 'Bruiu', 'Brâdeni', 'Cârța', 'Cârțișoara', 'Chirpar', 'Cisnădioara', 'Cristian', 'Dârlos', 'Gura Râului', 'Hoghilag', 'Iacobeni', 'Jina', 'Laslea', 'Loamneș', 'Ludos', 'Mărginimea Sibiului', 'Merghindeal', 'Mihăileni', 'Moșna', 'Nocrich', 'Poplaca', 'Porumbacu de Jos', 'Racoviţa', 'Racovița', 'Răşinari', 'Râu Sadului', 'Roşia', 'Șeica Mare', 'Șeica Mică', 'Șelimbăr', 'Slimnic', 'Șura Mare', 'Șura Mică', 'Tălmăcel', 'Tilișca', 'Țopa', 'Tuma', 'Turnu Roșu', 'Vălişoara', 'Vale', 'Vârghiș', 'Veseud', 'Vurpăr']
  },
  {
    code: 'SV',
    name: 'Suceava',
    cities: ['Suceava', 'Rădăuți', 'Fălticeni', 'Câmpulung Moldovenesc', 'Vatra Dornei', 'Gura Humorului', 'Siret', 'Salcea', 'Cajvana', 'Dolhasca', 'Frasin', 'Liteni', 'Milișăuți', 'Solca', 'Vicovu de Sus', 'Adâncata', 'Arbore', 'Baia', 'Bălăceana', 'Băluşeni', 'Berchișești', 'Bilca', 'Bogdănești', 'Boroaia', 'Bosanci', 'Botosana', 'Brăești', 'Brodina', 'Broscăuți', 'Bucșoaia', 'Bălcăuți', 'Bunești', 'Burla', 'Cacica', 'Calafindești', 'Cârlibaba', 'Cârlibaba Nouă', 'Ciprian Porumbescu', 'Ciocănești', 'Colacu', 'Comănești', 'Cornu Luncii', 'Coșna', 'Costâna', 'Crucea', 'Dărmănești', 'Dorna-Arini', 'Dorna Candrenilor', 'Dragușeni', 'Drăgoieşti', 'Dumbraveni', 'Dumbrava', 'Fântâna Mare', 'Fântânele', 'Forăști', 'Frătăuţii Noi', 'Frătăuții Vechi', 'Fundu Moldovei', 'Gălănești', 'Gârcina', 'Grăniceşti', 'Grâmeşti', 'Grănești', 'Hănțești', 'Hânteşti', 'Horodnic de Jos', 'Horodnic de Sus', 'Horodniceni', 'Humor', 'Iacobeni', 'Iasloveţ', 'Ilişeşti', 'Ipotești', 'Izvoarele Sucevei', 'Malini', 'Mănăstirea Humorului', 'Marginea', 'Mărișelu', 'Mălini', 'Mitocu Dragomirnei', 'Moldovița', 'Moara', 'Muşeniţa', 'Ostra', 'Panaci', 'Păltinoasa', 'Pârteștii de Jos', 'Pângarați', 'Pojorâta', 'Poiana Stampei', 'Pojorâta', 'Preuteşti', 'Putna', 'Rădășeni', 'Râșca', 'Sadova', 'Satu Mare', 'Șaru Dornei', 'Sângeorz-Băi', 'Scheia', 'Siminicea', 'Slatina', 'Stulpicani', 'Straja', 'Stroieşti', 'Suceviţa', 'Șcheia', 'Șerbăuți', 'Todireşti', 'Udești', 'Ulma', 'Vadu Moldovei', 'Valea Moldovei', 'Vama', 'Vatra Moldovitei', 'Vereşti', 'Verești', 'Voitinel', 'Volovăț', 'Vulturești', 'Zamostea', 'Zvoriştea']
  },
  {
    code: 'TR',
    name: 'Teleorman',
    cities: ['Alexandria', 'Rosiori de Vede', 'Turnu Măgurele', 'Videle', 'Zimnicea', 'Balaci', 'Băbăița', 'Băneasa', 'Bârca', 'Beciu', 'Blejești', 'Bogdana', 'Botoroaga', 'Brânceni', 'Bragadiru', 'Brânceni', 'Bujoreni', 'Bujoru', 'Buzescu', 'Calomfireşti', 'Călineşti', 'Călinești', 'Cervenia', 'Ciuperceni', 'Ciurești', 'Crangu', 'Crevenicu', 'Crângu', 'Dobrotești', 'Drăcșenei', 'Drăgănești de Vede', 'Drăghinești', 'Drăneşti', 'Dârvari', 'Fântânele', 'Frăsinet', 'Frumoasa', 'Furculești', 'Galateni', 'Gălăteni', 'Gratia', 'Grădiştea', 'Islaz', 'Izvoru', 'Liţa', 'Lisa', 'Lița', 'Lunca', 'Măgura', 'Măldăeni', 'Mavrodin', 'Mârzăneşti', 'Mereni', 'Mârşani', 'Moldoveni', 'Nasturelu', 'Năsturelu', 'Nanov', 'Nenciuleşti', 'Necsești', 'Olteni', 'Orbeasca de Sus', 'Peretu', 'Piatra', 'Plopii-Slăvitești', 'Plosca', 'Poeni', 'Poroschia', 'Purani', 'Putineiu', 'Radomirești', 'Răsmireşti', 'Salcia', 'Săceni', 'Scrioaştea', 'Scrioaştea', 'Scurtu Mare', 'Seaca', 'Segarcea-Vale', 'Segarcea Vale', 'Sfințești', 'Silistea', 'Silistea Gumești', 'Siliştea', 'Slobozia Mândra', 'Suhaia', 'Ștorobăneasa', 'Talpa', 'Tătărăştii de Jos', 'Tâlhăreşti', 'Tătărăștii de Sus', 'Traian', 'Trivalea-Moşteni', 'Troianul', 'Uda-Clocociov', 'Uda-Paciurea', 'Vedea', 'Viișoara', 'Vităneşti', 'Zâmbreasca']
  },
  {
    code: 'TM',
    name: 'Timiș',
    cities: ['Timișoara', 'Lugoj', 'Sânnicolau Mare', 'Buziaș', 'Deta', 'Făget', 'Jimbolia', 'Recaș', 'Banloc', 'Beba Veche', 'Becicherecu Mic', 'Biled', 'Birda', 'Bârna', 'Bogda', 'Boldur', 'Beba Veche', 'Bethausen', 'Belint', 'Bethausen', 'Botinești', 'Brestovăţ', 'Budoni', 'Cărpiniș', 'Cenad', 'Cenei', 'Checea', 'Chevereșu Mare', 'Comloșu Mare', 'Coșteiu', 'Curtea', 'Darova', 'Denta', 'Dudeștii Noi', 'Dudeștii Vechi', 'Dumbrava', 'Dumbrăvița', 'Fârdea', 'Fibiș', 'Ficătar', 'Gavojdia', 'Gătaia', 'Ghilad', 'Ghiroda', 'Ghizela', 'Giarmata', 'Giroc', 'Giulvăz', 'Giera', 'Gottlob', 'Izvoru', 'Iecea Mare', 'Jamu Mare', 'Jebel', 'Lenauheim', 'Liebling', 'Livezile', 'Lovrin', 'Margina', 'Mănăștiur', 'Maşloc', 'Măureni', 'Moșnița Nouă', 'Moraviţa', 'Nădrag', 'Niţchidorf', 'Orțișoara', 'Otelec', 'Parța', 'Periam', 'Peciu Nou', 'Pesac', 'Pietroasa', 'Pişchia', 'Pădureni', 'Remetea Mare', 'Racoviţa', 'Remetea Mică', 'Sacoșu Turcesc', 'Sânandrei', 'Sânmartinu Sârbesc', 'Sânpetru Mare', 'Sănătescui', 'Săcălaz', 'Șag', 'Șandra', 'Șemlacu Mare', 'Secaş', 'Șteie', 'Stamora Română', 'Stamora Morovicza', 'Teremia Mare', 'Tomeşti', 'Tomnatic', 'Topolovățu Mare', 'Traian Vuia', 'Uivar', 'Urseni', 'Utvin', 'Valcani', 'Variaş', 'Victor Vlad Delamarina', 'Vinga', 'Voiteg', 'Voiteg']
  },
  {
    code: 'TL',
    name: 'Tulcea',
    cities: ['Tulcea', 'Babadag', 'Măcin', 'Isaccea', 'Sulina', 'Baia', 'Beidaud', 'Casimcea', 'Ceamurlia de Jos', 'Ceatalchioi', 'Cerna', 'Chilia Veche', 'Ciucurova', 'Crișan', 'Dăeni', 'Dorobanțu', 'Frecăței', 'Greci', 'Grindu', 'Hamcearca', 'Horia', 'I.C. Brătianu', 'Izvoarele', 'Jijila', 'Jurilovca', 'Luncaviţa', 'Mahmudia', 'Măcin', 'Maliuc', 'Mihai Bravu', 'Mihail Kogălniceanu', 'Murighiol', 'Nalbant', 'Niculițel', 'Nufăru', 'Ostrov', 'Pardina', 'Pantelimon de Jos', 'Peceneaga', 'Sarichioi', 'Sfântu Gheorghe', 'Slava Cercheză', 'Smârdan', 'Somova', 'Stejaru', 'Topolog', 'Turcoaia', 'Valea Teilor', 'Văcăreni', 'Valea Nucarilor']
  },
  {
    code: 'VS',
    name: 'Vaslui',
    cities: ['Vaslui', 'Bârlad', 'Huși', 'Murgeni', 'Negrești', 'Albești', 'Alexandreşti', 'Alexandru Vlahută', 'Arsura', 'Băcani', 'Băceşti', 'Bălțați', 'Bălteni', 'Banca', 'Berezeni', 'Blăgești', 'Bogdana', 'Bogdănești', 'Bogdănița', 'Boțești', 'Budeşti', 'Bunești-Averești', 'Ciorești', 'Codăești', 'Coroiești', 'Costeşti', 'Costești', 'Crangul Nou', 'Crețești', 'Dancu', 'Deleşti', 'Deleni', 'Dimitrie Cantemir', 'Drânceni', 'Drânceni', 'Duda-Epureni', 'Dumești', 'Dumeşti', 'Epureni', 'Fălciu', 'Ferești', 'Fruntişeni', 'Gârceni', 'Găgeşti', 'Giurcani', 'Griviţa', 'Grivița', 'Hoceni', 'Iana', 'Ibănești', 'Ivănești', 'Ivești', 'Laza', 'Lipovăț', 'Lunca Banului', 'Mălușteni', 'Micleşti', 'Miclești', 'Muntenii de Jos', 'Muntenii de Sus', 'Oşeşti', 'Oltenești', 'Perieni', 'Pogana', 'Pogonești', 'Pochidia', 'Podu Oprii', 'Poienești', 'Puieşti', 'Puiești', 'Pungeşti', 'Pungești', 'Rafaila', 'Rebricea', 'Roșieşti', 'Roșiești', 'Solești', 'Stefan cel Mare', 'Suletea', 'Tacuta', 'Tăcuta', 'Tănăsoaia', 'Todireşti', 'Todireşti', 'Tutova', 'Vaslui', 'Vetrişoaia', 'Vetrisoaia', 'Viişoara', 'Voinești', 'Voineşti', 'Vutcani', 'Zăpodeni', 'Zorleni']
  },
  {
    code: 'VL',
    name: 'Vâlcea',
    cities: ['Râmnicu Vâlcea', 'Drăgășani', 'Băile Olănești', 'Brezoi', 'Băile Govora', 'Călimănești', 'Horezu', 'Ocnele Mari', 'Alunu', 'Amărăști', 'Bălcești', 'Bărbătești', 'Berbeşti', 'Berislăvești', 'Boisoara', 'Borosești', 'Budești', 'Budeşti', 'Bujoreni', 'Buneşti', 'Căineni', 'Câineni', 'Cernișoara', 'Copăceni', 'Costeşti', 'Costeşti', 'Creţeni', 'Cungrea', 'Dăești', 'Dănicei', 'Drăgășani', 'Fârtățești', 'Făureşti', 'Francești', 'Frâncești', 'Ghioroiu', 'Glăvile', 'Galicea', 'Golești', 'Grădiştea', 'Griereşti', 'Guşoeni', 'Ioneşti', 'Lădești', 'Laloșu', 'Lăpușata', 'Livezi', 'Lungești', 'Mădulari', 'Măciuca', 'Mihăești', 'Milcoiu', 'Mitrofani', 'Muereasca', 'Nicolae Bălcescu', 'Olanu', 'Orlești', 'Oteșani', 'Păușești', 'Păușești-Măglași', 'Perişani', 'Pesceana', 'Pietrari', 'Popești', 'Prundeni', 'Racoviţa', 'Roești', 'Rosoveni', 'Rotărăști', 'Runcu', 'Sălătrucel', 'Salatrucu', 'Scundu', 'Sinești', 'Sirineasa', 'Slătioara', 'Stoeneşti', 'Stoilești', 'Stroieşti', 'Șirineasa', 'Ștefan cel Mare', 'Șușani', 'Tâmbeşti', 'Tetoiu', 'Titești', 'Tomșani', 'Vaideeni', 'Valea Mare', 'Vladesti', 'Vlădești', 'Voicești', 'Voineasa', 'Zătreni']
  },
  {
    code: 'VN',
    name: 'Vrancea',
    cities: ['Focșani', 'Adjud', 'Mărășești', 'Odobești', 'Panciu', 'Balesti', 'Băleşti', 'Bârseşti', 'Biliești', 'Bolotești', 'Boroșneşti', 'Bordești', 'Brosteni', 'Cârligele', 'Câmpineanca', 'Câmpuri', 'Chiojdeni', 'Ciorăști', 'Corbița', 'Cotești', 'Dumitrești', 'Dumitreşti', 'Fitioneşti', 'Fitionești', 'Goleşti', 'Gologanu', 'Gugești', 'Gugeşti', 'Homocea', 'Jariștea', 'Jitia', 'Maicanesti', 'Măicăneşti', 'Mera', 'Milcovul', 'Movilița', 'Nănești', 'Năruja', 'Năneşti', 'Negrilesti', 'Negrileşti', 'Nereju', 'Nistorești', 'Obârşia', 'Odobeşti', 'Paltin', 'Păunești', 'Păuneşti', 'Ploscuțeni', 'Poiana Cristei', 'Popești', 'Pufeşti', 'Pufești', 'Râmniceanca', 'Răcoasa', 'Reghiu', 'Ruginești', 'Slobozia Bradului', 'Slobozia Ciorăști', 'Soveja', 'Spulber', 'Străoane', 'Șurești', 'Suraia', 'Tănăsoaia', 'Tâtârci', 'Tifești', 'Tulnici', 'Țifeşti', 'Urecheşti', 'Valea Sării', 'Vârteșcoiu', 'Vidra', 'Vinerești', 'Vintileasca', 'Vrâncioaia', 'Vrâncioaia', 'Vulturu']
  },
  {
    code: 'B',
    name: 'București',
    cities: ['București - Sectorul 1', 'București - Sectorul 2', 'București - Sectorul 3', 'București - Sectorul 4', 'București - Sectorul 5', 'București - Sectorul 6']
  }
];
