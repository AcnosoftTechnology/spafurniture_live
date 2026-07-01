"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Globe, ImageIcon, Link2, Mail, Map, RefreshCw, Send, Server, Settings2, Sparkles, Braces } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { MediaField, type MediaFieldValue } from "@/components/admin/cms/media-field";
import { NavigationEditor } from "@/components/admin/settings/navigation-editor";
import { adminApiUrl, getBaseUrl, mediaUrl } from "@/lib/utils";
import type { AdminSettingsEditorData } from "@/features/settings/get-settings-data";
import type { SiteConfig } from "@/features/settings/schemas/site-config.schema";
import type { SitemapMeta } from "@/features/seo/sitemap/sitemap-meta";

function pathToMedia(path: string, mediaId?: string | null): MediaFieldValue | null {
  if (!path?.trim()) return null;
  return { path, mediaId: mediaId ?? null };
}

function brandingField(
  branding: NonNullable<SiteConfig["branding"]>,
  key: "siteLogoPath" | "faviconPath" | "adminLogoPath" | "shippingLogoPath" | "footerLogoPath",
  mediaIdKey: "siteLogoMediaId" | "faviconMediaId" | "adminLogoMediaId" | "shippingLogoMediaId" | "footerLogoMediaId",
  media: MediaFieldValue | null,
) {
  return {
    ...branding,
    [key]: media?.path ?? "",
    [mediaIdKey]: media?.mediaId ?? null,
  };
}

function updateEmail(payload: AdminSettingsEditorData, patch: Partial<AdminSettingsEditorData["site"]["email"]>) {
  return {
    ...payload,
    site: {
      ...payload.site,
      email: { ...payload.site.email, ...patch },
    },
  };
}

