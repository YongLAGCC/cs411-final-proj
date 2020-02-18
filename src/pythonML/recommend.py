import pandas as pd
import numpy as np
import sys
import operator
import os

# get the absolute path to the file so this script can be run from anywhere
(dirname, _) = os.path.split(os.path.abspath(sys.argv[0]))
cluster_file = os.path.join(dirname, "clustered_movie_ratings_1960-2019.csv")

movies_df = pd.read_csv(cluster_file, encoding = "ISO-8859-1")

clusters = np.array(movies_df["Cluster"])

imdbID = np.array(movies_df["IMDb ID"])

watched = sys.argv[1]
watched = np.array(watched.split(','))

watched = np.array(list(dict.fromkeys(watched)))

imdb_ratings = np.array(movies_df["Imdb"])

votes = np.array(movies_df["Votes"])

weighted = imdb_ratings

movies = list(zip(clusters,imdbID,weighted))

movies.sort(key = operator.itemgetter(0))

specificClusters = np.zeros(watched.size)
for i in range(watched.size):
	for j in range (clusters.size):
		if(movies[j][1] == watched[i]):
			specificClusters[i] = movies[j][0]
specificClusters = np.array(list(dict.fromkeys(specificClusters)))

recommend = []
for i in range(clusters.size):
	for j in range(specificClusters.size):
		if(movies[i][0] == specificClusters[j]):
			recommend.append(movies[i])


recommend.sort(key = operator.itemgetter(2), reverse=True)

finalRecommend = []
for i in range(len(recommend)):
	finalRecommend.append(recommend[i][1])

for movieID in watched:
	if movieID in finalRecommend:
		finalRecommend.remove(movieID)

movieList = ""
for item in finalRecommend:
	movieList += item + ','
movieList = movieList[:-1]
print(movieList)
