from flask import Flask, request, jsonify
import praw
from transformers import pipeline
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)
reddit = praw.Reddit(
    client_id='LChxVKKanHy2xEOwKnpDxQ',
    client_secret='RgtMN6iE-bkUi8wd6QbaQEiCM2SYCg',
    user_agent='Competitive-Judge236'
)
sentiment_model = pipeline(
    "sentiment-analysis",
    model="abdou/arabert-base-algerian",
    tokenizer="abdou/arabert-base-algerian"
)

def normalize_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text

@app.route('/analyze', methods=['GET'])
def analyze():
    search_query = request.args.get('query')
    if not search_query:
        return jsonify({
            'error': 'No query provided. Please specify a query.'
        }), 400

    limit = request.args.get('limit', default=10, type=int)
    if limit < 1:
        return jsonify({
            'error': 'Invalid limit value. Please specify a positive integer.'
        }), 400

    submissions = reddit.subreddit('all').search(search_query, limit=limit, time_filter='week')
    title_ratings = []
    recent_titles = []
    total_positive = 0
    total_negative = 0

    for submission in submissions:
        title = submission.title
        normalized_title = normalize_text(title)
        result = sentiment_model(normalized_title)
        label = result[0]['label']
        score = result[0]['score']

        if label == 'positive':
            total_positive += score
        elif label == 'negative':
            total_negative += score

        author_username = submission.author.name if submission.author else 'Unknown'
        author_profile_picture = submission.author.icon_img if submission.author and submission.author.icon_img else ''

        title_ratings.append({
            'title': title,
            'label': label,
            'score': score,
            'author': {
                'username': author_username,
                'profile_picture': author_profile_picture
            }
        })

        recent_titles.append(title)

    return jsonify({
        'title_ratings': title_ratings,
        'total_rating': {
            'positive': total_positive,
            'negative': total_negative
        },
        'recent_titles': recent_titles[-10:]
    })


if __name__ == '__main__':
    app.run(debug=True)
