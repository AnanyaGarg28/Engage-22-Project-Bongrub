import os
import pandas as pd
from flask import Flask, request
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from collections.abc import Iterable
import pickle

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello An!"

# weighted popularity model ..
qualifiedRecipes = pickle.load(open('qualified.pkl', 'rb'))
# category popularity model ..
categoryBasedRecommender = pickle.load(open('category.pkl', 'rb'))
# metadata based model
metadataBasedRecommender = pickle.load(open('metadata.pkl', 'rb'))
# dataset dump for algolia
datasetDump = pickle.load(open('datasetDump.pkl', 'rb'))

def weightedRating(x):
    v = x['Rating']
    R = x['AggregatedRating']
    return (v/(v+51.0) * R) + (51.0/(51.0+v) * 4.56) 

# popularity - already got the data of top 26 popular recipes in "qualifiedRecipes"
@app.route('/popularity')
def weightedRatingPopularity():
    return qualifiedRecipes.to_json()

# category - got the data in weightedPopularRecipes and now creating the route function
@app.route('/category', methods=['POST'])
def getCategoryWiseRecommendations():
    data = request.get_json()
    RecipeCategory = data['keyword']
    percentile = 0.85
    categorySpecificRecipes = categoryBasedRecommender[categoryBasedRecommender['Category'] == RecipeCategory]
    RatingCounts = categorySpecificRecipes[categorySpecificRecipes['Rating'].notnull()]['Rating'].astype('int')
    RatingAverages = categorySpecificRecipes[categorySpecificRecipes['AggregatedRating'].notnull()]['AggregatedRating'].astype('int')
    C = RatingAverages.mean()
    m = RatingCounts.quantile(percentile)
    
    qualified = categorySpecificRecipes[(categorySpecificRecipes['Rating'] >= m) & (categorySpecificRecipes['Rating'].notnull()) & (categorySpecificRecipes['AggregatedRating'].notnull())][['RecipeId', 'Name', 'Rating', 'AggregatedRating', 'ReviewCount']]
    qualified['Rating'] = qualified['Rating'].astype('int')
    qualified['AggregatedRating'] = qualified['AggregatedRating'].astype('int')

    qualified['wr'] = qualified.apply(lambda x: (x['Rating']/(x['Rating']+m) * x['AggregatedRating']) + (m/(m+x['Rating']) * C), axis=1)
    qualified = qualified.sort_values('wr', ascending=False).head(12)
    
    return qualified.to_json()

# metadata
termFrequency2 = TfidfVectorizer(analyzer='word',ngram_range=(1, 2),min_df=0, stop_words='english')
tfidMatrix2 = termFrequency2.fit_transform(metadataBasedRecommender['Metadata'])
cosineSimilarity2 = linear_kernel(tfidMatrix2, tfidMatrix2)

metadataBasedRecommender = metadataBasedRecommender.reset_index()
names2 = metadataBasedRecommender[['RecipeId', 'Name']]
indices2 = pd.Series(metadataBasedRecommender.index, index=metadataBasedRecommender['Name'])

@app.route('/metadata', methods=['POST'])
def getMetadataBasedRecommendations():
    data = request.get_json()
    title = data['keyword']
    idx = indices2[title]
    if isinstance(idx, Iterable):
      for i in idx:  
        similarityScores = sorted(list(enumerate(cosineSimilarity2[i])), key=lambda x: x[1], reverse=True)[1:13]
        break
    else:
        similarityScores = sorted(list(enumerate(cosineSimilarity2[idx])), key=lambda x: x[1], reverse=True)[1:13]
    recipeIndices = [i[0] for i in similarityScores]
    return names2.iloc[recipeIndices].to_json()

# content with ratings considered
contentBasedRecommender = metadataBasedRecommender

@app.route('/content', methods=['POST'])
def getContentBasedRecommendations():
    data = request.get_json()
    title = data['keyword']
    idx = indices2[title]

    if isinstance(idx, Iterable):
      recipeDump = pd.DataFrame()
      for i in idx:
        cnt = 0
        similarityScores = sorted(list(enumerate(cosineSimilarity2[i])) , key=lambda x: x[1], reverse=True)[1:26]
        recipeIndices = [i[0] for i in similarityScores]

        contentBasedRecommendedRecipes = contentBasedRecommender.iloc[recipeIndices][['RecipeId', 'Name', 'Rating', 'AggregatedRating']]
        ratingCounts = contentBasedRecommendedRecipes[contentBasedRecommendedRecipes['Rating'].notnull()]['Rating'].astype('int')
        ratingAverages = contentBasedRecommendedRecipes[contentBasedRecommendedRecipes['AggregatedRating'].notnull()]['AggregatedRating'].astype('int')
        C = ratingAverages.mean()
        m = ratingCounts.quantile(0.60)
        qualifiedRecipes2 = contentBasedRecommendedRecipes[(contentBasedRecommendedRecipes['Rating'] >= m) & (contentBasedRecommendedRecipes['Rating'].notnull()) & (contentBasedRecommendedRecipes['AggregatedRating'].notnull())]
        qualifiedRecipes2['Rating'] = qualifiedRecipes2['Rating'].astype('int')
        qualifiedRecipes2['AggregatedRating'] = qualifiedRecipes2['AggregatedRating'].astype('int')
        qualifiedRecipes2['wr'] = qualifiedRecipes2.apply(weightedRating, axis=1)
        qualifiedRecipes2 = qualifiedRecipes2.sort_values('wr', ascending=False).head(12)
        if cnt == 0:
          recipeDump = qualifiedRecipes2
        else:
          recipeDump.append(qualifiedRecipes2, ignore_index=True)
        cnt+=1
      recipeDump  = recipeDump.sort_values('wr', ascending=False).head(12)
      return recipeDump.to_json()

    else:
      similarityScores = sorted(list(enumerate(cosineSimilarity2[idx])) , key=lambda x: x[1], reverse=True)[1:26]
      recipeIndices = [i[0] for i in similarityScores]
      
      contentBasedRecommendedRecipes = contentBasedRecommender.iloc[recipeIndices][['RecipeId', 'Name', 'Rating', 'AggregatedRating']]
      ratingCounts = contentBasedRecommendedRecipes[contentBasedRecommendedRecipes['Rating'].notnull()]['Rating'].astype('int')
      ratingAverages = contentBasedRecommendedRecipes[contentBasedRecommendedRecipes['AggregatedRating'].notnull()]['AggregatedRating'].astype('int')
      C = ratingAverages.mean()
      m = ratingCounts.quantile(0.60)
      qualifiedRecipes2 = contentBasedRecommendedRecipes[(contentBasedRecommendedRecipes['Rating'] >= m) & (contentBasedRecommendedRecipes['Rating'].notnull()) & (contentBasedRecommendedRecipes['AggregatedRating'].notnull())]
      qualifiedRecipes2['Rating'] = qualifiedRecipes2['Rating'].astype('int')
      qualifiedRecipes2['AggregatedRating'] = qualifiedRecipes2['AggregatedRating'].astype('int')
      qualifiedRecipes2['wr'] = qualifiedRecipes2.apply(weightedRating, axis=1)
      qualifiedRecipes2 = qualifiedRecipes2.sort_values('wr', ascending=False).head(12)
      return qualifiedRecipes2.to_json()

# dataset dump for algolia
@app.route('/datasetDump')
def getDatasetDump():
    return datasetDump.to_json()

if __name__ == "__main__":
    osPort = os.getenv("PORT")
    if osPort == None:
        port = 5000
    else:
        port = int(osPort)
    app.run(host='0.0.0.0', port=port)
