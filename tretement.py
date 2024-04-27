from datasets import load_dataset
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report

dataset = load_dataset("Abdou/dz-sentiment-yt-comments")

train_data = dataset['train']
test_data = dataset['test']


train_texts = train_data['text']
train_labels = train_data['label']
test_texts = test_data['text']
test_labels = test_data['label']


vectorizer = CountVectorizer()
train_features = vectorizer.fit_transform(train_texts)
test_features = vectorizer.transform(test_texts)

model = MultinomialNB()
model.fit(train_features, train_labels)

predicted_labels = model.predict(test_features)
print(classification_report(test_labels, predicted_labels))
