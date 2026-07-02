"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/utils";
import { EventReadMoreModal } from "@/components/site/events/event-read-more-modal";

export type ShowsEventItem = {
  id: string;
  title: string;
  imagePath: string;
  imageWebpPath?: string | null;
  readMoreUrl?: string | null;
  readMoreHtml?: string | null;
};

type EventListItemProps = {
  event: ShowsEventItem;
};

function hasReadMoreHtml(html?: string | null) {
  const trimmed = html?.trim();
  if (!trimmed) return false;
  const plain = trimmed.replace(/<[^>]*>/g, "").trim();
  return Boolean(plain || /<img[\s>]/i.test(trimmed));
}

export function EventListItem({ event }: EventListItemProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const hasLink = Boolean(event.readMoreUrl?.trim());
  const hasHtml = hasReadMoreHtml(event.readMoreHtml);
  const showReadMore = hasLink || hasHtml;

  return (
    <article className="esth-events-item">
      <h2 className="esth-events-item-title">{event.title}</h2>
      <hr className="esth-events-item-rule" />
      <div className="esth-events-item-body">
            <div className="esth-events-item-image-wrap">
              <Image
                src={mediaUrl(event.imageWebpPath ?? event.imagePath)}
                alt={event.title}
                width={360}
                height={203}
                className="esth-events-item-image"
                sizes="(max-width: 900px) 100vw, 360px"
              />
            </div>
            {showReadMore ? (
              <div className="esth-events-read-more-wrap">
                {hasLink ? (
                  <Link
                    href={event.readMoreUrl!}
                    className="esth-events-read-more"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read More
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className="esth-events-read-more esth-events-read-more--button"
                      onClick={() => setModalOpen(true)}
                    >
                      Read More
                    </button>
                    <EventReadMoreModal
                      open={modalOpen}
                      onOpenChange={setModalOpen}
                      title={event.title}
                      html={event.readMoreHtml!}
                    />
                  </>
                )}
              </div>
            ) : null}
      </div>
    </article>
  );
}
