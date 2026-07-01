import Image from "next/image";

type AboutBannerImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

/** Banner image — fills the full-width slide area. */
export function AboutBannerImage({ src, alt, priority }: AboutBannerImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="esth-about-team-image"
      sizes="100vw"
      priority={priority}
    />
  );
}
