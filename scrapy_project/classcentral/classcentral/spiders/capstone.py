from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
from time import sleep
import random
import requests

def clean(data):
    if (type(data) == type(None) or data == '' or len(data) == 0):
        return 'N/A'
    elif (isinstance(data, unicode)):
        data1 = data.strip().replace('\n','').replace('\r','')
        utf8Data = (unicodeToUtf8(data1)).replace("\'","'").replace('\xe2\x80\xa6','...').replace('\xc2\xa0','')
        return utf8Data
    else :
        utf8Array = unicodeToUtf8(''.join(data).replace(' and ',',').strip().replace('\n','').replace('\r',''))
        return utf8Array.strip().split(',')

def unicodeToUtf8(unicodeData):

    uni2utf8 = {
            ord('\xe2\x80\x8b'.decode('utf-8')): ord('.'),
           # ord('\xe2\xa0'.decode('utf-8')):  ord('.'),
            ord('\xe2\x80\x99'.decode('utf-8')): ord("'"),
            ord('\xe2\x80\x9c'.decode('utf-8')): ord('"'),
            ord('\xe2\x80\x9d'.decode('utf-8')): ord('"'),
            ord('\xe2\x80\x9e'.decode('utf-8')): ord('"'),
            ord('\xe2\x80\x9f'.decode('utf-8')): ord('"'),
            ord('\xc3\xa9'.decode('utf-8')): ord('e'),
            ord('\xe2\x80\x9c'.decode('utf-8')): ord('"'),
            ord('\xe2\x80\x93'.decode('utf-8')): ord('-'),
            ord('\xe2\x80\x92'.decode('utf-8')): ord('-'),
            ord('\xe2\x80\x94'.decode('utf-8')): ord('-'),
            ord('\xe2\x80\x94'.decode('utf-8')): ord('-'),
            ord('\xe2\x80\x98'.decode('utf-8')): ord("'"),
            ord('\xe2\x80\x9b'.decode('utf-8')): ord("'"),
            ord('\xe2\x80\xa2'.decode('utf-8')): ord("*"),

            ord('\xe2\x80\x90'.decode('utf-8')): ord('-'),
            ord('\xe2\x80\x91'.decode('utf-8')): ord('-'),

            ord('\xe2\x80\xb2'.decode('utf-8')): ord("'"),
            ord('\xe2\x80\xb3'.decode('utf-8')): ord("'"),
            ord('\xe2\x80\xb4'.decode('utf-8')): ord("'"),
            ord('\xe2\x80\xb5'.decode('utf-8')): ord("'"),
            ord('\xe2\x80\xb6'.decode('utf-8')): ord("'"),
            ord('\xe2\x80\xb7'.decode('utf-8')): ord("'"),

            ord('\xe2\x81\xba'.decode('utf-8')): ord("+"),
            ord('\xe2\x81\xbb'.decode('utf-8')): ord("-"),
            ord('\xe2\x81\xbc'.decode('utf-8')): ord("="),
            ord('\xe2\x81\xbd'.decode('utf-8')): ord("("),
            ord('\xe2\x81\xbe'.decode('utf-8')): ord(")"),

                            }
    return unicodeData.translate(uni2utf8).encode('utf-8')



