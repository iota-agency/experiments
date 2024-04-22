import string

import nltk
import pandas as pd
from nltk import word_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist

spec_chars = string.punctuation + '\n\xa0«»\t—…–'

russian_stopwords = stopwords.words("russian")
russian_stopwords.extend(['это'])


def remove_chars_from_text(text, chars):
    return "".join([ch for ch in text if ch not in chars])


def join_all_titles(data):
    res = ''
    for i in range(len(data)):
        row = data.iloc[i]
        if type(row['title']) != str:
            continue
        res += '\n' + row['title']
    return res


def compute_frequent_words(data):
    text = join_all_titles(data)
    text = remove_chars_from_text(text, spec_chars)
    tokens = word_tokenize(text)
    freq_dict = FreqDist(nltk.Text([token.strip() for token in tokens if token not in russian_stopwords]))
    return freq_dict


def group_by(data, column: str):
    grouped = data.groupby(column)
    grouped_res = pd.DataFrame([], columns=[column, 'count', 'views', 'likes', 'comments', 'favorites', 'hits'])
    grouped_res[column] = grouped[column].first()
    grouped_res['count'] = grouped[column].count()
    grouped_res['views'] = grouped['views'].sum()
    grouped_res['likes'] = grouped['likes'].sum()
    grouped_res['comments'] = grouped['comments'].sum()
    grouped_res['favorites'] = grouped['favorites'].sum()
    grouped_res['hits'] = grouped['hits'].sum()
    grouped_res['avg_hits'] = grouped_res['hits'] / grouped_res['count']
    grouped_res['avg_views'] = grouped_res['views'] / grouped_res['count']
    grouped_res['avg_likes'] = grouped_res['likes'] / grouped_res['count']
    grouped_res['avg_comments'] = grouped_res['comments'] / grouped_res['count']
    grouped_res['avg_favorites'] = grouped_res['favorites'] / grouped_res['count']
    return grouped_res
