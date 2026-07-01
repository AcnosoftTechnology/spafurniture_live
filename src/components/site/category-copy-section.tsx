export function CategoryCopySection({ html }: { html: string }) {
  return (
    <section className="esth-products-copy-section" aria-label="Category information">
      <div className="esth-page-shell esth-page-shell-p-cate">
        <div
          className="esth-products-copy-inner esth-products-copy-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
