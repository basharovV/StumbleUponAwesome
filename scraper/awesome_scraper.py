import scrapy
from scrapy.linkextractors import LinkExtractor
import re
import os
import urllib

pages_count = 0
urls_count = 0

awesome_readmes = []
all_urls = {}
invalid_urls_count = 0

class BlogSpider(scrapy.Spider):
    name = 'blogspider'
    start_urls = ['https://github.com/sindresorhus/awesome']
    print("Scraping...")

    def parse(self, response):
        if os.path.exists("categories.txt"):
            os.remove("categories.txt")
        if os.path.exists("urls.txt"):
            os.remove("urls.txt")

        global pages_count, urls_count

        # Set up the link extractor
        extractor = LinkExtractor(
            deny=[],
            deny_domains=["twitter.com"],
            restrict_xpaths=["//article"],
            restrict_css=[],
            unique=True
        )

        with open("categories.txt", "a") as urls_file:
            links = extractor.extract_links(response)
            for link in links:
                if (re.match(r'(.*readme$)', link.url)):
                    urls_file.write("\n" + str(link.url))
                    awesome_readmes.append(link.url)
                    pages_count += 1
                    yield scrapy.Request(link.url, callback=self.parse_readme_contents)

            print("Done. Number of links:" + str(len(links)))

    def parse_readme_contents(self, response):
        global pages_count, urls_count

        exclude_sites = [
            "https://github.com/sindresorhus/awesome",
            "github",
            "patreon",
            "coinbin"
            "saythanks",
            "https://travis-ci.org/"
        ]

        extractor = LinkExtractor(
            deny=[],
            deny_domains=[
                "twitter.com",
                "github.com",
                "githubusercontent.com",
                "coinbin.org",
                "patreon.com"
            ],
            restrict_xpaths=["//article"],
            restrict_css=[],
            unique=True
        )

        with open("urls.txt", "a") as urls_file:
            # urls_file.write("\nPAGE:" + response.css('title::text').get() + "|" + response.url)

            links = extractor.extract_links(response)
            for link in links:
                # Avoid internal hashlinks
                if (filter(lambda site_name: site_name in link.url, exclude_sites) and '#' not in link.url):
                    url = link.url
                    try:
                        urllib.request.urlopen(url)
                    except urllib.error.HTTPError as e:
                        # Return code error (e.g. 404, 501, ...)
                        print('HTTPError: {}'.format(e.code))
                        invalid_urls_count += 1
                    except urllib.error.URLError as e:
                        # Not an HTTP-specific error (e.g. connection refused)
                        print('URLError: {}'.format(e.reason))
                        invalid_urls_count += 1
                    else:
                        # Add if not duplicate
                        if (link.url not in all_urls):
                                all_urls[link.url] = 1
                                urls_file.write("\n" + str(url))
                                urls_count += 1

    def closed(self, reason):
        self.logger.debug(
            "Done processing awesome pages\nParsed %s urls from %s pages", urls_count, pages_count)