export function SettingsEditor({ initialData }: { initialData: AdminSettingsEditorData }) {
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState("");
  const [payload, setPayload] = useState(initialData);
  const [sitemapMeta, setSitemapMeta] = useState<SitemapMeta | null>(initialData.sitemapMeta);
  const siteBaseUrl = getBaseUrl();

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      const [settingsRes, navRes, schemaRes] = await Promise.all([
        fetch(adminApiUrl("/api/v1/admin/settings"), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload.site),
        }),
        fetch(adminApiUrl("/api/v1/admin/navigation"), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: payload.navigation }),
        }),
        fetch(adminApiUrl("/api/v1/admin/settings/schema"), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload.siteSchema),
        }),
      ]);

      const settingsJson = (await settingsRes.json()) as {
        error?: { message?: string };
        data?: AdminSettingsEditorData["site"];
      };
      const navJson = (await navRes.json()) as { error?: { message?: string }; data?: AdminSettingsEditorData["navigation"] };
      const schemaJson = (await schemaRes.json()) as {
        error?: { message?: string };
        data?: AdminSettingsEditorData["siteSchema"];
      };

      if (!settingsRes.ok) throw new Error(settingsJson.error?.message ?? "Failed to save settings");
      if (!navRes.ok) throw new Error(navJson.error?.message ?? "Failed to save navigation");
      if (!schemaRes.ok) throw new Error(schemaJson.error?.message ?? "Failed to save schema settings");

      setPayload((prev) => ({
        ...prev,
        site: settingsJson.data ?? prev.site,
        navigation: navJson.data ?? prev.navigation,
        siteSchema: schemaJson.data ?? prev.siteSchema,
      }));

      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [payload]);

  const testSmtp = useCallback(async () => {
    setTestingEmail(true);
    try {
      const res = await fetch(adminApiUrl("/api/v1/admin/settings/test-email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.site.email,
          testTo: testEmailTo.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { error?: { message?: string }; data?: { sentTo?: string } };
      if (!res.ok) throw new Error(json.error?.message ?? "SMTP test failed");
      toast.success(`Test email sent to ${json.data?.sentTo ?? "recipient"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "SMTP test failed");
    } finally {
      setTestingEmail(false);
    }
  }, [payload.site.email, testEmailTo]);

  const generateSitemap = useCallback(async () => {
    setGeneratingSitemap(true);
    try {
      const res = await fetch(adminApiUrl("/api/v1/admin/settings/generate-sitemap"), {
        method: "POST",
      });
      const json = (await res.json()) as {
        error?: { message?: string };
        data?: SitemapMeta;
      };
      if (!res.ok) throw new Error(json.error?.message ?? "Sitemap generation failed");
      if (json.data) setSitemapMeta(json.data);
      const total = json.data?.counts.total ?? "?";
      toast.success(`Sitemap generated (${total} URLs)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sitemap generation failed");
    } finally {
      setGeneratingSitemap(false);
    }
  }, []);

  const { site } = payload;
  const email = site.email;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-gradient-to-r from-stone-900 to-stone-800 p-5 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-300">
            <Settings2 className="h-3.5 w-3.5" />
            Site configuration
          </div>
          <h2 className="mt-1 text-lg font-semibold">Global settings</h2>
          <p className="mt-1 max-w-xl text-sm text-stone-300">
            Logo, favicon, contact details, and navigation — all managed here without JSON editing.
          </p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="bg-white text-stone-900 hover:bg-stone-100">
          {saving ? "Saving..." : "Save all changes"}
        </Button>
      </div>

      <Tabs defaultValue="branding">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger value="branding" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ImageIcon className="h-3.5 w-3.5" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Globe className="h-3.5 w-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Mail className="h-3.5 w-3.5" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Server className="h-3.5 w-3.5" />
            Email / SMTP
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Link2 className="h-3.5 w-3.5" />
            Social
          </TabsTrigger>
          <TabsTrigger value="navigation" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Link2 className="h-3.5 w-3.5" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Features
          </TabsTrigger>
          <TabsTrigger value="schema" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Braces className="h-3.5 w-3.5" />
            Schema
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Map className="h-3.5 w-3.5" />
            Sitemap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-900">Public site logos</h3>
              <p className="mb-4 mt-1 text-xs text-stone-500">Shown on the live website header and footer.</p>
              <div className="space-y-5">
                <MediaField
                  label="Site logo"
                  value={pathToMedia(site.branding.siteLogoPath, site.branding.siteLogoMediaId)}
                  onChange={(media) =>
                    setPayload({
                      ...payload,
                      site: {
                        ...site,
                        branding: brandingField(site.branding, "siteLogoPath", "siteLogoMediaId", media),
                      },
                    })
                  }
                  previewClassName="h-16 w-48"
                />
                <MediaField
                  label="Worldwide shipping badge"
                  value={pathToMedia(site.branding.shippingLogoPath, site.branding.shippingLogoMediaId)}
                  onChange={(media) =>
                    setPayload({
                      ...payload,
                      site: {
                        ...site,
                        branding: brandingField(site.branding, "shippingLogoPath", "shippingLogoMediaId", media),
                      },
                    })
                  }
                  previewClassName="h-14 w-40"
                />
                <MediaField
                  label="Footer logo"
                  value={pathToMedia(site.branding.footerLogoPath, site.branding.footerLogoMediaId)}
                  onChange={(media) =>
                    setPayload({
                      ...payload,
                      site: {
                        ...site,
                        branding: brandingField(site.branding, "footerLogoPath", "footerLogoMediaId", media),
                      },
                    })
                  }
                  previewClassName="h-14 w-36"
                />
              </div>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-stone-900">Admin & browser</h3>
              <p className="mb-4 mt-1 text-xs text-stone-500">Favicon appears in browser tabs; admin logo in the CMS sidebar.</p>
              <div className="space-y-5">
                <MediaField
                  label="Favicon"
                  value={pathToMedia(site.branding.faviconPath, site.branding.faviconMediaId)}
                  onChange={(media) =>
                    setPayload({
                      ...payload,
                      site: {
                        ...site,
                        branding: brandingField(site.branding, "faviconPath", "faviconMediaId", media),
                      },
                    })
                  }
                  previewClassName="h-12 w-12"
                />
                <MediaField
                  label="Admin panel logo"
                  value={pathToMedia(site.branding.adminLogoPath, site.branding.adminLogoMediaId)}
                  onChange={(media) =>
                    setPayload({
                      ...payload,
                      site: {
                        ...site,
                        branding: brandingField(site.branding, "adminLogoPath", "adminLogoMediaId", media),
                      },
                    })
                  }
                  previewClassName="h-12 w-36"
                />
              </div>

              <div className="mt-6 rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-medium text-stone-600">Live preview</p>
                <div className="mt-3 flex items-center gap-3">
                  {site.branding.faviconPath ? (
                    <Image
                      src={mediaUrl(site.branding.faviconPath)}
                      alt="Favicon preview"
                      width={32}
                      height={32}
                      className="rounded border bg-white object-contain"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded border bg-white text-[10px] text-stone-400">?</div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-stone-800">{site.name || "Site name"}</p>
                    <p className="text-xs text-stone-500">Browser tab preview</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="general" className="mt-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Site name</Label>
              <Input
                value={site.name}
                onChange={(e) => setPayload({ ...payload, site: { ...site, name: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={site.tagline}
                onChange={(e) => setPayload({ ...payload, site: { ...site, tagline: e.target.value } })}
              />
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Header CTA label</Label>
              <Input
                value={site.header.exploreCtaLabel}
                onChange={(e) =>
                  setPayload({
                    ...payload,
                    site: { ...site, header: { ...site.header, exploreCtaLabel: e.target.value } },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Header CTA link</Label>
              <Input
                value={site.header.exploreCtaHref}
                onChange={(e) =>
                  setPayload({
                    ...payload,
                    site: { ...site, header: { ...site.header, exploreCtaHref: e.target.value } },
                  })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="mt-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm text-stone-500">
            Shown on the Contact Us page (company name, address, map). The map uses the address below.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Business name</Label>
              <Input
                value={site.contact.businessName}
                placeholder="ESTHETICA SPA AND SALON RESOURCES PVT. LTD"
                onChange={(e) =>
                  setPayload({
                    ...payload,
                    site: { ...site, contact: { ...site.contact, businessName: e.target.value } },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={site.contact.email}
                onChange={(e) =>
                  setPayload({ ...payload, site: { ...site, contact: { ...site.contact, email: e.target.value } } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={site.contact.phone}
                onChange={(e) =>
                  setPayload({ ...payload, site: { ...site, contact: { ...site.contact, phone: e.target.value } } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={site.contact.whatsapp}
                onChange={(e) =>
                  setPayload({ ...payload, site: { ...site, contact: { ...site.contact, whatsapp: e.target.value } } })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Textarea
                rows={2}
                value={site.contact.address}
                onChange={(e) =>
                  setPayload({ ...payload, site: { ...site, contact: { ...site.contact, address: e.target.value } } })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-stone-900">Enable outbound email</p>
              <p className="text-xs text-stone-500">
                When on, enquiry thank-you and admin notification emails use the SMTP settings below.
              </p>
            </div>
            <Switch
              checked={email.enabled}
              onCheckedChange={(checked) => setPayload(updateEmail(payload, { enabled: checked }))}
            />
          </div>

          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-900">SMTP server</h3>
            <p className="mb-4 mt-1 text-xs text-stone-500">
              Use your hosting or Gmail / Zoho / SendGrid SMTP credentials.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>SMTP host</Label>
                <Input
                  placeholder="smtp.example.com"
                  value={email.smtpHost}
                  onChange={(e) => setPayload(updateEmail(payload, { smtpHost: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP port</Label>
                <Input
                  type="number"
                  placeholder="587"
                  value={email.smtpPort}
                  onChange={(e) =>
                    setPayload(updateEmail(payload, { smtpPort: Number(e.target.value) || 587 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP username</Label>
                <Input
                  value={email.smtpUser}
                  onChange={(e) => setPayload(updateEmail(payload, { smtpUser: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP password</Label>
                <Input
                  type="password"
                  placeholder={email.smtpPassConfigured ? "Saved — leave blank to keep" : "Enter password"}
                  value={email.smtpPass}
                  onChange={(e) =>
                    setPayload(
                      updateEmail(payload, {
                        smtpPass: e.target.value,
                        smtpPassConfigured: e.target.value ? true : email.smtpPassConfigured,
                      }),
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-3 md:col-span-2">
                <div>
                  <p className="text-sm font-medium text-stone-800">Use SSL/TLS (port 465)</p>
                  <p className="text-xs text-stone-500">Off for STARTTLS on port 587.</p>
                </div>
                <Switch
                  checked={email.smtpSecure}
                  onCheckedChange={(checked) => setPayload(updateEmail(payload, { smtpSecure: checked }))}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-900">Sender &amp; notifications</h3>
            <p className="mb-4 mt-1 text-xs text-stone-500">
              From address is used for all outgoing mail. Admin/CC fields receive enquiry alerts.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>From email</Label>
                <Input
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  value={email.fromEmail}
                  onChange={(e) => setPayload(updateEmail(payload, { fromEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>From name</Label>
                <Input
                  value={email.fromName}
                  onChange={(e) => setPayload(updateEmail(payload, { fromName: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Admin notification emails (TO)</Label>
                <Textarea
                  rows={2}
                  placeholder="sales@example.com, admin@example.com"
                  value={email.adminEmails}
                  onChange={(e) => setPayload(updateEmail(payload, { adminEmails: e.target.value }))}
                />
                <p className="text-xs text-stone-500">Comma-separated. Falls back to Contact email if empty.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>CC emails (optional)</Label>
                <Textarea
                  rows={2}
                  placeholder="manager@example.com"
                  value={email.ccEmails}
                  onChange={(e) => setPayload(updateEmail(payload, { ccEmails: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-stone-200 p-3">
                <div>
                  <p className="text-sm font-medium text-stone-900">Thank-you email to user</p>
                  <p className="text-xs text-stone-500">Sent to the person who submitted the enquiry.</p>
                </div>
                <Switch
                  checked={email.sendUserThankYou}
                  onCheckedChange={(checked) => setPayload(updateEmail(payload, { sendUserThankYou: checked }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-stone-200 p-3">
                <div>
                  <p className="text-sm font-medium text-stone-900">Admin enquiry alert</p>
                  <p className="text-xs text-stone-500">Notifies admin/CC with full enquiry details.</p>
                </div>
                <Switch
                  checked={email.sendAdminNotification}
                  onCheckedChange={(checked) =>
                    setPayload(updateEmail(payload, { sendAdminNotification: checked }))
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5">
            <h3 className="text-sm font-semibold text-stone-900">Test SMTP</h3>
            <p className="mt-1 text-xs text-stone-500">
              Save settings first if you changed them, or test with the values currently in this form.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[240px] flex-1 space-y-2">
                <Label>Send test to</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={testEmailTo}
                  onChange={(e) => setTestEmailTo(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" onClick={testSmtp} disabled={testingEmail || !email.enabled}>
                <Send className="mr-2 h-4 w-4" />
                {testingEmail ? "Sending..." : "Send test email"}
              </Button>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="social" className="mt-4 space-y-3">
          {site.social.map((link, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <Input
                value={link.platform}
                placeholder="Platform (facebook, instagram...)"
                className="h-9 max-w-[180px] text-sm"
                onChange={(e) => {
                  const social = [...site.social];
                  social[index] = { ...link, platform: e.target.value };
                  setPayload({ ...payload, site: { ...site, social } });
                }}
              />
              <Input
                value={link.href}
                placeholder="https://..."
                className="h-9 min-w-[200px] flex-1 font-mono text-sm"
                onChange={(e) => {
                  const social = [...site.social];
                  social[index] = { ...link, href: e.target.value };
                  setPayload({ ...payload, site: { ...site, social } });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setPayload({
                    ...payload,
                    site: { ...site, social: site.social.filter((_, i) => i !== index) },
                  })
                }
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPayload({
                ...payload,
                site: { ...site, social: [...site.social, { platform: "", href: "" }] },
              })
            }
          >
            Add social link
          </Button>
        </TabsContent>

        <TabsContent value="navigation" className="mt-4">
          <NavigationEditor
            items={payload.navigation}
            onChange={(navigation) => setPayload({ ...payload, navigation })}
          />
        </TabsContent>

        <TabsContent value="features" className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-stone-900">Product reviews</p>
              <p className="text-xs text-stone-500">Allow customers to submit product reviews.</p>
            </div>
            <Switch
              checked={site.features.productReviews}
              onCheckedChange={(checked) =>
                setPayload({
                  ...payload,
                  site: { ...site, features: { ...site.features, productReviews: checked } },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-stone-900">Blog comments</p>
              <p className="text-xs text-stone-500">Enable moderated comments on blog posts.</p>
            </div>
            <Switch
              checked={site.features.blogComments}
              onCheckedChange={(checked) =>
                setPayload({
                  ...payload,
                  site: { ...site, features: { ...site.features, blogComments: checked } },
                })
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="schema" className="mt-4 space-y-4">
          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-900">Global site schema (JSON-LD)</h3>
            <p className="mt-1 text-xs text-stone-500">
              Paste Organization, LocalBusiness, WebSite, or a combined <code className="text-[10px]">@graph</code> here.
              When filled, auto-generated Organization schema is disabled on every page. Contact page auto LocalBusiness
              is also skipped to avoid duplicates. Leave empty to use automatic schema from site settings.
            </p>
            <Textarea
              rows={16}
              className="mt-4 font-mono text-[11px]"
              placeholder={`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Esthetica Spa Furniture",
      "url": "https://www.spafurniture.in/"
    },
    {
      "@type": "LocalBusiness",
      "name": "Esthetica Spa Furniture",
      "telephone": "+91-..."
    }
  ]
}`}
              value={payload.siteSchema.globalSchemaJson}
              onChange={(e) =>
                setPayload((prev) => ({
                  ...prev,
                  siteSchema: { ...prev.siteSchema, globalSchemaJson: e.target.value },
                }))
              }
            />
          </section>
        </TabsContent>

        <TabsContent value="sitemap" className="mt-4 space-y-4">
          <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-900">XML Sitemaps</h3>
            <p className="mt-1 text-xs text-stone-500">
              Regenerate sitemap files after adding or updating posts, products, or pages. Files are written to the
              site root and match the Yoast-style index + sub-sitemap structure.
            </p>

            {sitemapMeta ? (
              <div className="mt-4 rounded-lg border border-stone-100 bg-stone-50 p-3 text-xs text-stone-600">
                <p>
                  <span className="font-medium text-stone-800">Last generated:</span>{" "}
                  {new Date(sitemapMeta.generatedAt).toLocaleString()}
                </p>
                <p className="mt-1">
                  Posts: {sitemapMeta.counts.posts} · Pages: {sitemapMeta.counts.pages} · Products:{" "}
                  {sitemapMeta.counts.products} · Total: {sitemapMeta.counts.total}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-xs text-amber-700">
                No sitemap generated yet. Click the button below to create sitemap files.
              </p>
            )}

            <ul className="mt-4 space-y-2 text-sm">
              {[
                { label: "Main index", path: "/sitemap.xml" },
                { label: "Sitemap index", path: "/sitemap_index.xml" },
                { label: "Posts", path: "/post-sitemap.xml" },
                { label: "Pages", path: "/page-sitemap.xml" },
                { label: "Products", path: "/products-sitemap.xml" },
              ].map((item) => (
                <li key={item.path}>
                  <span className="text-stone-500">{item.label}: </span>
                  <a
                    href={`${siteBaseUrl}${item.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[13px] text-amber-800 hover:underline"
                  >
                    {siteBaseUrl}
                    {item.path}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5">
            <h3 className="text-sm font-semibold text-stone-900">Generate sitemap</h3>
            <p className="mt-1 text-xs text-stone-500">
              Rebuilds sitemap.xml, sitemap_index.xml, post-sitemap.xml, page-sitemap.xml, and products-sitemap.xml
              from the latest published content.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={generateSitemap}
              disabled={generatingSitemap}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${generatingSitemap ? "animate-spin" : ""}`} />
              {generatingSitemap ? "Generating..." : "Generate sitemap"}
            </Button>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
