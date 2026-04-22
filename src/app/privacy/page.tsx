import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politika privatnosti',
}

export default function PrivacyPage() {
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
          Politika privatnosti
        </h1>
        <p className="text-sm text-text-muted mb-8">Poslednja izmena: 22. april 2026.</p>

        <div className="flex flex-col gap-6 text-sm text-text-secondary leading-relaxed">

          <section>
            <h2 className="font-semibold text-text-primary mb-2">1. Ko smo mi</h2>
            <p>
              naSmenu je aplikacija za upravljanje rasporedima smena namenjena vlasnicima kafića i ugostiteljskih objekata.
              Operater aplikacije je individualni developer/tim koji razvija ovu uslugu.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">2. Koji podaci se prikupljaju</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong className="text-text-primary">Nalog:</strong> email adresa, naziv kafića/lokala, šifrovana lozinka</li>
              <li><strong className="text-text-primary">Podaci o zaposlenima:</strong> ime zaposlenog, satnica, napomene — koje vi unosite</li>
              <li><strong className="text-text-primary">Rasporedi:</strong> smene po danima i sedmicama koje kreirate</li>
              <li><strong className="text-text-primary">Podešavanja:</strong> vremena smena, aktivirane funkcionalnosti</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">3. Svrha obrade podataka</h2>
            <p>Vaši podaci se koriste isključivo radi pružanja usluge — kreiranje i prikaz rasporeda smena. Podaci se ne prodaju, ne ustupaju niti koriste u marketinške svrhe.</p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">4. Gde se podaci čuvaju</h2>
            <p>
              Podaci su smešteni u Neon PostgreSQL bazi podataka, smeštanoj na serverima u EU (AWS eu-central-1).
              Prenos podataka je zaštićen TLS enkripcijom.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">5. Kolačići (Cookies)</h2>
            <p>
              Aplikacija koristi isključivo neophodne kolačiće za autentikaciju (JWT sesija via NextAuth.js).
              Ne koriste se analitički, reklamni niti kolačići trećih strana.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">6. Vaša prava (GDPR)</h2>
            <p className="mb-2">Kao korisnik imate pravo na:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Pristup vašim podacima</li>
              <li>Ispravku netačnih podataka (putem podešavanja profila)</li>
              <li>Brisanje naloga i svih podataka — dostupno u podešavanjima profila</li>
              <li>Prigovor na obradu podataka</li>
            </ul>
            <p className="mt-2">Za zahteve možete pisati na email koji se nalazi u uslovima korišćenja.</p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">7. Čuvanje podataka</h2>
            <p>Podaci se čuvaju dok je nalog aktivan. Nakon brisanja naloga, svi podaci se trajno i nepovratno brišu iz baze.</p>
          </section>

          <section>
            <h2 className="font-semibold text-text-primary mb-2">8. Izmene politike</h2>
            <p>O svim bitnim izmenama ove politike bićete obavešteni putem emaila ili obaveštenjem u aplikaciji.</p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <Link href="/terms" className="text-sm text-accent-green hover:underline">
            Uslovi korišćenja →
          </Link>
        </div>

      </div>
    </div>
  )
}