class CapstoneSpider(CrawlSpider):
    name = 'capstone'
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

    rules = (Rule(LinkExtractor(deny_domains = ('google.com', 'facebook.com', 'twitter.com', 'instagram.com'), allow = ('course'), deny = ('review-id')), callback = 'parse_page', follow = True),)

    accepted_subjects = [
    'Artificial Intelligence','Algorithms and Data Structures', 'Internet of Things','Information Technology', 'Cybersecurity',
    'Computer Networking', 'Machine Learning', 'DevOps', 'Deep Learning', 'Blockchain and Cryptocurrency', 'Bioinformatics',
    'Big Data',  'Data Mining', 'Data Analysis', 'Data Visualization', 'Mobile Development',  'Web Development', 'Databases',
     'Android Development', 'iOS Development', 'Game Development', 'Programming Languages', 'Software Development',
     'Computer Science', 'Data Science', 'Programming']

    accepted_urls = []




    def parse_page(self, response):
        sleep(random.randrange(1,3))

        split_url = (response.url).split('?')
        unique_url = split_url[0]

        subject_check = clean(response.xpath('//strong[text()="Subject"]/following-sibling::a/text()').extract_first())
        language_check = clean(response.xpath('//strong[text()="Language"]/following-sibling::a/text()').extract_first())

        if (subject_check in self.accepted_subjects and unique_url not in self.accepted_urls and language_check == "English"):
            self.accepted_urls.append(unique_url)

            title = clean(response.xpath('//*[@id = "course-title"]/text()').extract_first())
            partner = clean(response.xpath('//*[@class = "text--charcoal hover-text--underline"]/text()').extract_first())
            platform = clean(response.xpath('//*[@class = "text--charcoal text--italic hover-text--underline"]/text()').extract_first())
            overview = clean(''.join(response.xpath('//*[@data-expand-article-target = "overview"]//text()').extract()))
            provider = clean(response.xpath('//strong[text()="Provider"]/following-sibling::a/text()').extract_first())
            subject = clean(response.xpath('//strong[text()="Subject"]/following-sibling::a/text()').extract_first())
            cost = clean(response.xpath('//strong[text()="Cost"]/following-sibling::span/text()').extract_first())
            session = clean(response.xpath('//strong[text()="Session"]/following-sibling::a/text()').extract_first())
            language = clean(response.xpath('//strong[text()="Language"]/following-sibling::a/text()').extract_first())
            start_date = clean(response.xpath('//strong[text()="Start Date"]/following-sibling::span/select/option/text()').extract_first())
            effort = clean(response.xpath('//strong[text()="Effort"]/following-sibling::span/text()').extract_first())
            duration = clean(response.xpath('//strong[text()="Duration"]/following-sibling::span/text()').extract_first())
            instructors = clean(response.xpath('//*[@class="col width-100 text-2 medium-up-text-1"]/text()').extract())
            syllabus = clean(''.join(response.xpath('//*[@data-expand-article-target = "syllabus"]/.//text()').extract()))
            interestedStudents = clean(response.xpath('//strong[@class = "text-4 medium-up-text-3 text--bold text--charcoal"]/text()').extract_first())
            numOfReviews = clean("".join(response.xpath('//a[@id = "read-reviews"]/text()').extract()).strip())


            providerURL = clean(response.xpath('//*[@id = "btnProviderCoursePage"]/@href').extract_first())
            hdr = {'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64)', 'Referer' : 'http://www.google.com/'}
            res = requests.get(providerURL, headers = hdr)
            providerLongURL = res.url
            providerLongURLArray = providerLongURL.split("?")
            providerURL = clean(providerLongURLArray[0])

            tagList = []
            for element in response.xpath('//*[@class = "block medium-up-inline-block btn-gray btn--medium text--normal margin-bottom-xsmall medium-up-margin-right-xsmall"]/text()').extract():
                tagList.append((element.strip()).encode('utf-8'))

            if(len(tagList) == 0):
                tagList = 'N/A'

            rating = 0.0
            for star in response.xpath('//*[@class = "review-rating "]/i/@class').extract():
                check = star.encode('utf-8')
                if (check == 'icon-star icon--xxsmall'):
                    rating = rating + 1.0
                elif (check == 'icon-star-half icon--xxsmall'):
                    rating = rating + 0.5
                else:
                    rating = rating + 0.0

            relatedCourses = []
            for partialUrl in response.xpath('//*[@class = "text--charcoal text-2 medium-up-text-1 text--bold block course-name"]/@href').extract():
                partialUrlUTF8 = partialUrl.encode('utf-8')
                relatedCourses.append('https://www.classcentral.com' + partialUrlUTF8)


            yield {
            'URL': unique_url,
            'Title': title,
            'Partner': partner,
            'Provider': provider,
            'ProviderURL': providerURL,
            'Subject' : subject,
            'Overview' : overview,
            'Syllabus' : syllabus,
            'Cost' : cost,
            'Session' : session,
            'Language' : language,
            'Start Date' : start_date,
            'Effort' : effort,
            'Duration' : duration,
            'Instructors' : instructors,
            'CC_Tags': tagList,
            'CC_Interested_Students': interestedStudents,
            'CC_Rating' : rating,
            'CC_Number_Of_Reviews' : numOfReviews,
            'CC_Related_Courses' : relatedCourses
            }