import scrapy
from scrapy.linkextractors import LinkExtractor
import re
import os

pages_count = 0
urls_count = 0

awesome_readmes = []

# Only write URLs 
class BlogSpider(scrapy.Spider):
    name = 'blogspider'
    start_urls = ['https://github.com/sindresorhus/awesome']
    print("Scraping...")
    def parse(self, response):
        if os.path.exists("categories.txt"):
            os.remove("categories.txt")
        if os.path.exists("urls2.txt"):
            os.remove("urls2.txt")
        
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
                    pages_count+=1
                    yield scrapy.Request(link.url, callback = self.parse_readme_contents)

            print("Done. Number of links:" + str(len(links)))
            
    def parse_readme_contents(self, response):
        global pages_count, urls_count

        exclude_sites = [
            "https://github.com/sindresorhus/awesome",
            "github",
            "patreon",
            "coinbin"
            "saythanks"
        ]

        extractor = LinkExtractor(
            deny=[],
            deny_domains=[
            "twitter.com",
             "github.com",
             "githubusercontent.com"
            ],
            restrict_xpaths=["//article"],
            restrict_css=[],
            unique=True
        )

        with open("urls2.txt", "a") as urls2_file:
            # urls2_file.write("\nPAGE:" + response.css('title::text').get() + "|" + response.url)

            links = extractor.extract_links(response)
            for link in links:
                
                # Was thinking to only have base paths and media links, but maybe there's some gems that would be missed out.
                # Don't want to filter too much just yet...

                # is_link_base_domain = re.match(r'^(https:\/\/)([^\/]+$)') # Match only the domain, no path
                # is_link_media = 

                if (filter(lambda site_name: site_name in link.url, exclude_sites) and '#' not in link.url):
                    urls2_file.write("\n" + str(link.url))
                    urls_count+=1

    def closed(self, reason):
        self.logger.debug("Done processing awesome pages\nParsed %s urls from %s pages", urls_count, pages_count)

