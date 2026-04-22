import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Uslovi korišćenja',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary px-4 py-6">
      <div className="mx-auto max-w-[430px]">

        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Nazad
        </Link>

        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-primary mb-2">
          Uslovi korišćenja
        </h1>
        <p className="text-sm text-text-muted mb-8">Poslednja izmena: 22. april 2026.</p>

        <div className="flex flex-col gap-6 text-sm text-text-secondary leading-relaxed">

          <section>
            <h2 className="font-semibold text-text-primary mb-2">1. Prihvatanje uslova</h2>
            <p>
              Korišćenjem aplikacije naSmenu prihvatate ove uslove u celosti. Ako se ne slažete sa uslovima, molimo vas da ne koristite aplikaciju.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">2. Opis usluge</h2>
            <p>
              naSmenu je alat za kreiranje i praćenje rasporeda smena zaposlenih. Usluga je namenjena vlasnicima i menadžerima ugostiteljskih objekata.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">3. Nalog korisnika</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Odgovorni ste za čuvanje lozinke i bezbednost naloga</li>
              <li>Nalog se ne može deliti sa trećim licima</li>
              <li>Obavezni ste da nas odmah obavestite o neovlašćenom pristupu</li>
              <li>Registracija zahteva validnu email adresu i odobrenje administratora</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">4. Dozvoljena upotreba</h2>
            <p className="mb-2">Aplikacija se koristi isključivo u zakonite poslovne svrhe. Zabranjeno je:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Unošenje lažnih ili obmanjujućih podataka</li>
              <li>Pokušaj neovlašćenog pristupa sistemu</li>
              <li>Korišćenje automatizovanih alata za preopterećenje servera</li>
              <li>Reverzni inženjering ili dekompajliranje aplikacije</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">5. Podaci o zaposlenima</h2>
            <p>
              Vi ste odgovorni za podatke o zaposlenima koje unosite u aplikaciju i za usklađenost sa važećim propisima o zaštiti podataka (GDPR) u pogledu podataka vaših zaposlenih.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">6. Dostupnost usluge</h2>
            <p>
              Nastojimo da aplikacija bude dostupna 24/7, ali ne garantujemo neprekidnost rada. Zadržavamo pravo na privremenu nedostupnost radi održavanja.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">7. Ograničenje odgovornosti</h2>
            <p>
              naSmenu se pruža &quot;takav kakav jeste&quot;. Ne odgovaramo za poslovne gubitke nastale usled nedostupnosti ili grešaka u aplikaciji.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">8. Gašenje naloga</h2>
            <p>
              Možete obrisati nalog u bilo kom trenutku putem podešavanja profila. Zadržavamo pravo da gasimo naloge koji krše ove uslove.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">9. Izmene uslova</h2>
            <p>
              O bitnim izmenama bićete obavešteni putem emaila pre nego što izmene stupe na snagu. Nastavak korišćenja aplikacije podrazumeva prihvatanje izmenjenih uslova.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">10. Kontakt</h2>
            <p>
              Za sva pitanja u vezi sa ovim uslovima ili politikom privatnosti, pišite nam na:{' '}
              <a href="mailto:podrska@nasmenu.app" className="text-accent-green hover:underline">
                podrska@nasmenu.app
              </a>
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <Link href="/privacy" className="text-sm text-accent-green hover:underline">
            Politika privatnosti →
          </Link>
        </div>

      </div>
    </div>
  )
}
