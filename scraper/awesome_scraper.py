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

IGNORED_EXTENSIONS = [
    # archives
    '7z', '7zip', 'bz2', 'rar', 'tar', 'tar.gz', 'xz', 'zip',

    # images
    'mng', 'pct', 'bmp', 'gif', 'jpg', 'jpeg', 'png', 'pst', 'psp', 'tif',
    'tiff', 'ai', 'drw', 'dxf', 'eps', 'ps', 'svg', 'cdr', 'ico',

    # audio
    'mp3', 'wma', 'ogg', 'wav', 'ra', 'aac', 'mid', 'au', 'aiff',

    # video
    '3gp', 'asf', 'asx', 'avi', 'mov', 'mp4', 'mpg', 'qt', 'rm', 'swf', 'wmv',
    'm4a', 'm4v', 'flv', 'webm',

    # office suites
    'xls', 'xlsx', 'ppt', 'pptx', 'pps', 'doc', 'docx', 'odt', 'ods', 'odg',
    'odp',

    # other
    'css', 'exe', 'bin', 'rss', 'dmg', 'iso', 'apk'
]
class BlogSpider(scrapy.Spider):
    name = 'blogspider'
    start_urls = ['https://github.com/sindresorhus/awesome']
    print("Scraping...")

    def parse(self, response):
        if os.path.exists("list_of_lists.txt"):
            os.remove("list_of_lists.txt")
        if os.path.exists("urls_with_descriptions.txt"):
            os.remove("urls_with_descriptions.txt")

        global pages_count, urls_count

        # Set up the link extractor
        extractor = LinkExtractor(
            deny=[],
            deny_domains=["twitter.com"],
            restrict_xpaths=["//article"],
            restrict_css=[],
            unique=True
        )

        with open("list_of_lists.txt", "a") as urls_file:
            links = extractor.extract_links(response)
            for link in links:
                if (re.match(r'(.*readme$)', link.url)):
                    urls_file.write("\n" + str(link.url))
                    awesome_readmes.append(link.url)
                    pages_count += 1
                    yield scrapy.Request(link.url, callback=self.parse_readme_contents, cb_kwargs=dict(list_url=link.url, list_name=link.text))

            print("Done. Number of links:" + str(len(links)))

    def parse_readme_contents(self, response, list_url, list_name):
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
            deny_extensions=IGNORED_EXTENSIONS,
            restrict_xpaths=["//article"],
            restrict_css=[],
            unique=True
        )

        with open("urls_with_descriptions.txt", "a") as urls_file:
            # urls_file.write("\nPAGE:" + response.css('title::text').get() + "|" + response.url)
            print("\rTotal urls: {}".format(len(all_urls)))

            links=extractor.extract_links(response)
            for link in links:
                # Avoid internal hashlinks
                if (filter(lambda site_name: site_name in link.url, exclude_sites) and '#' not in link.url):
                    url=link.url
                    if (link.url not in all_urls):
                        all_urls[link.url]=1
                        urls_file.write("\n{},{},{},{}".format(str(url), str(link.text).strip(), str(list_url), str(list_name).strip()))
                        urls_count += 1
                        
    def closed(self, reason):
        self.logger.debug(
            "Done processing awesome pages\nParsed %s urls from %s pages", urls_count, pages_count)
