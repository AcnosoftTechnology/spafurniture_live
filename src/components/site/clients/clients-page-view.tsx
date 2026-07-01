import { EsthPageShell } from "@/components/site/layout/esth-page-shell";
import type { ClientsPageContent } from "@/features/clients/schemas/clients-content.schema";

export function ClientsPageView({ content }: { content: ClientsPageContent }) {
  return (
    <main className="esth-clients-page">
      <EsthPageShell className="esth-clients-shell">
        <header className="esth-clients-header">
          <p className="esth-clients-eyebrow">{content.intro.eyebrow}</p>
          <h1 className="esth-clients-title">{content.intro.title}</h1>
          <p className="esth-clients-intro">{content.intro.body}</p>
        </header>

        <div className="esth-clients-sections">
          {content.sections.map((section, index) => (
            <div key={index} className="esth-clients-block">
              <div className="esth-clients-columns">
              <ul className="esth-clients-list">
  {section.left.map((name, itemIndex) => (
    <li key={`l-${index}-${itemIndex}-${name}`}>
      {name}
    </li>
  ))}
</ul>

<ul className="esth-clients-list">
  {section.right.map((name, itemIndex) => (
    <li key={`r-${index}-${itemIndex}-${name}`}>
      {name}
    </li>
  ))}
</ul>
              </div>
              {index < content.sections.length - 1 ? (
                <hr className="esth-clients-divider" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>
      </EsthPageShell>
    </main>
  );
}
