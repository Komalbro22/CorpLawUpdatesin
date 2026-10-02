'use client'

type SponsoredSettingsProps = {
  isSponsored: boolean
  sponsorName: string
  contributorName: string
  holdExternalLinks: boolean
  hideFromListings: boolean
  noindex: boolean
  onIsSponsoredChange: (value: boolean) => void
  onSponsorNameChange: (value: string) => void
  onContributorNameChange: (value: string) => void
  onHoldExternalLinksChange: (value: boolean) => void
  onHideFromListingsChange: (value: boolean) => void
  onNoindexChange: (value: boolean) => void
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        className="mt-0.5 size-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
      />
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
    </label>
  )
}

export default function SponsoredSettings(props: SponsoredSettingsProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">Sponsored settings</h2>
        <p className="mt-1 text-xs text-slate-500">Use these controls for paid or guest placements. Editorial review and clear disclosure are still required.</p>
      </div>
      <div className="space-y-2.5">
        <Toggle
          checked={props.isSponsored}
          onChange={props.onIsSponsoredChange}
          label="Sponsored"
          description="Labels the article and displays the sponsored-content disclosure to readers."
        />
        {props.isSponsored && (
          <>
            <label className="block text-sm font-semibold text-slate-800">
              Sponsor name <span className="font-normal text-slate-500">(optional)</span>
              <input
                type="text"
                value={props.sponsorName}
                maxLength={200}
                onChange={event => props.onSponsorNameChange(event.target.value)}
                placeholder="Company or sponsor name"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Article author / guest contributor <span className="font-normal text-slate-500">(optional)</span>
              <input
                type="text"
                value={props.contributorName}
                maxLength={200}
                onChange={event => props.onContributorNameChange(event.target.value)}
                placeholder="Name to credit on the article"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </label>
            <Toggle
              checked={props.holdExternalLinks}
              onChange={props.onHoldExternalLinksChange}
              label="Hold external links"
              description="Displays external article links as text until this is unticked."
            />
          </>
        )}
        <Toggle
          checked={props.hideFromListings}
          onChange={props.onHideFromListingsChange}
          label="Hide from listings"
          description="Keeps the article URL available but omits it from public article lists and related links."
        />
        <Toggle
          checked={props.noindex}
          onChange={props.onNoindexChange}
          label="Noindex"
          description="Adds noindex, follow and excludes this article from the XML and news sitemaps."
        />
      </div>
    </section>
  )
}
