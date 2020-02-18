from requests import get
url = 'https://www.imdb.com/search/title?release_date=2019&sort=boxoffice_gross_us,desc&page=1'
response = get(url)

#this is sorted by box office so gets rid of tv shows
#https://www.imdb.com/search/title?release_date=2019&sort=boxoffice_gross_us,desc&page=1

#this is sorted by imdb votes so it includes tv shows
#http://www.imdb.com/search/title?release_date=2017&sort=num_votes,desc&page=1

from bs4 import BeautifulSoup
html_soup = BeautifulSoup(response.text, 'html.parser')

movie_containers = html_soup.find_all('div', class_ = 'lister-item mode-advanced')

import pandas as pd

import time

import sys

import lxml.html

from IPython.core.display import clear_output

##from time import start_time

from time import sleep

from random import randint

##from time import timestart_time = time()

import warnings

# Redeclaring the lists to store data in
names = []
years = []
imdb_ratings = []
metascores = []
votes = []
rating = []
runtime = []
imdbID = []
genres = []
actors = []
directors = []

# Preparing the monitoring of the loop
start_time = time.time()
requests = 0

pages = [str(i) for i in range(1,3)]
years_url = [str(i) for i in range(1960,1990)]
headers = {"Accept-Language": "en-US, en;q=0.5"}



# For every year in the interval 1914-2019
for year_url in years_url:

    # For every page in the interval 1-10
    for page in pages:

        # Make a get request
        response = get('https://www.imdb.com/search/title?release_date=' + year_url +
        '&sort=boxoffice_gross_us,desc&page=' + page, headers = headers)

        #sort by votes
        #'http://www.imdb.com/search/title?release_date=' + year_url +
        #'&sort=num_votes,desc&page=' + page, headers = headers

        # Pause the loop
        sleep(randint(8,15))

        # Monitor the requests
        requests += 1
        elapsed_time = time.time() - start_time
        print('Request:{}; Frequency: {} requests/s'.format(requests, requests/elapsed_time))
        clear_output(wait = True)

        # Throw a warning for non-200 status codes
        if response.status_code != 200:
            warn('Request: {}; Status code: {}'.format(requests, response.status_code))

        # Break the loop if the number of requests is greater than expected
        if requests > 72:
            warn('Number of requests was greater than expected.')
            break

        # Parse the content of the request with BeautifulSoup
        page_html = BeautifulSoup(response.text, 'html.parser')

        # Select all the 50 movie containers from a single page
        mv_containers = page_html.find_all('div', class_ = 'lister-item mode-advanced')

        # For every movie of these 50
        for container in mv_containers:
            # If the movie has a Metascore, then:
            if (container.find('div', class_ = 'ratings-metascore') is not None) and (container.find('span', class_ = 'certificate') is not None):

                # Scrape the name
                name = container.h3.a.text
                names.append(name)

                # Scrape the year
                year = container.h3.find('span', class_ = 'lister-item-year text-muted unbold').text
                try:
                    year = year.str[-5:-1].astype(int)
                except:
                    year = year_url

                years.append(year)

                # Scrape the IMDB rating
                imdb = float(container.strong.text)
                imdb_ratings.append(imdb)

                # Scrape the IMDB id
                ids = container.find('span','rating-cancel').a['href'].split('/')[2]
                imdbID.append(ids)

                # Scrape the Metascore
                m_score = container.find('span', class_ = 'metascore').text
                metascores.append(int(m_score))

                # Scrape the number of votes
                vote = container.find('span', attrs = {'name':'nv'})['data-value']
                votes.append(int(vote))

                # Scrape the director
                director = container.find_all('p', class_ = '')[1].a.text
                directors.append(director)

                # Scrape the actors
                actor = container.find_all('p', class_ = '')[1]
                num = len(actor.find_all('a'))
                act = ""
                for i in range(num-1):
                    act = act + actor.find_all('a')[i+1].text
                    act = act + ","
                #actor = actor.find_all('a')[1].text + "," + actor.find_all('a')[2].text + "," + actor.find_all('a')[3].text + "," + actor.find_all('a')[4].text
                act = act[:-1]
                actors.append(act)

                # Scrape the gross

                # Scrape the genres
                genre = container.find('span', class_ = 'genre').text


                genres.append(genre.strip())


                # Scrape the viewing rating
                rate = container.find('span', class_ = 'certificate').text
                rating.append(rate)

                # Scrape the runtime
                run = container.find('span', class_ = 'runtime').text
                runtime.append(run)



movie_ratings = pd.DataFrame({'Movie': names,
                       'Year': years,
                       'Imdb': imdb_ratings,
                       'Metascore': metascores,
                       'Votes': votes,
                       'Rating': rating,
                       'Genre': genres,
                       'Runtime': runtime,
                       'IMDb ID': imdbID,
                       'Director': directors,
                       'Actors': actors

})


#movie_ratings.loc[:, 'Year'] = movie_ratings['Year'].str[-5:-1].astype(int)
movie_ratings.to_csv('movie_ratings_1960-1989.csv') 

