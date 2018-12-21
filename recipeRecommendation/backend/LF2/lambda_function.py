from __future__ import print_function
import boto3
import json
import argparse
import pprint
from botocore.vendored import requests #lambda do not have requests module
import sys
import urllib
import logging
import ast
from boto3 import resource

############################### python 3.6

try:
    # For Python 3.0 and later
    from urllib.error import HTTPError
    from urllib.parse import quote
    from urllib.parse import urlencode
except ImportError:
    # Fall back to Python 2's urllib2 and urllib
    from urllib2 import HTTPError
    from urllib import quote
    from urllib import urlencode
APP_ID = 
API_KEY=

API_HOST = 'https://api.edamam.com/search'

def request(host, url_params=None):

    url_params = url_params or {}

    response = requests.request('GET', host, params=url_params)
    return response.json()


def search(q, calories, diet):
    mincal = int(calories)-60
    maxcal = int(calories)+60
    calories = str(mincal)+'-'+str(maxcal)

    url_params = {
        'q': q,
        'app_id': APP_ID,
        'app_key': API_KEY,
        'from': 0,
        'to': 3,
        'calories': calories,
        'diet': diet
    }
    return request(API_HOST, url_params=url_params)

def query_api(q, calories, diet):

    response = search(q, calories, diet)

    return response

def lambda_handler(event, context):

    #try:
    slots = event['currentIntent']['slots']
    q = slots['q']
    calories = slots['calories']
    diet = slots['diet']
    sessionAttributes = event['sessionAttributes']
    message = ''
    try:

        query_result = query_api(q, calories, diet)
        print('queryMessage from sqs:')
        #pprint.pprint(query_result, indent=2)
        ori_message = query_result['hits']
        title = []
        for recipe in ori_message:
            fat = recipe['recipe']['totalNutrients']['FAT']
            sugar = recipe['recipe']['totalNutrients']['SUGAR']
            protein = recipe['recipe']['totalNutrients']['PROCNT']
            sodium = recipe['recipe']['totalNutrients']['NA']

            recipe['recipe']['totalNutrients'] = {
                'FAT': fat,
                'SUGAR': sugar,
                'PROCNT': protein,
                'NA': sodium
            }

            recipe['recipe']['digest'] = "deleted"
            recipe['recipe']['totalDaily'] = "deleted"

            title.append(recipe['recipe']['label'])
        message = ori_message
        # to return only name, use this; to return full message, comment following line
        message = {"result_reciple_name":title}

    except HTTPError as error:
        sys.exit(
            'Encountered HTTP error {0} on {1}:\n {2}\nAbort program.'.format(
                error.code,
                error.url,
                error.read(),
            )
        )

    # except:
    #     message = "No record"

    # TODO implement
    return {
        'sessionAttributes': sessionAttributes,
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState':'Fulfilled',
            'message': {
                'contentType': "PlainText",
                'content': json.dumps(message)
            }
        }
    }
