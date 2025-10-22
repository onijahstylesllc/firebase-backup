
'use client'

const companyLogos = ['QuantumLeap', 'ApexSphere', 'NexusCore', 'StellarForge', 'Vertex Inc.', 'NovaGen', 'BlueHorizon', 'Zenith Corp', 'Momentum AI', 'Innovate IO', 'Synergy Labs', 'TerraFirm']

export const TrustedBy = () => {
  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <p className="text-center text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-6">Trusted by the brands you trust</p>
        <div className="relative flex h-10 w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
          <div className="flex animate-marquee items-center">
            {[...companyLogos, ...companyLogos].map((logo, index) => (
              <p key={index} className="mx-8 flex-shrink-0 text-lg font-bold text-muted-foreground/60">{logo}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
