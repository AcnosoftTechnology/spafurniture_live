<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  exclude-result-prefixes="sitemap image">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #444;
            margin: 0;
            padding: 20px 30px 40px;
            font-size: 14px;
            line-height: 1.5;
          }
          h1 {
            font-size: 24px;
            font-weight: 400;
            margin: 0 0 12px;
            color: #222;
          }
          p {
            margin: 0 0 16px;
          }
          a {
            color: #c45c26;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 8px;
          }
          th, td {
            text-align: left;
            padding: 10px 12px;
            border-bottom: 1px solid #e5e5e5;
          }
          th {
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #ccc;
          }
          tr:nth-child(even) td {
            background: #fafafa;
          }
          .url-cell a {
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p>
          You can find more information about XML sitemaps on
          <a href="https://www.sitemaps.org/">sitemaps.org</a>.
        </p>

        <xsl:choose>
          <xsl:when test="sitemap:sitemapindex">
            <p>
              This XML Sitemap Index file contains
              <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/>
              sitemaps.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Sitemap</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td class="url-cell">
                      <a href="{sitemap:loc}">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <xsl:call-template name="format-date">
                        <xsl:with-param name="datetime" select="sitemap:lastmod"/>
                      </xsl:call-template>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:when>
          <xsl:otherwise>
            <p>
              This XML Sitemap contains
              <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
              URLs.
            </p>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Images</th>
                  <th>Last Mod.</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td class="url-cell">
                      <a href="{sitemap:loc}">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <xsl:value-of select="count(image:image)"/>
                    </td>
                    <td>
                      <xsl:call-template name="format-date">
                        <xsl:with-param name="datetime" select="sitemap:lastmod"/>
                      </xsl:call-template>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="format-date">
    <xsl:param name="datetime"/>
    <xsl:variable name="date" select="substring($datetime, 1, 10)"/>
    <xsl:variable name="time" select="substring($datetime, 12, 5)"/>
    <xsl:variable name="tz">
      <xsl:choose>
        <xsl:when test="contains($datetime, '+')">
          <xsl:value-of select="substring($datetime, string-length($datetime) - 5)"/>
        </xsl:when>
        <xsl:otherwise>+00:00</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:value-of select="concat($date, ' ', $time, ' ', $tz)"/>
  </xsl:template>
</xsl:stylesheet>
