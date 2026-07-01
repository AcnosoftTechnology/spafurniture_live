import Link from "next/link";

export function SectionButton({ label, href }: { label: string; href: string }) {
  return (
    <div className="esth-client-btn-wrap">
      <Link href={href} className="esth-client-btn">
        {label}
      </Link>
    </div>
  );
}
