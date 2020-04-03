import numpy as np
import os
import json
from flask import Flask, request, jsonify, render_template, redirect
from pymongo import MongoClient
import urllib
import boto3
from time import sleep
import requests
from fastai.vision import *
from pathlib import Path
from time import process_time

s3 = boto3.client(
    's3',
    aws_access_key_id = "enter you access key id here",
    aws_secret_access_key = "enter your secret access key"
)
client = MongoClient("mongodb+srv://harshitshah4:"+urllib.parse.quote("Dntbatman@1")+"@cluster0-vthxa.mongodb.net/test?retryWrites=true&w=majority")
db = client["tasveer"]


bs=64
path = Path(".")
Path("tmp/test").mkdir(parents=True, exist_ok=True)
Path("tmp/train/buildings").mkdir(parents=True, exist_ok=True)
Path("tmp/train/forest").mkdir(parents=True, exist_ok=True)
Path("tmp/train/glacier").mkdir(parents=True, exist_ok=True)
Path("tmp/train/mountain").mkdir(parents=True, exist_ok=True)
Path("tmp/train/sea").mkdir(parents=True, exist_ok=True)
Path("tmp/train/street").mkdir(parents=True, exist_ok=True)

defaults.device = torch.device('cpu')

predictions = []

app = Flask(__name__)
#model = pickle.load(open('export.pkl', 'rb'))
model = load_learner(path, 'export.pkl')

# Prediction
@app.route('/test',methods=["POST"])
def predict():
    data =  request.json
    pids = data.get("posts")
    for post in db["posts"].find({"pid":{"$in":pids}}):
        media = db["media"].find_one({"id":post["image"]})
        s3.download_file("yetasveerkiskihai",media["url"],"tmp/test/"+post["pid"]+".jpg")
    predictions = []
    for img in os.listdir('tmp/test'):
        print(img)
        s = 'tmp/test/'+img
        #print(s)
        image = open_image(s)
        #image.show()
        pred_class, pred_idx, outputs = model.predict(image) # the outputs variable contains the confidence of each class
        print(pred_class)
        confidence = max(outputs).item()

        img = img.replace(".jpg", "")
        #print(type(pred_class))
        #print(str(pred_class))
        prediction = {'pid':img,
                       'pred_class':str(pred_class),
                       'confidence':round(confidence, 4)}
        predictions.append(prediction)

    print(predictions)
    try:
        for img in os.listdir('tmp/test'):
            os.remove(os.path.join(path/'tmp/test/', img))
    except OSError as e:
        print(e)
    requests.post('http://Yetasveerkiskihaiserver-env.eba-mfgmqh2i.ap-south-1.elasticbeanstalk.com/tested', json = predictions)
    return 'hello'
#predict()


# retrain the model
@app.route('/train',methods=["POST","GET"])
def retrain():
    data =  request.json
    pids = data.get("posts")
    #initializing parameters
    parameters = data.get("parameters")
    #print(parameters)
    lr = parameters['learning_rate']
    split_pct = parameters['split_pct']
    epochs = parameters['epochs']

    #downloading data for retraining in tmp/train/
    for post in db["posts"].find({"pid":{"$in":pids}}):
        media = db["media"].find_one({"id":post["image"]})
        s3.download_file("yetasveerkiskihai",media["url"],"tmp/train/"+post["label"]+"/"+post["pid"]+".jpg")

    predictions = []
    bs= int(len(pids)*0.8)
    if bs>64: bs=64
    data_retrain = ImageDataBunch.from_folder(path=path/'tmp/train/', train=".", ds_tfms=get_transforms(),
                                              valid_pct = 0.2, size=256, bs=bs).normalize(imagenet_stats)
    model.data = data_retrain
    tstart = process_time()
    model.fit_one_cycle(epochs, max_lr=slice(lr))
    model.save('retrain1')
    tend = process_time()

    t = tend-tstart
    print(f'Training completed. Total time taken to train is {t}')
    params = {'Training completed. Total time taken to train': t}
    requests.post(url='http://Yetasveerkiskihaiserver-env.eba-mfgmqh2i.ap-south-1.elasticbeanstalk.com/trained', json=params, verify=False)
    #return redirect('/trained')
    try:
        for folder in os.listdir('tmp/train'):
            #print(folder)
            for img in os.listdir(f'tmp/train/{folder}'):
                #print(img)
                os.remove(os.path.join(path/f'tmp/train/{folder}/', img))
    except OSError as e:
        print(e)
    return 'bye'


# send default values of parameters
@app.route('/model',methods=["GET"])
def send_default():
    dict = {'learning_rate':0.003,
            'epochs':2,
            'split_pct':0.2}
    return jsonify(dict)

# run the app.
if __name__ == "__main__":
    app.debug = False
    app.run()
