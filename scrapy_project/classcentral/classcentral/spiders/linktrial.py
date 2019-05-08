from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
from time import sleep
import random

def clean(data):
        if (type(data) == type(None)):
                return 'N/A'
        elif (type(data) == type('String')):
                return data.strip().replace('\xa0','').replace('\r','').replace('\n','')
        else :
                return data.strip().split('and')


class LinktrialSpider(CrawlSpider):
    name = 'linktrial'
    allowed_domains = ['class-central.com','classcentral.com']
    start_urls = [
    'https://www.class-central.com/subject/cs/', 'https://www.classcentral.com/subject/ai', 'https://www.classcentral.com/subject/algorithms-and-data-structures',
    'https://www.classcentral.com/subject/internet-of-things', 'https://www.classcentral.com/subject/information-technology', 'https://www.classcentral.com/subject/cybersecurity',
    'https://www.classcentral.com/subject/computer-networking', 'https://www.classcentral.com/subject/machine-learning', 'https://www.classcentral.com/subject/devops',
    'https://www.classcentral.com/subject/deep-learning', 'https://www.classcentral.com/subject/blockchain-cryptocurrency', 'https://www.classcentral.com/subject/data-science',
    'https://www.classcentral.com/subject/bioinformatics', 'https://www.classcentral.com/subject/big-data', 'https://www.classcentral.com/subject/data-mining',
    'https://www.classcentral.com/subject/data-analysis', 'https://www.classcentral.com/subject/data-visualization', 'https://www.classcentral.com/subject/programming-and-software-development',
    'https://www.classcentral.com/subject/mobile-development', 'https://www.classcentral.com/subject/web-development', 'https://www.classcentral.com/subject/databases',
    'https://www.classcentral.com/subject/android-development', 'https://www.classcentral.com/subject/ios-development', 'https://www.classcentral.com/subject/game-development',
    'https://www.classcentral.com/subject/programming-languages', 'https://www.classcentral.com/subject/software-development', 'https://www.classcentral.com/subject/maths',
    'https://www.classcentral.com/subject/statistics', 'https://www.classcentral.com/subject/foundations-of-mathematics', 'https://www.classcentral.com/subject/calculus',
    'https://www.classcentral.com/subject/algebra-and-geometry']


    accepted_subjects = [
    'Artificial Intelligence','Algorithms and Data Structures', 'Internet of Things','Information Technology', 'Cybersecurity',
    'Computer Networking', 'Machine Learning', 'DevOps', 'Deep Learning', 'Blockchain and Cryptocurrency', 'Bioinformatics',
    'Big Data',  'Data Mining', 'Data Analysis', 'Data Visualization', 'Mobile Development',  'Web Development', 'Databases',
     'Android Development', 'iOS Development', 'Game Development', 'Programming Languages', 'Software Development',
     'Computer Science', 'Data Science', 'Programming']

    good_urls = []

    rules = (Rule(LinkExtractor(deny_domains = ('google.com', 'facebook.com', 'twitter.com', 'instagram.com'), allow = ('course'), deny = ('review-id')), callback = 'parse_page', follow = True),)


    def parse_page(self, response):
        sleep(random.randrange(1,3))

        split_url = (response.url).split('?')
        unique_url = split_url[0]

        sub_check = subject = clean(response.xpath('//strong[text()="Subject"]/following-sibling::a/text()').extract_first())

        if sub_check in self.accepted_subjects and unique_url not in self.good_urls:
            self.good_urls.append(unique_url)
            yield {'URL': unique_url}
        else:
           #yield {'URL REJECTED': response.url, 'REJECTED SUBJECT': sub_check}
            pass
