# -*- coding: utf-8 -*-
import scrapy

def clean(data):
	if (type(data) == type(None) or data == ''):
		return 'N/A'
	elif (type(data) == type('String')):
		return data.strip().replace('\xa0','').replace('\n','').replace('\r','')
	else :
		return ''.join(data).replace(' and ',',').strip().split(',')


class SingleSpider(scrapy.Spider):
    name = 'single'
    allowed_domains = ['class-central.com']
    start_urls = ['https://www.classcentral.com/course/edx-agile-software-development-6878']

    def parse(self, response):

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

    	# udacity_prereq = response.xpath('//*[@class = "degree-syllabus-preview__content--term-prereq ng-star-inserted"]/text()').extract_first()
    	# edx_prereq = page.xpath('//h4[@id = "prerequisites"]/following-sibling::div[@class = "mb-4"]/ul').extract_first().strip()
    	# udemy_prereq = ''.join(response.xpath('//ul[@class = "requirements__list"]/li/text()').extract())


    	#syllabus = []
    	#for element in response.xpath('//*[@data-expand-article-target = "syllabus"]/text()').extract():
    	#	syllabus.append(element.strip())
    	#syllabus = [i for i in syllabus if i != '']



    	yield {
        	'Title': title,
        	'Partner': partner,
        	'Provider': provider,
        	'Subject' : subject,
        	'Overview' : overview,
        	'Syllabus' : syllabus,
        	'Cost' : cost,
        	'Session' : session,
        	'Language' : language,
        	'Start Date' : start_date,
        	'Effort' : effort,
        	'Duration' : duration,
        	'Instructors' : instructors
        }
