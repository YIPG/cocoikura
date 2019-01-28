#!/usr/bin/env python
# coding: utf-8

# In[72]:


import requests
from tqdm import tqdm
import json
from collections import OrderedDict
import pprint
import numpy as np
import os

# 都道府県コードリストの取得
area_code = []
def get_areacode():
    global area_code
    for j in range(1,48):
        if j in range(10):
            area_code.append("0"+str(j))
        else:
            area_code.append(str(j))
    print("都道府県コードリスト取得完了。都道府県コードリストの長さは",len(area_code))

# 市町村コードリストの取得
citycode_list = []
def get_citycode():
    global citycode_list
    for area in tqdm(area_code, desc="市町村コード取得"):
        r = requests.get("http://www.land.mlit.go.jp/webland/api/CitySearch", {"area": area})
        for data in r.json()["data"]:
                    if("id" in data):
                        citycode_list.append(data["id"])
    print("市町村コードリスト取得完了. 市町村コードリストの長さは",len(citycode_list))

#時間かかるやつ
output = {}
def get_pricelist():
    global output
    for area in tqdm(citycode_list, desc="場所ごとの地価平均取得"):
        pricedict_in_area = {}
        for i in tqdm(range(2006, 2019), desc="一年ごと地価取得"):
            payload = {"from": str(i) + '1', "to":str(i) + "4", "city": area}
            r = requests.get('http://www.land.mlit.go.jp/webland/api/TradeListSearch', params=payload)
            area_price = []
            for data in r.json()["data"]:
                if("PricePerUnit" in data):
                    area_price.append(data["PricePerUnit"])
            mean_price = np.mean([int(price) for price in area_price])
            median_price = np.median([int(price) for price in area_price])
            standard_deviation_price = np.std([int(price) for price in area_price])
            pricedict_in_area[i] = {"mean":mean_price, "median": median_price, "std": standard_deviation_price}
        output[area] = pricedict_in_area
        print("市町村コード",area,"の地価取得完了")
    print("地価取得完了. 長さ=",len(output))

# JSON書き出し
def write_json():
    with open(os.getcwd()+'/output.json', mode='w') as f:
        json.dump(output, f, indent=3, sort_keys=True)
    print("書き出し終了！")


# In[71]:


if __name__ == "__main__":
    get_areacode()
    get_citycode()
    get_pricelist()
    write_json()

