# Magistrsko delo
Ta repozitorij vsebuje izvorno kodo in skripte mojega zaključnega projekta.

## Uvod
V magistrski nalogi predstavljamo razvoj lastnega zdravstvenega sistema Cardano Vaccinator za upravljanje s cepilnimi potrdili. Sistem temelji na Cardanu, 3. generaciji tehnologij veriženja blokov, ki dosega odlične rezultate na področju učinkovitosti. Z upoštevanjem standardov W3C in vpeljavo gradnikov samoupravljive identitete, je uporabnikom zagotovljena visoka stopnja varnosti in zasebnosti. Sistem je integriran v naše prilagojeno konzorcijsko omrežje, ki temelji na verigi blokov Cardano. 

## Vzpostavitev konzorcijskega omrežja Cardano in podpornih storitev
### Predpriprava
Projekt je testiran le na VM-ju z operacijskim sistemom Fedora Workstation 36. Skripta setup.sh izvede namestitev NodeJS, Chromium in Docker.
```bash
bash setup.sh
reboot now
```

### Zagon konzorcijskega omrežja
Vsak del našega omrežja je definiran s samostojno specifikacijo docker-compose. Za lažji nadzor smo razvili posebno upravljalsko bash skripto cardano-private-network.sh, ki omogoča vzpostavitev celotnega omrežja, upravljanje različnih komponent, izvajanje osnovnih transakcij na verigi blokov in preverjanje zdravja storitev. Zagon in konfiguracijo konzorcijskega omrežja se lahko izvede s spodnjimi ukazi:
```bash
cd cardano-private-network
bash cardano-private-network.sh install
bash cardano-private-network.sh #Select 5 (Reset)

# Wait until network is ready (cca. 2 minutes)
# (If network is still not ready after 5 minutes, perform "Reset" again...)

bash cardano-private-network.sh #Select 'w' (prepare environment)
# If new DID and wallet addresses are visible at the end, the network is successfully prepared.
```

Vizualizacija ključnih storitev konzorcijskega omrežja:
![Alt text](/screenshots/layout.jpg?raw=true "Vizualizacija - docker-compose-viz")

### Zagon sistema Cardano Vaccinator
Sistem Cardano Vaccinator sestavljata čelni del in zaledni del, ki sta napisana v programskem jeziku JavaScript. Zagon obeh komponent se izvede s spodnjimi ukazi:
```bash
cd cardano-vaccination-js
npm i
npm run dev

cd cardano-vaccination-js
cd client
npm i
npm start
```

### Namestitev vtičnika Cardano Vaccinator Helper
```bash
# Tested on Chromium only

# Go to Extensions - Enable Developer Mode - Load Unpacked - Select folder cardano-vaccinator-extension
```

## Uporaba sistema Cardano Vaccinator
Sistem uporabljajo štirje glavni akterji (upravitelj sistema, pacient, cepilni center in preverjevalec). Pred uporabo sistema je zahtevana prijava v sistem.

