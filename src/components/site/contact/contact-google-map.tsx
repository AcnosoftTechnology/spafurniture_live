// import { googleMapsEmbedUrl } from "@/lib/google-maps-embed";

// type ContactGoogleMapProps = {
//   address: string;
//   businessName: string;
// };

// export function ContactGoogleMap({ address, businessName }: ContactGoogleMapProps) {
//   const trimmed = address.trim();
//   if (!trimmed) return null;

//   const src = googleMapsEmbedUrl(trimmed);

//   return (
//     <section className="esth-contact-map" aria-label="Location map">
//        <iframe
//         src="https://www.google.com/maps/embed?pb=..."
//         width="100%"
//         height="450"
//         style={{ border: 0 }}
//         allowFullScreen
//         loading="lazy"
//         referrerPolicy="no-referrer-when-downgrade"
//       />
//     </section>
//   );
// }

type ContactGoogleMapProps = {
  address: string;
  businessName: string;
};

export function ContactGoogleMap({
  address,
  businessName,
}: ContactGoogleMapProps) {
  return (
    <section
      className="esth-contact-map"
      aria-label={`Map showing ${businessName}`}
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3039.6783581421937!2d76.9219579!3d28.374391999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d3dd0c0000041%3A0xdef398cb910ab6ec!2sEsthetica%20Spa%20%26%20Salon%20Resources%20Pvt%20Ltd.!5e1!3m2!1sen!2sin!4v1781586277221!5m2!1sen!2sin"
        width="100%"
        height="450"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title={`${businessName} location`}
      />
    </section>
  );
}