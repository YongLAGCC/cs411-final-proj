from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score
import pandas as pd
import numpy as np
import re

##characters I have to scrub through for when re-doing the scrubbing and adding new movies: ø and a with accent on it

movies_df = pd.read_csv("new_movie_ratings_1960-2019.csv", encoding = "ISO-8859-1")

actors = np.array(movies_df["Actors"])

director = np.array(movies_df["Director"])

genre = np.array(movies_df["Genre"])

rating = np.array(movies_df["Rating"])

year = np.array(movies_df["Year"])

runtime = np.array(movies_df["Runtime"])

imdb_ratings = np.array(movies_df["Imdb"])

metascores = np.array(movies_df["Metascore"])

votes = np.array(movies_df["Votes"])

imdbID = np.array(movies_df["IMDb ID"])

names = np.array(movies_df["Movie"])

labels = np.zeros(actors.size)

movie_vector = []
for i in range(actors.size):
	string = ''
	string = str(genre[i])+','+str(actors[i])+','+str(director[i])+','+str(rating[i])+','+str(year[i])
	string = re.sub(r'\s+', '', string)
	movie_vector.append(string)


vectorizer = TfidfVectorizer(stop_words='english')
X = vectorizer.fit_transform(movie_vector)

#so far 160 is the best number but over clustering
#170 is too high 
true_k = 140
model = KMeans(n_clusters=true_k, init='k-means++', max_iter=100, n_init=1)
model.fit(X)

#print("Top terms per cluster:")
#order_centroids = model.clster_centers_.argsort()[:, ::-1]

#print(order_centroids,"centroids")
#terms = vectorizer.get_feature_names()
#for i in range(true_k):
#    print("Cluster %d:" % i),
#    for ind in order_centroids[i, :10]:
#        print(' %s' % terms[ind]),
#    print

for i in range(actors.size):
	Y = vectorizer.transform([movie_vector[i]])
	prediction = model.predict(Y)
	pred = np.array2string(prediction)
	pred = pred[1:]
	pred = pred[:-1]
	labels[i] = int(pred)
count = np.zeros(true_k)
for i in range(actors.size):
	for j in range(true_k):
		if(labels[i] == j):
			count[j] = count[j] + 1
print(count)
	#if(year[i] == 1980):
	#	count = count + 1
	#print(movie_vector[i])
#print (count)
#print(actors.size)

#print(actors[1966], "actors")
#print(genre[1966], "genre")
#print(rating[1966], "rating")
#print(year[1966], "year")
#print(director[1966], "director")

movie_ratings = pd.DataFrame({'Movie': names,
                       'Year': year,
                       'Imdb': imdb_ratings,
                       'Metascore': metascores,
                       'Votes': votes,
                       'Rating': rating,
                       'Genre': genre,
                       'Runtime': runtime,
                       'IMDb ID': imdbID,
                       'Director': director,
                       'Actors': actors,
                       'Cluster': labels

})

movie_ratings.to_csv('clustered_movie_ratings_1960-2019.csv')
