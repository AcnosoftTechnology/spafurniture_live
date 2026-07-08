import Image from "next/image";

type AboutBannerImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

/** Banner image — full width, natural height so the whole photo stays visible. */
export function AboutBannerImage({ src, alt, priority }: AboutBannerImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={2000}
      height={900}
      className="esth-about-team-image"
      sizes="100vw"
      priority={priority}
    />
  );
}