### Prijava v sistem
Prijava v sistem Cardano Vaccinator poteka na dva načina in je odvisna od vloge, ki jo ima uporabnik.
Prijava z uporabniškim imenom in geslom je namenjena le centralni avtoriteti oz. upraviteljem sistema. Administrator se prijavi preko obrazca na naslovu: [http://127.0.0.1:3006/login](http://127.0.0.1:3006/login) . Podatki za prijavo so shranjeni v centralizirani podatkovni bazi MongoDB.

Prijava s pomočjo samoupravljive identitete je namenjena vsem ostalim uporabnikom. Uporabniki za prijavo potrebujejo svoj decentraliziran identifikator in pripadajoč avtentikacijski ključ. Z vtičnikom Cardano Vaccinator Helper je postopek še enostavnejši, saj se samo s klikom na gumb lahko samodejno prijavijo v sistem. Prijava poteka preko obrazca na naslovu: [http://127.0.0.1:3006/auth](http://127.0.0.1:3006/auth).

### Upravljanje uporabnikov
Registracijo uporabnikov in zalog cepiv lahko opravlja le upravitelj sistema na spletnem naslovu [http://127.0.0.1:3006/patients](http://127.0.0.1:3006/patients). 
#### Registracija pacienta
V primeru registracije novega pacienta upravitelj v sistem Cardano Vaccinator vnese njegove osebne podatke. Če pacient ob prijavi ne navede svojega DID-a, to pomeni, da želi nov decentraliziran identifikator in da se strinja s shranjevanjem varnostne kopije ključa v podatkovno bazo.

#### Deaktivacija DID-a
V primeru kraje zasebih ključev, ponuja Cardano Vaccinator pomoč pri deaktivaciji DID-a. Če se posodobitveni ključi za DID že nahajajo v sistemu, se izvedba postopka začne takoj. V nasprotnem primeru je potreben ročen vnos manjkajočih podatkov v podatkovno bazo MongoDB, kar administrator stori na naslovu: [http://localhost:27080/db/test/](http://localhost:27080/db/test/). 

#### Vnos nove zaloge cepiv
Upravljalec v spletni obrazec vnese naziv cepiva, proizvajalca in število odmerkov, ki so na voljo. Podatki se shranijo v podatkovno bazo, na verigo blokov pa se zapišejo zgoščeni metapodatki.

<i>Registracija novega pacienta, cepilnega centra in preverjevalca ter vnos nove zaloge cepiva prikazuje <b>Video #01: https://youtu.be/UHReUt75YXI</b></i>

### Izdaja novega cepilnega potrdila
Izdajanje cepilnih potrdil je omogočeno le cepilnim centrom (izdajateljem), na spletnem naslovu: [http://127.0.0.1:3006/vaccinationCertificates](http://127.0.0.1:3006/vaccinationCertificates). Pacient na cepilnem mestu izkaže svojo istovetnost z osebnim dokumentom in s kartico zdravstvenega zavarovanja. Prenos novega cepilnega potrdila lahko poteka na dva načina. V obeh primerih se na verigo blokov zapišejo še anonimni metapodatki o cepljenju.

- Prenos prek verige blokov: v tem primeru se cepilno potrdilo šifrira z javnim ključem pacienta in zapiše neposredno na verigo blokov med metapodatke transakcije.

- Prenos z uporabo komunikacije DID-to-DID: pacient pripravi svojo digitalno denarnico (vtičnik) in klikne na gumb za sprejemanje novih poverilnic. Vtičnik pošlje zahtevek na strežnik didcomm-server za nov začasni soležni identifikator in prejme povabilo, ki ga izriše v obliki QR kode. Cepilni center povabilo skenira in podatke pošlje na didcomm-server. Vsebina poverilnice se digitalno podpiše in šifrira. Ustvari se DIDComm sporočilo, ki ga lahko prevzame le pacient s svojo digitalno denarnico.

<i>Postopek izdaje cepilnega potrdila prek verige blokov prikazuje <b>Video #02: https://youtu.be/QQYLKxmpYNU</b>, z uporabo komunikacije DID-to-DID pa <b>Video #03: https://youtu.be/fBxQybH1gDc</b></i>

### Pregled cepilnih potrdil in ustvarjanje predstavitve na verigi blokov
Pacient si lahko na spletnem naslovu [http://127.0.0.1:3006/verifier](http://127.0.0.1:3006/verifier) ogleda vsa svoja cepilna potrdila, ki se nahajajo na verigi blokov. Iz obstoječih poverilnic na verigi blokov lahko ustvari prezentacijo in jo šifrira z javnim ključem izbranega preverjevalca. Na ta način se zaupanja vrednemu preverjevalcu lahko zagotovi neomejen, a hitrejši dostop do pacientovih cepilnih informacij. 

<i>Ustvarjanje predstavitve na verigi blokov prikazuje <b>Video #04: https://youtu.be/NGxVMH1qdb8</b></i>

### Preverjanje cepilnih potrdil
Preverjanje cepilnih potrdil oz. preverljivih poverilnic lahko izvaja preverjevalec na spletnem naslovu [http://127.0.0.1:3006/holders](http://127.0.0.1:3006/holders). Pred začetkom postopka preverjanja cepilnega potrdila, mora najprej pacient (imetnik) izkazati svojo istovetnost z veljavnim osebnim dokumentom. Dokazovanje cepljenja se nato lahko izvede na dva načina:

- Prek verige blokov: preverjevalec vnese pacientov DID. Če je pacient predhodno kreiral predstavitev za sodelujočega preverjevalca, sistem izpiše informacije o cepljenju v obliki kartice.

- Z uporabo komunikacije DID-to-DID: pacient uporabi svojo SSI denarnico (vtičnik) in skenira DID-to-DID povabilo preverjevalca, ki je izrisano v spletni aplikaciji. Izbere poverilnice, ki jih želi deliti in klikne gumb za pošiljanje. Podatki o cepljenju se izpišejo preverjevalcu na zaslon v obliki kartice.

<i>Postopek preverjanja cepilnega potrdila prek verige blokov prikazuje <b>Video #05: https://youtu.be/h3Uc1u-NUfE</b>, z uporabo komunikacije DID-to-DID pa <b>Video #06: https://youtu.be/7YqC99A7JI4</b></i>

### Preklic cepilnih potrdil
Cepilni center (izdajatelj) ima pravico preklicati že izdane poverilnice. Preklic je implementiran s preklicnim registrom in preklicno poverilnico. Cardano Vaccinator ob vsaki izdani cepilni kartici izpiše njeno veljavnost in izriše gumb za preklic. Ob kliku nanj, se preklicna poverilnica posodobi z novim preklicnim seznamom.

<i>Postopek preklica izdanega cepilnega potrdila prikazuje <b>Video #06: https://youtu.be/7ln2cNYJ18o</b></i>
